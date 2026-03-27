module onematch::user_profile {
    use std::string::{Self, String};
    use one::table::{Self, Table};
    use one::event as one_event;

    // === Errors ===
    const EProfileExists: u64 = 0;
    const EUsernameTooShort: u64 = 2;
    const EUsernameTooLong: u64 = 3;

    // === Constants ===
    const MIN_USERNAME_LEN: u64 = 3;
    const MAX_USERNAME_LEN: u64 = 20;

    // === Structs ===

    /// Global registry mapping address → profile ID
    public struct ProfileRegistry has key {
        id: UID,
        profiles: Table<address, ID>,
        total_users: u64,
    }

    /// User profile - owned by user
    public struct UserProfile has key {
        id: UID,
        owner: address,
        username: String,
        avatar_url: String,
        // Stats
        total_duels: u64,
        wins: u64,
        losses: u64,
        total_staked: u64,   // in MIST (1 OCT = 1_000_000_000 MIST)
        total_earned: u64,
        // Reputation
        reputation: u64,
        current_streak: u64,
        best_streak: u64,
        // Categories preference
        favorite_category: String,
    }

    // === Events ===

    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address,
        username: String,
    }

    // === Init ===

    fun init(ctx: &mut TxContext) {
        let registry = ProfileRegistry {
            id: object::new(ctx),
            profiles: table::new(ctx),
            total_users: 0,
        };
        transfer::share_object(registry);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) { init(ctx); }

    // expose error codes for tests
    #[test_only] public fun e_profile_exists(): u64 { EProfileExists }
    #[test_only] public fun e_username_too_short(): u64 { EUsernameTooShort }
    #[test_only] public fun e_username_too_long(): u64 { EUsernameTooLong }

    // === Public Functions ===

    public fun create_profile(
        registry: &mut ProfileRegistry,
        username: String,
        avatar_url: String,
        favorite_category: String,
        ctx: &mut TxContext,
    ) {
        let sender = ctx.sender();
        assert!(!table::contains(&registry.profiles, sender), EProfileExists);
        
        // Validate username length
        let len = string::length(&username);
        assert!(len >= MIN_USERNAME_LEN, EUsernameTooShort);
        assert!(len <= MAX_USERNAME_LEN, EUsernameTooLong);

        let profile = UserProfile {
            id: object::new(ctx),
            owner: sender,
            username,
            avatar_url,
            total_duels: 0,
            wins: 0,
            losses: 0,
            total_staked: 0,
            total_earned: 0,
            reputation: 100, // start at 100
            current_streak: 0,
            best_streak: 0,
            favorite_category,
        };
        let profile_id = object::id(&profile);
        table::add(&mut registry.profiles, sender, profile_id);
        registry.total_users = registry.total_users + 1;

        one_event::emit(ProfileCreated {
            profile_id,
            owner: sender,
            username: profile.username,
        });

        transfer::transfer(profile, sender);
    }

    /// Called after a duel settles - update winner stats
    public fun record_win(
        profile: &mut UserProfile,
        amount_earned: u64,
        stake_amount: u64,
    ) {
        profile.total_duels = profile.total_duels + 1;
        profile.wins = profile.wins + 1;
        profile.total_staked = profile.total_staked + stake_amount;
        profile.total_earned = profile.total_earned + amount_earned;
        profile.current_streak = profile.current_streak + 1;
        if (profile.current_streak > profile.best_streak) {
            profile.best_streak = profile.current_streak;
        };
        // Reputation: +10 per win, +5 bonus per 5-streak
        profile.reputation = profile.reputation + 10;
        if (profile.current_streak % 5 == 0) {
            profile.reputation = profile.reputation + 5;
        };
    }

    /// Called after a duel settles - update loser stats
    public fun record_loss(
        profile: &mut UserProfile,
        stake_amount: u64,
    ) {
        profile.total_duels = profile.total_duels + 1;
        profile.losses = profile.losses + 1;
        profile.total_staked = profile.total_staked + stake_amount;
        profile.current_streak = 0;
        // Reputation: +2 for participation
        profile.reputation = profile.reputation + 2;
    }

    // === Accessors ===
    public fun win_rate(profile: &UserProfile): u64 {
        if (profile.total_duels == 0) { return 0 };
        (profile.wins * 100) / profile.total_duels
    }
    public fun reputation(profile: &UserProfile): u64 { profile.reputation }
    public fun streak(profile: &UserProfile): u64 { profile.current_streak }
    public fun total_duels(profile: &UserProfile): u64 { profile.total_duels }
    public fun username(profile: &UserProfile): &String { &profile.username }
    public fun owner(profile: &UserProfile): address { profile.owner }
    public fun has_profile(registry: &ProfileRegistry, addr: address): bool {
        table::contains(&registry.profiles, addr)
    }
}
