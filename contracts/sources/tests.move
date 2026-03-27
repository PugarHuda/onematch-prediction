#[test_only]
module onematch::tests {
    use std::string;
    use one::test_scenario::{Self as ts, Scenario};
    use one::clock;
    use one::coin;
    use one::oct::OCT;
    use onematch::prediction_event::{Self, EventRegistry, PredictionEvent, AdminCap};
    use onematch::prediction_escrow::{Self, PendingBet, MatchedDuel, TreasuryConfig};
    use onematch::user_profile::{Self, ProfileRegistry, UserProfile};

    // === Test addresses ===
    const ADMIN: address    = @0xAD;
    const PLAYER_A: address = @0xA1;
    const PLAYER_B: address = @0xB2;
    const MATCHMAKER: address = @0xCC;

    // === Helpers ===

    fun setup_clock(scenario: &mut Scenario): clock::Clock {
        let ctx = ts::ctx(scenario);
        let clk = clock::create_for_testing(ctx);
        clk
    }

    fun make_oct(amount: u64, scenario: &mut Scenario): coin::Coin<OCT> {
        coin::mint_for_testing<OCT>(amount, ts::ctx(scenario))
    }

    // ─────────────────────────────────────────────────────────────────
    // prediction_event tests
    // ─────────────────────────────────────────────────────────────────

    #[test]
    fun test_create_event_ok() {
        let mut scenario = ts::begin(ADMIN);

        // init creates EventRegistry + AdminCap
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);

            let end_time = clock::timestamp_ms(&clk) + 86_400_000; // +1 day
            prediction_event::create_event(
                &mut registry,
                string::utf8(b"Will BTC hit $120k?"),
                string::utf8(b"crypto"),
                end_time,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_settle_event_yes_wins() {
        let mut scenario = ts::begin(ADMIN);
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        let _event_id;
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);
            let end_time = clock::timestamp_ms(&clk) + 1000; // expires in 1s
            let _event_id = prediction_event::create_event(
                &mut registry,
                string::utf8(b"Test event"),
                string::utf8(b"tech"),
                end_time,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let mut clk = setup_clock(&mut scenario);
            // advance past end_time
            clock::set_for_testing(&mut clk, 2000);

            prediction_event::settle(&cap, &mut event, &clk, true);
            assert!(prediction_event::yes_wins(&event), 0);

            clock::destroy_for_testing(clk);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(event);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = prediction_event::EEventNotExpired)]
    fun test_settle_before_expiry_fails() {
        let mut scenario = ts::begin(ADMIN);
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);
            let end_time = clock::timestamp_ms(&clk) + 86_400_000;
            prediction_event::create_event(
                &mut registry,
                string::utf8(b"Test"),
                string::utf8(b"crypto"),
                end_time,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let clk = setup_clock(&mut scenario); // clock at 0, before end_time
            // Should abort with EEventNotExpired
            prediction_event::settle(&cap, &mut event, &clk, true);
            clock::destroy_for_testing(clk);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(event);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_cancel_event_ok() {
        let mut scenario = ts::begin(ADMIN);
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);
            prediction_event::create_event(
                &mut registry,
                string::utf8(b"Cancel me"),
                string::utf8(b"sports"),
                clock::timestamp_ms(&clk) + 86_400_000,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            prediction_event::cancel_event(&cap, &mut event);
            assert!(prediction_event::is_cancelled(&event), 0);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(event);
        };

        ts::end(scenario);
    }

    // ─────────────────────────────────────────────────────────────────
    // prediction_escrow tests
    // ─────────────────────────────────────────────────────────────────

