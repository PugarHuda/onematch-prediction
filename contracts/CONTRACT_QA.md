# Smart Contract QA & Testing Report

## 📋 Contract Overview

### 1. prediction_event.move
**Purpose:** Manages prediction events lifecycle
**Key Functions:**
- `create_event()` - Create new prediction event
- `increment_yes/no()` - Track vote counts
- `settle()` - Admin settles event with result
- Accessors for event state

### 2. prediction_escrow.move
**Purpose:** Handles P2P betting escrow and matching
**Key Functions:**
- `place_bet()` - Player places bet, creates PendingBet
- `match_bets()` - Matchmaker pairs opposing bets
- `settle_duel()` - Distributes winnings after event settles
- `cancel_bet()` - Refund unmatched bets

### 3. user_profile.move
**Purpose:** User reputation and stats tracking
**Key Functions:**
- `create_profile()` - Initialize user profile
- `record_win/loss()` - Update stats after duel
- Reputation system with streaks

---

## 🔍 QA Findings

### ✅ STRENGTHS

1. **Security**
   - ✅ Proper access control with AdminCap
   - ✅ Assert checks for state validation
   - ✅ Balance safety with Move's type system
   - ✅ No reentrancy issues (Move prevents this)

2. **Logic**
   - ✅ Clear state transitions (open → settled)
   - ✅ Proper event emission for indexing
   - ✅ Escrow pattern correctly implemented
   - ✅ Fee calculation (5% platform, 95% winner)

3. **Data Structures**
   - ✅ Efficient use of shared objects
   - ✅ Proper ownership model
   - ✅ Table for registry lookups

### ⚠️ ISSUES FOUND

#### 🔴 CRITICAL

1. **Missing Clock Check in place_bet()**
   - **Issue:** No validation that event hasn't expired
   - **Impact:** Users can bet on expired events
   - **Fix:** Add clock parameter and check `clock.timestamp_ms() < event.end_time`

2. **No Stake Amount Validation**
   - **Issue:** No minimum/maximum stake limits
   - **Impact:** Could allow dust attacks or excessive stakes
   - **Fix:** Add MIN_STAKE and MAX_STAKE constants

3. **Matchmaking Centralization Risk**
   - **Issue:** PendingBet sent to single matchmaker address
   - **Impact:** Single point of failure, trust required
   - **Fix:** Consider shared object pool or decentralized matching

#### 🟡 MEDIUM

4. **No Timeout for PendingBets**
   - **Issue:** Bets can stay unmatched forever
   - **Impact:** Funds locked if no opponent found
   - **Fix:** Add expiry timestamp to PendingBet

5. **Unequal Stakes Allowed**
   - **Issue:** match_bets() doesn't check if stakes are equal
   - **Impact:** Unfair duels (100 OCT vs 10 OCT)
   - **Fix:** Add stake equality check or ratio limits

6. **Treasury Address Hardcoded**
   - **Issue:** Fee sent to @0x0 (burn address)
   - **Impact:** Fees are lost, not collected
   - **Fix:** Add treasury address to registry or admin cap

7. **No Event Count Increment Tracking**
   - **Issue:** increment_yes/no don't update event in escrow
   - **Impact:** Vote counts might be inaccurate
   - **Fix:** Call these from place_bet() or remove them

#### 🟢 LOW

8. **Missing Profile Update in settle_duel()**
   - **Issue:** settle_duel() doesn't call record_win/loss
   - **Impact:** Stats not auto-updated
   - **Fix:** Either integrate or document manual update needed

9. **No Username Validation**
   - **Issue:** Username can be empty or too long
   - **Impact:** Poor UX, potential abuse
   - **Fix:** Add length checks (3-20 chars)

10. **Missing Event Cancellation**
    - **Issue:** No way to cancel event if needed
    - **Impact:** Bad events stay forever
    - **Fix:** Add cancel_event() with AdminCap

---

## 🔧 Recommended Fixes

### Priority 1 (Critical - Must Fix Before Deploy)

**1. Add Clock Check to place_bet()**
```move
public fun place_bet(
    event: &PredictionEvent,
    position: bool,
    stake: Coin<OCT>,
    matchmaker: address,
    clock: &Clock,  // ADD THIS
    ctx: &mut TxContext,
): ID {
    assert!(onematch::prediction_event::is_open(event), EEventClosed);
    // ADD THIS CHECK
    assert!(one::clock::timestamp_ms(clock) < onematch::prediction_event::end_time(event), EEventExpired);
    // ... rest of function
}
```

**2. Add Stake Validation**
```move
const MIN_STAKE: u64 = 1_000_000_000; // 1 OCT
const MAX_STAKE: u64 = 10_000_000_000_000; // 10,000 OCT

public fun place_bet(...) {
    let amount = coin::value(&stake);
    assert!(amount >= MIN_STAKE, EStakeTooLow);
    assert!(amount <= MAX_STAKE, EStakeTooHigh);
    // ...
}
```

**3. Add Stake Equality Check in match_bets()**
```move
public fun match_bets(
    bet_yes: PendingBet,
    bet_no: PendingBet,
    ctx: &mut TxContext,
) {
    // ... existing checks
    let yes_amount = balance::value(&bet_yes.stake);
    let no_amount = balance::value(&bet_no.stake);
    assert!(yes_amount == no_amount, EUnequalStakes);
    // ...
}
```

### Priority 2 (Important - Should Fix)

**4. Add Expiry to PendingBet**
```move
public struct PendingBet has key, store {
    id: UID,
    event_id: ID,
    player: address,
    position: bool,
    stake: Balance<OCT>,
    expires_at: u64,  // ADD THIS
}
```

