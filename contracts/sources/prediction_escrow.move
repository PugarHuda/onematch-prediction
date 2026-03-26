module onematch::prediction_escrow {
    use one::object::{Self, UID, ID};
    use one::tx_context::TxContext;
    use one::transfer;
    use one::coin::{Self, Coin};
    use one::oct::OCT;
    use one::balance::{Self, Balance};
    use one::event as one_event;
    use onematch::prediction_event::{PredictionEvent};

    // === Errors ===
    const EWrongPosition: u64 = 0;
    const EAlreadyMatched: u64 = 1;
    const ENotSettled: u64 = 2;
    const EWrongEscrow: u64 = 3;
    const EEventClosed: u64 = 4;
    const ENotParticipant: u64 = 5;

    // === Structs ===

    /// A pending bet waiting for a match (owned by matchmaking service)
    public struct PendingBet has key, store {
        id: UID,
        event_id: ID,
        player: address,
        position: bool,       // true=YES, false=NO
        stake: Balance<OCT>,
    }

    /// A matched duel - both players locked in (shared object)
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
    }

    // === Public Functions ===

    /// Player places a bet, creates a PendingBet sent to matchmaking service
    public fun place_bet(
        event: &PredictionEvent,
        position: bool,
        stake: Coin<OCT>,
        matchmaker: address,
        ctx: &mut TxContext,
    ): ID {
        assert!(onematch::prediction_event::is_open(event), EEventClosed);
        let event_id = onematch::prediction_event::event_id(event);
        let amount = coin::value(&stake);
        let bet = PendingBet {
            id: object::new(ctx),
            event_id,
            player: ctx.sender(),
            position,
            stake: coin::into_balance(stake),
        };
        let bet_id = object::id(&bet);
        one_event::emit(BetPlaced {
            bet_id,
            event_id,
            player: ctx.sender(),
            position,
            amount,
        });
        // Transfer to matchmaking service address
        transfer::transfer(bet, matchmaker);
        bet_id
    }

    /// Matchmaking service matches two opposing bets into a shared duel
    public fun match_bets(
        bet_yes: PendingBet,
        bet_no: PendingBet,
        ctx: &mut TxContext,
    ) {
        assert!(bet_yes.position == true, EWrongPosition);
        assert!(bet_no.position == false, EWrongPosition);
        assert!(bet_yes.event_id == bet_no.event_id, EWrongEscrow);

        let total_pot = balance::value(&bet_yes.stake) + balance::value(&bet_no.stake);
        let event_id = bet_yes.event_id;
        let player_yes = bet_yes.player;
        let player_no = bet_no.player;

        let PendingBet { id: id_yes, event_id: _, player: _, position: _, stake: stake_yes } = bet_yes;
        let PendingBet { id: id_no, event_id: _, player: _, position: _, stake: stake_no } = bet_no;
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

    /// Settle duel after event is resolved
    public fun settle_duel(
        duel: &mut MatchedDuel,
        event: &PredictionEvent,
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
        let no_amount = balance::value(&duel.stake_no);
        let total = yes_amount + no_amount;

        // 5% platform fee, 95% to winner
        let fee = total / 20;
        let winner_amount = total - fee;

        if (onematch::prediction_event::yes_wins(event)) {
            // YES player wins
            let winner_stake = balance::withdraw_all(&mut duel.stake_yes);
            let loser_stake = balance::withdraw_all(&mut duel.stake_no);
            balance::join(&mut winner_stake, loser_stake);

            // deduct fee
            let fee_balance = balance::split(&mut winner_stake, fee);
            // burn fee (or send to treasury - simplified here)
            let fee_coin = coin::from_balance(fee_balance, ctx);
            transfer::public_transfer(fee_coin, @0x0); // treasury placeholder

            let winner_coin = coin::from_balance(winner_stake, ctx);
            one_event::emit(DuelSettled {
                duel_id: object::id(duel),
                winner: duel.player_yes,
                amount: winner_amount,
            });
            transfer::public_transfer(winner_coin, duel.player_yes);
        } else {
            // NO player wins
            let winner_stake = balance::withdraw_all(&mut duel.stake_no);
            let loser_stake = balance::withdraw_all(&mut duel.stake_yes);
            balance::join(&mut winner_stake, loser_stake);

            let fee_balance = balance::split(&mut winner_stake, fee);
            let fee_coin = coin::from_balance(fee_balance, ctx);
            transfer::public_transfer(fee_coin, @0x0);

            let winner_coin = coin::from_balance(winner_stake, ctx);
            one_event::emit(DuelSettled {
                duel_id: object::id(duel),
                winner: duel.player_no,
                amount: winner_amount,
            });
            transfer::public_transfer(winner_coin, duel.player_no);
        }
    }

    /// Cancel pending bet and refund (if not matched yet)
    public fun cancel_bet(
        bet: PendingBet,
        ctx: &mut TxContext,
    ) {
        let PendingBet { id, event_id: _, player, position: _, stake } = bet;
        object::delete(id);
        let refund = coin::from_balance(stake, ctx);
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
}