    #[test]
    fun test_place_bet_ok() {
        let mut scenario = ts::begin(ADMIN);
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
            prediction_escrow::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);
            prediction_event::create_event(
                &mut registry,
                string::utf8(b"BTC $120k?"),
                string::utf8(b"crypto"),
                clock::timestamp_ms(&clk) + 86_400_000,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let clk = setup_clock(&mut scenario);
            let stake = make_oct(500_000_000, &mut scenario); // 0.5 OCT
            prediction_escrow::place_bet(
                &mut event,
                true, // YES
                stake,
                MATCHMAKER,
                &clk,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(event);
        };

        // Matchmaker should have received the PendingBet
        ts::next_tx(&mut scenario, MATCHMAKER);
        {
            assert!(ts::has_most_recent_for_address<PendingBet>(MATCHMAKER), 0);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = prediction_escrow::EStakeTooLow)]
    fun test_place_bet_below_min_fails() {
        let mut scenario = ts::begin(ADMIN);
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
            prediction_escrow::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);
            prediction_event::create_event(
                &mut registry,
                string::utf8(b"Test"),
                string::utf8(b"crypto"),
                clock::timestamp_ms(&clk) + 86_400_000,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let clk = setup_clock(&mut scenario);
            let stake = make_oct(1_000, &mut scenario); // 0.000001 OCT — below 0.1 OCT MIN
            prediction_escrow::place_bet(
                &mut event, true, stake, MATCHMAKER, &clk, ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(event);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_match_and_settle_happy_path() {
        let mut scenario = ts::begin(ADMIN);
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
            prediction_escrow::init_for_testing(ts::ctx(&mut scenario));
        };

        // Create event
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);
            prediction_event::create_event(
                &mut registry,
                string::utf8(b"ETH flip?"),
                string::utf8(b"crypto"),
                clock::timestamp_ms(&clk) + 1000,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        // Player A bets YES
        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let clk = setup_clock(&mut scenario);
            let stake = make_oct(10_000_000_000, &mut scenario); // 10 OCT
            prediction_escrow::place_bet(
                &mut event, true, stake, MATCHMAKER, &clk, ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(event);
        };

        // Player B bets NO
        ts::next_tx(&mut scenario, PLAYER_B);
        {
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let clk = setup_clock(&mut scenario);
            let stake = make_oct(10_000_000_000, &mut scenario); // 10 OCT
            prediction_escrow::place_bet(
                &mut event, false, stake, MATCHMAKER, &clk, ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(event);
        };

        // Matchmaker matches the two bets
        ts::next_tx(&mut scenario, MATCHMAKER);
        {
            // take_from_address returns in LIFO order — last placed = first taken
            // Player B placed NO last, so first taken is NO; Player A placed YES first, so second taken is YES
            let bet_no  = ts::take_from_address<PendingBet>(&scenario, MATCHMAKER);
            let bet_yes = ts::take_from_address<PendingBet>(&scenario, MATCHMAKER);
            let clk = setup_clock(&mut scenario);
            prediction_escrow::match_bets(bet_yes, bet_no, &clk, ts::ctx(&mut scenario));
            clock::destroy_for_testing(clk);
        };

        // Admin settles event (YES wins)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let mut clk = setup_clock(&mut scenario);
            clock::set_for_testing(&mut clk, 2000); // past end_time
            prediction_event::settle(&cap, &mut event, &clk, true);
            clock::destroy_for_testing(clk);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(event);
        };

        // Settle duel — Player A should receive ~19 OCT
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut duel = ts::take_shared<MatchedDuel>(&scenario);
            let event = ts::take_shared<PredictionEvent>(&scenario);
            let treasury = ts::take_shared<TreasuryConfig>(&scenario);
            prediction_escrow::settle_duel(
                &mut duel, &event, &treasury, ts::ctx(&mut scenario),
            );
            assert!(prediction_escrow::duel_settled(&duel), 0);
            ts::return_shared(duel);
            ts::return_shared(event);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = prediction_escrow::EUnequalStakes)]
    fun test_match_unequal_stakes_fails() {
        let mut scenario = ts::begin(ADMIN);
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
            prediction_escrow::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);
            prediction_event::create_event(
                &mut registry,
                string::utf8(b"Test"),
                string::utf8(b"crypto"),
                clock::timestamp_ms(&clk) + 86_400_000,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let clk = setup_clock(&mut scenario);
            let stake = make_oct(10_000_000_000, &mut scenario); // 10 OCT
            prediction_escrow::place_bet(&mut event, true, stake, MATCHMAKER, &clk, ts::ctx(&mut scenario));
            clock::destroy_for_testing(clk);
            ts::return_shared(event);
        };

        ts::next_tx(&mut scenario, PLAYER_B);
        {
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let clk = setup_clock(&mut scenario);
            let stake = make_oct(5_000_000_000, &mut scenario); // 5 OCT — different!
            prediction_escrow::place_bet(&mut event, false, stake, MATCHMAKER, &clk, ts::ctx(&mut scenario));
            clock::destroy_for_testing(clk);
            ts::return_shared(event);
        };

