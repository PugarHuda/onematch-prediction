module onematch::prediction_escrow {
    use one::coin::{Self, Coin};
    use one::oct::OCT;
    use one::balance::{Self, Balance};
    use one::event as one_event;
    use one::clock::Clock;
    use onematch::prediction_event::{Self, PredictionEvent};

    // === Errors ===
    const EWrongPosition: u64 = 0;
    const EAlreadyMatched: u64 = 1;
    const ENotSettled: u64 = 2;
    const EWrongEscrow: u64 = 3;
    const EEventClosed: u64 = 4;
    const EEventExpired: u64 = 6;
    const EStakeTooLow: u64 = 7;
    const EStakeTooHigh: u64 = 8;
    const EUnequalStakes: u64 = 9;
    const EBetExpired: u64 = 10;

    // === Constants ===
    const MIN_STAKE: u64 = 100_000_000;          // 0.1 OCT
    const MAX_STAKE: u64 = 10_000_000_000_000;   // 10,000 OCT
    const BET_EXPIRY_MS: u64 = 86_400_000;      // 24 hours

    // === Structs ===

    /// Treasury config — holds platform fee destination (shared object)
    public struct TreasuryConfig has key {
        id: UID,
        treasury: address,
    }

    /// A pending bet waiting for a match (owned by matchmaking service)
    public struct PendingBet has key, store {
        id: UID,
        event_id: ID,
        player: address,
        position: bool,      // true=YES, false=NO
        stake: Balance<OCT>,
        expires_at: u64,     // unix ms — auto-cancel after 24h
    }

    /// A matched duel — both players locked in (shared object)
    public struct MatchedDuel has key {
        id: UID,
        event_id: ID,
        player_yes: address,
        player_no: address,
        stake_yes: Balance<OCT>,
        stake_no: Balance<OCT>,
        settled: bool,
    }

    // === Events ===

    public struct BetPlaced has copy, drop {
        bet_id: ID,
        event_id: ID,
        player: address,
        position: bool,
        amount: u64,
    }

    public struct DuelMatched has copy, drop {
        duel_id: ID,
        event_id: ID,
        player_yes: address,
        player_no: address,
        total_pot: u64,
    }

    public struct DuelSettled has copy, drop {
        duel_id: ID,
        winner: address,
        amount: u64,
        fee: u64,
    }

    public struct BetCancelled has copy, drop {
        bet_id: ID,
        player: address,
        amount: u64,
    }

    // === Init ===

    fun init(ctx: &mut TxContext) {
        // Treasury defaults to deployer address
        let config = TreasuryConfig {
            id: object::new(ctx),
            treasury: ctx.sender(),
        };
        transfer::share_object(config);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) { init(ctx); }

    // expose error codes for tests
    #[test_only] public fun e_stake_too_low(): u64 { EStakeTooLow }
    #[test_only] public fun e_unequal_stakes(): u64 { EUnequalStakes }
    #[test_only] public fun e_event_closed(): u64 { EEventClosed }

    // === Public Functions ===

    /// Player places a bet — creates a PendingBet sent to matchmaking service
    public fun place_bet(
        event: &mut PredictionEvent,
        position: bool,
        stake: Coin<OCT>,
        matchmaker: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ): ID {
        assert!(prediction_event::is_open(event), EEventClosed);
        assert!(one::clock::timestamp_ms(clock) < prediction_event::end_time(event), EEventExpired);

        let amount = coin::value(&stake);
        assert!(amount >= MIN_STAKE, EStakeTooLow);
        assert!(amount <= MAX_STAKE, EStakeTooHigh);

        let event_id = prediction_event::event_id(event);

        if (position) {
            prediction_event::increment_yes(event, clock);
        } else {
            prediction_event::increment_no(event, clock);
        };

        let expires_at = one::clock::timestamp_ms(clock) + BET_EXPIRY_MS;

        let bet = PendingBet {
            id: object::new(ctx),
            event_id,
            player: ctx.sender(),
            position,
            stake: coin::into_balance(stake),
            expires_at,
        };
        let bet_id = object::id(&bet);
        one_event::emit(BetPlaced {
            bet_id,
            event_id,
            player: ctx.sender(),
            position,
            amount,
        });
        transfer::transfer(bet, matchmaker);
        bet_id
    }

    /// Matchmaking service matches two opposing bets into a shared duel
    public fun match_bets(
        bet_yes: PendingBet,
        bet_no: PendingBet,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(bet_yes.position == true, EWrongPosition);
        assert!(bet_no.position == false, EWrongPosition);
        assert!(bet_yes.event_id == bet_no.event_id, EWrongEscrow);

        let now = one::clock::timestamp_ms(clock);
        assert!(now <= bet_yes.expires_at, EBetExpired);
        assert!(now <= bet_no.expires_at, EBetExpired);

        let yes_amount = balance::value(&bet_yes.stake);
        let no_amount = balance::value(&bet_no.stake);
        assert!(yes_amount == no_amount, EUnequalStakes);

        let total_pot = yes_amount + no_amount;
        let event_id = bet_yes.event_id;
        let player_yes = bet_yes.player;
        let player_no = bet_no.player;

        let PendingBet { id: id_yes, event_id: _, player: _, position: _, stake: stake_yes, expires_at: _ } = bet_yes;
        let PendingBet { id: id_no,  event_id: _, player: _, position: _, stake: stake_no,  expires_at: _ } = bet_no;
        object::delete(id_yes);
        object::delete(id_no);

        let duel = MatchedDuel {
            id: object::new(ctx),
            event_id,
            player_yes,
            player_no,
            stake_yes,
            stake_no,
            settled: false,
        };
        let duel_id = object::id(&duel);
        one_event::emit(DuelMatched {
            duel_id,
            event_id,
            player_yes,
            player_no,
            total_pot,
        });
        transfer::share_object(duel);
    }

    /// Settle duel after event is resolved — pays winner, sends fee to treasury
    public fun settle_duel(
        duel: &mut MatchedDuel,
        event: &PredictionEvent,
        treasury: &TreasuryConfig,
        ctx: &mut TxContext,
    ) {
        assert!(!duel.settled, EAlreadyMatched);
        assert!(
            onematch::prediction_event::yes_wins(event) ||
            onematch::prediction_event::no_wins(event),
            ENotSettled
        );
        assert!(duel.event_id == onematch::prediction_event::event_id(event), EWrongEscrow);

        duel.settled = true;

        let yes_amount = balance::value(&duel.stake_yes);
        let no_amount  = balance::value(&duel.stake_no);
        let total = yes_amount + no_amount;

        // 5% platform fee → treasury, 95% → winner
        let fee = total / 20;
        let winner_amount = total - fee;

        if (onematch::prediction_event::yes_wins(event)) {
            let mut winner_stake = balance::withdraw_all(&mut duel.stake_yes);
            let loser_stake = balance::withdraw_all(&mut duel.stake_no);
            balance::join(&mut winner_stake, loser_stake);

            let fee_coin = coin::from_balance(balance::split(&mut winner_stake, fee), ctx);
            transfer::public_transfer(fee_coin, treasury.treasury);

            let winner_coin = coin::from_balance(winner_stake, ctx);
            one_event::emit(DuelSettled {
                duel_id: object::id(duel),
                winner: duel.player_yes,
                amount: winner_amount,
                fee,
            });
            transfer::public_transfer(winner_coin, duel.player_yes);
        } else {
            let mut winner_stake = balance::withdraw_all(&mut duel.stake_no);
            let loser_stake = balance::withdraw_all(&mut duel.stake_yes);
            balance::join(&mut winner_stake, loser_stake);

            let fee_coin = coin::from_balance(balance::split(&mut winner_stake, fee), ctx);
            transfer::public_transfer(fee_coin, treasury.treasury);

            let winner_coin = coin::from_balance(winner_stake, ctx);
            one_event::emit(DuelSettled {
                duel_id: object::id(duel),
                winner: duel.player_no,
                amount: winner_amount,
                fee,
            });
            transfer::public_transfer(winner_coin, duel.player_no);
        }
    }

    /// Cancel pending bet and refund — player can cancel anytime, anyone can cancel expired bets
    public fun cancel_bet(
        bet: PendingBet,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let now = one::clock::timestamp_ms(clock);
        let is_expired = now > bet.expires_at;
        let is_player  = ctx.sender() == bet.player;
        assert!(is_player || is_expired, EWrongEscrow);

        let amount = balance::value(&bet.stake);
        let player = bet.player;
        let bet_id = object::id(&bet);
        let PendingBet { id, event_id: _, player: _, position: _, stake, expires_at: _ } = bet;
        object::delete(id);
        let refund = coin::from_balance(stake, ctx);
        one_event::emit(BetCancelled { bet_id, player, amount });
        transfer::public_transfer(refund, player);
    }

    // === Accessors ===
    public fun duel_event_id(duel: &MatchedDuel): ID { duel.event_id }
    public fun duel_player_yes(duel: &MatchedDuel): address { duel.player_yes }
    public fun duel_player_no(duel: &MatchedDuel): address { duel.player_no }
    public fun duel_settled(duel: &MatchedDuel): bool { duel.settled }
    public fun duel_pot(duel: &MatchedDuel): u64 {
        balance::value(&duel.stake_yes) + balance::value(&duel.stake_no)
    }
    public fun treasury_address(config: &TreasuryConfig): address { config.treasury }
}