**5. Fix Treasury Address**
```move
// In EventRegistry or separate TreasuryConfig
public struct TreasuryConfig has key {
    id: UID,
    treasury_address: address,
}

// Use in settle_duel
transfer::public_transfer(fee_coin, treasury_config.treasury_address);
```

**6. Add Username Validation**
```move
const MIN_USERNAME_LEN: u64 = 3;
const MAX_USERNAME_LEN: u64 = 20;

public fun create_profile(...) {
    let len = string::length(&username);
    assert!(len >= MIN_USERNAME_LEN, EUsernameTooShort);
    assert!(len <= MAX_USERNAME_LEN, EUsernameTooLong);
    // ...
}
```

### Priority 3 (Nice to Have)

**7. Add Event Cancellation**
```move
public fun cancel_event(
    _cap: &AdminCap,
    event: &mut PredictionEvent,
) {
    assert!(event.status == 0, EEventNotOpen);
    event.status = 3; // cancelled
}
```

**8. Integrate Profile Updates**
```move
// Option A: Make settle_duel take profiles
public fun settle_duel(
    duel: &mut MatchedDuel,
    event: &PredictionEvent,
    winner_profile: &mut UserProfile,
    loser_profile: &mut UserProfile,
    ctx: &mut TxContext,
) {
    // ... settle logic
    onematch::user_profile::record_win(winner_profile, winner_amount, stake);
    onematch::user_profile::record_loss(loser_profile, stake);
}

// Option B: Keep separate, document in README
```

---

## 🧪 Testing Plan

### Unit Tests (Move Test Framework)

```move
#[test_only]
module onematch::prediction_event_tests {
    use onematch::prediction_event;
    use one::test_scenario;
    
    #[test]
    fun test_create_event() {
        // Test event creation
    }
    
    #[test]
    fun test_increment_votes() {
        // Test vote counting
    }
    
    #[test]
    #[expected_failure(abort_code = prediction_event::EEventNotOpen)]
    fun test_settle_before_expiry() {
        // Should fail if settling before end_time
    }
}
```

### Integration Test Scenarios

**Scenario 1: Happy Path**
1. Create event (end_time = now + 7 days)
2. Player A places YES bet (10 OCT)
3. Player B places NO bet (10 OCT)
4. Matchmaker calls match_bets()
5. Wait for event to expire
6. Admin settles event (YES wins)
7. Call settle_duel()
8. Verify Player A receives ~19 OCT (95% of 20)

**Scenario 2: Bet on Expired Event**
1. Create event (end_time = now - 1 day)
2. Try to place bet
3. Should FAIL with EEventExpired

**Scenario 3: Unequal Stakes**
1. Player A bets 100 OCT YES
2. Player B bets 10 OCT NO
3. Try to match
4. Should FAIL with EUnequalStakes

**Scenario 4: Cancel Unmatched Bet**
1. Player places bet
2. No opponent found
3. Player cancels bet
4. Verify full refund received

**Scenario 5: Profile Creation & Stats**
1. Create profile
2. Win a duel
3. Verify stats updated (wins++, streak++, reputation+10)
4. Lose a duel
5. Verify streak reset, reputation+2

### Manual Testing Checklist

- [ ] Build contracts: `one move build`
- [ ] Run Move tests: `one move test`
- [ ] Deploy to testnet
- [ ] Create test event via CLI
- [ ] Place bet from frontend
- [ ] Match bets manually
- [ ] Settle event after expiry
- [ ] Verify funds distribution
- [ ] Check event emissions
- [ ] Test profile creation
- [ ] Test stats updates

---

## 🚀 Build & Test Commands

```bash
# Navigate to contracts directory
cd onematch/contracts

# Build contracts
one move build

# Run tests (after adding test modules)
one move test

# Check for warnings
one move build --warnings

# Deploy to testnet
one client publish --gas-budget 50000000

# Create test event (after deploy)
one client call --package <PACKAGE_ID> --module prediction_event --function create_event \
  --args <REGISTRY_ID> "Will BTC hit $120k?" "crypto" 1735689600000 \
  --gas-budget 10000000
```

---

## 📊 Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Bet on expired event | HIGH | HIGH | Add clock check |
| Unequal stakes | MEDIUM | HIGH | Add equality check |
| Funds locked forever | MEDIUM | MEDIUM | Add bet expiry |
| Centralized matching | MEDIUM | LOW | Document or decentralize |
| Lost fees | LOW | HIGH | Fix treasury address |
| Stats not updated | LOW | MEDIUM | Document manual update |

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] No compilation errors
- [ ] All tests passing
- [ ] No Move analyzer warnings
- [ ] Gas optimization reviewed

### Security
- [ ] Clock check added to place_bet()
- [ ] Stake validation added
- [ ] Stake equality check in match_bets()
- [ ] Treasury address configured
- [ ] Access control verified

### Documentation
- [x] Function comments clear
- [x] Error codes documented
- [ ] Integration guide written
- [ ] Frontend integration tested

### Testing
- [ ] Unit tests written
- [ ] Integration tests passed
- [ ] Manual testing completed
- [ ] Edge cases covered

---

## 🎯 Recommendation

**DO NOT DEPLOY YET** - Fix critical issues first:

1. ✅ Add clock check to place_bet()
2. ✅ Add stake validation (min/max)
3. ✅ Add stake equality check in match_bets()
4. ⚠️ Configure treasury address (or keep burning for testnet)
5. ⚠️ Add bet expiry (optional for MVP)

After fixes:
1. Build and test locally
2. Deploy to testnet
3. Test with small amounts
4. Monitor for issues
5. Iterate before mainnet

**Estimated Fix Time:** 30-45 minutes
**Testing Time:** 1-2 hours