        ts::next_tx(&mut scenario, MATCHMAKER);
        {
            let bet_no  = ts::take_from_address<PendingBet>(&scenario, MATCHMAKER);
            let bet_yes = ts::take_from_address<PendingBet>(&scenario, MATCHMAKER);
            let clk = setup_clock(&mut scenario);
            // Should abort EUnequalStakes
            prediction_escrow::match_bets(bet_yes, bet_no, &clk, ts::ctx(&mut scenario));
            clock::destroy_for_testing(clk);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_cancel_bet_refund() {
        let mut scenario = ts::begin(ADMIN);
        {
            prediction_event::init_for_testing(ts::ctx(&mut scenario));
            prediction_escrow::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = ts::take_shared<EventRegistry>(&scenario);
            let clk = setup_clock(&mut scenario);
            prediction_event::create_event(
                &mut registry,
                string::utf8(b"Test"),
                string::utf8(b"crypto"),
                clock::timestamp_ms(&clk) + 86_400_000,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clk);
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut event = ts::take_shared<PredictionEvent>(&scenario);
            let clk = setup_clock(&mut scenario);
            let stake = make_oct(5_000_000_000, &mut scenario);
            prediction_escrow::place_bet(&mut event, true, stake, MATCHMAKER, &clk, ts::ctx(&mut scenario));
            clock::destroy_for_testing(clk);
            ts::return_shared(event);
        };

        // Matchmaker cancels the bet (player can also cancel)
        ts::next_tx(&mut scenario, MATCHMAKER);
        {
            let bet = ts::take_from_address<PendingBet>(&scenario, MATCHMAKER);
            let clk = setup_clock(&mut scenario);
            // Cancel as the matchmaker acting on behalf — use expired path by advancing clock
            // For simplicity, test player cancels directly
            clock::destroy_for_testing(clk);
            ts::return_to_address(MATCHMAKER, bet);
        };

        // Player A cancels their own bet
        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let bet = ts::take_from_address<PendingBet>(&scenario, MATCHMAKER);
            let clk = setup_clock(&mut scenario);
            prediction_escrow::cancel_bet(bet, &clk, ts::ctx(&mut scenario));
            clock::destroy_for_testing(clk);
        };

        ts::end(scenario);
    }

    // ─────────────────────────────────────────────────────────────────
    // user_profile tests
    // ─────────────────────────────────────────────────────────────────

    #[test]
    fun test_create_profile_ok() {
        let mut scenario = ts::begin(PLAYER_A);
        {
            user_profile::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut registry = ts::take_shared<ProfileRegistry>(&scenario);
            user_profile::create_profile(
                &mut registry,
                string::utf8(b"crypto_degen"),
                string::utf8(b""),
                string::utf8(b"crypto"),
                ts::ctx(&mut scenario),
            );
            assert!(user_profile::has_profile(&registry, PLAYER_A), 0);
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = user_profile::EProfileExists)]
    fun test_create_duplicate_profile_fails() {
        let mut scenario = ts::begin(PLAYER_A);
        {
            user_profile::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut registry = ts::take_shared<ProfileRegistry>(&scenario);
            user_profile::create_profile(
                &mut registry,
                string::utf8(b"first_user"),
                string::utf8(b""),
                string::utf8(b"crypto"),
                ts::ctx(&mut scenario),
            );
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut registry = ts::take_shared<ProfileRegistry>(&scenario);
            // Should abort EProfileExists
            user_profile::create_profile(
                &mut registry,
                string::utf8(b"second_try"),
                string::utf8(b""),
                string::utf8(b"tech"),
                ts::ctx(&mut scenario),
            );
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = user_profile::EUsernameTooShort)]
    fun test_username_too_short_fails() {
        let mut scenario = ts::begin(PLAYER_A);
        {
            user_profile::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut registry = ts::take_shared<ProfileRegistry>(&scenario);
            user_profile::create_profile(
                &mut registry,
                string::utf8(b"ab"), // 2 chars — below MIN_USERNAME_LEN=3
                string::utf8(b""),
                string::utf8(b"crypto"),
                ts::ctx(&mut scenario),
            );
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_record_win_updates_stats() {
        let mut scenario = ts::begin(PLAYER_A);
        {
            user_profile::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut registry = ts::take_shared<ProfileRegistry>(&scenario);
            user_profile::create_profile(
                &mut registry,
                string::utf8(b"winner"),
                string::utf8(b""),
                string::utf8(b"crypto"),
                ts::ctx(&mut scenario),
            );
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut profile = ts::take_from_sender<UserProfile>(&scenario);
            user_profile::record_win(&mut profile, 19_000_000_000, 10_000_000_000);
            assert!(user_profile::streak(&profile) == 1, 0);
            assert!(user_profile::total_duels(&profile) == 1, 1);
            ts::return_to_sender(&scenario, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_record_loss_resets_streak() {
        let mut scenario = ts::begin(PLAYER_A);
        {
            user_profile::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut registry = ts::take_shared<ProfileRegistry>(&scenario);
            user_profile::create_profile(
                &mut registry,
                string::utf8(b"loser"),
                string::utf8(b""),
                string::utf8(b"crypto"),
                ts::ctx(&mut scenario),
            );
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut profile = ts::take_from_sender<UserProfile>(&scenario);
            // Win twice first
            user_profile::record_win(&mut profile, 19_000_000_000, 10_000_000_000);
            user_profile::record_win(&mut profile, 19_000_000_000, 10_000_000_000);
            assert!(user_profile::streak(&profile) == 2, 0);
            // Then lose
            user_profile::record_loss(&mut profile, 10_000_000_000);
            assert!(user_profile::streak(&profile) == 0, 1);
            assert!(user_profile::total_duels(&profile) == 3, 2);
            ts::return_to_sender(&scenario, profile);
        };

        ts::end(scenario);
    }
}
