module onematch::prediction_event {
    use std::string::String;
    use one::clock::Clock;

    // === Errors ===
    const EEventNotOpen: u64 = 0;
    const EEventNotExpired: u64 = 1;
    const EEventExpired: u64 = 3;

    // === Structs ===

    /// Shared registry of all events
    public struct EventRegistry has key {
        id: UID,
        event_count: u64,
    }

    /// A single prediction event
    public struct PredictionEvent has key, store {
        id: UID,
        question: String,
        category: String,       // "crypto" | "sports" | "politics" | "tech"
        end_time: u64,          // unix ms
        creator: address,
        status: u8,             // 0=open, 1=settled_yes, 2=settled_no, 3=cancelled
        yes_count: u64,
        no_count: u64,
    }

    /// Admin cap for settling events
    public struct AdminCap has key, store {
        id: UID,
    }

    // === Init ===

    fun init(ctx: &mut TxContext) {
        let registry = EventRegistry {
            id: object::new(ctx),
            event_count: 0,
        };
        transfer::share_object(registry);

        let admin = AdminCap { id: object::new(ctx) };
        transfer::transfer(admin, ctx.sender());
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) { init(ctx); }

    // expose error codes for tests
    #[test_only] public fun e_event_not_open(): u64 { EEventNotOpen }
    #[test_only] public fun e_event_not_expired(): u64 { EEventNotExpired }
    #[test_only] public fun e_event_expired(): u64 { EEventExpired }

    // === Public Functions ===

    public fun create_event(
        registry: &mut EventRegistry,
        question: String,
        category: String,
        end_time: u64,
        ctx: &mut TxContext,
    ): ID {
        registry.event_count = registry.event_count + 1;
        let event = PredictionEvent {
            id: object::new(ctx),
            question,
            category,
            end_time,
            creator: ctx.sender(),
            status: 0,
            yes_count: 0,
            no_count: 0,
        };
        let event_id = object::id(&event);
        transfer::share_object(event);
        event_id
    }

    public fun increment_yes(event: &mut PredictionEvent, clock: &Clock) {
        assert!(event.status == 0, EEventNotOpen);
        assert!(one::clock::timestamp_ms(clock) < event.end_time, EEventExpired);
        event.yes_count = event.yes_count + 1;
    }

    public fun increment_no(event: &mut PredictionEvent, clock: &Clock) {
        assert!(event.status == 0, EEventNotOpen);
        assert!(one::clock::timestamp_ms(clock) < event.end_time, EEventExpired);
        event.no_count = event.no_count + 1;
    }

    public fun decrement_yes(event: &mut PredictionEvent) {
        if (event.yes_count > 0) {
            event.yes_count = event.yes_count - 1;
        }
    }

    public fun decrement_no(event: &mut PredictionEvent) {
        if (event.no_count > 0) {
            event.no_count = event.no_count - 1;
        }
    }

    /// Admin settles the event with result
    public fun settle(
        _cap: &AdminCap,
        event: &mut PredictionEvent,
        clock: &Clock,
        result: bool, // true = YES wins, false = NO wins
    ) {
        assert!(event.status == 0, EEventNotOpen);
        assert!(one::clock::timestamp_ms(clock) >= event.end_time, EEventNotExpired);
        if (result) {
            event.status = 1; // YES wins
        } else {
            event.status = 2; // NO wins
        }
    }
    
    /// Admin cancels an event (emergency only)
    public fun cancel_event(
        _cap: &AdminCap,
        event: &mut PredictionEvent,
    ) {
        assert!(event.status == 0, EEventNotOpen);
        event.status = 3; // cancelled
    }

    // === Accessors ===

    public fun is_open(event: &PredictionEvent): bool { event.status == 0 }
    public fun yes_wins(event: &PredictionEvent): bool { event.status == 1 }
    public fun no_wins(event: &PredictionEvent): bool { event.status == 2 }
    public fun is_cancelled(event: &PredictionEvent): bool { event.status == 3 }
    public fun status(event: &PredictionEvent): u8 { event.status }
    public fun end_time(event: &PredictionEvent): u64 { event.end_time }
    public fun event_id(event: &PredictionEvent): ID { object::id(event) }
    public fun question(event: &PredictionEvent): &String { &event.question }
    public fun category(event: &PredictionEvent): &String { &event.category }
    public fun yes_count(event: &PredictionEvent): u64 { event.yes_count }
    public fun no_count(event: &PredictionEvent): u64 { event.no_count }
}
