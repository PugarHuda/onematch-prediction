# OneChain Integration Guide

## Overview

OneMatch leverages multiple OneChain products to create a seamless P2P prediction market experience. This document details how each product is integrated and used.

---

## 🔐 OneWallet Integration

**Product**: OneWallet  
**Package**: `@onelabs/dapp-kit`  
**Status**: ✅ Fully Implemented

### Implementation Details

**1. Provider Setup** (`src/components/Providers.tsx`)
```typescript
import { OneWalletProvider } from "@onelabs/dapp-kit";

<OneWalletProvider
  networks={[
    {
      id: "onechain-testnet",
      name: "OneChain Testnet",
      rpcUrl: "https://rpc-testnet.onelabs.cc",
    },
  ]}
  defaultNetwork="onechain-testnet"
>
  {children}
</OneWalletProvider>
```

**2. Wallet Connection** (`src/components/Header.tsx`)
- ConnectButton component for authentication
- Real-time balance display
- Network status indicator

**3. Transaction Signing** (All bet placements)
```typescript
const { mutate: signAndExecute } = useSignAndExecuteTransaction();
signAndExecute({ transaction: tx });
```

### Features Used
- ✅ Wallet connection/disconnection
- ✅ Transaction signing
- ✅ Balance queries
- ✅ Address display
- ✅ Network switching

---

## 📜 Move Smart Contracts

**Product**: OneChain Move Runtime  
**Network**: OneChain Testnet  
**Status**: ✅ Fully Implemented

### Contract Architecture

**1. prediction_event.move**
- Event creation and lifecycle management
- Settlement logic with oracle support
- Shared object pattern for global registry
- Category-based organization

**2. prediction_escrow.move**
- P2P escrow with fund locking
- Automatic matchmaking logic
- Winner payout (95% to winner, 5% fee)
- Capability-based access control

**3. user_profile.move**
- On-chain reputation system (OneID compatible)
- Win/loss tracking
- Streak and badge calculations
- Total volume statistics

### Key Functions
```move
// Create event
public entry fun create_event(
    registry: &mut EventRegistry,
    question: String,
    category: String,
    end_time: u64,
    ctx: &mut TxContext
)

// Place bet
public entry fun place_bet(
    event_id: ID,
    position: bool,
    amount: Coin<OCT>,
    ctx: &mut TxContext
)

// Settle event
public entry fun settle(
    event: &mut PredictionEvent,
    outcome: bool,
    ctx: &mut TxContext
)
```

---

## 💰 OCT Token

**Product**: OCT Native Token  
**Type**: `0x2::oct::OCT`  
**Status**: ✅ Fully Implemented

### Usage

**1. Balance Queries** (`src/lib/onechain.ts`)
```typescript
export async function getOCTBalance(address: string): Promise<bigint> {
  const coins = await suiClient.getCoins({
    owner: address,
    coinType: "0x2::oct::OCT",
  });
  return coins.data.reduce((sum, c) => sum + BigInt(c.balance), 0n);
}
```

**2. Conversion Utilities**
```typescript
// 1 OCT = 1,000,000,000 MIST
export const octToMist = (oct: number) => oct * 1_000_000_000;
export const mistToOct = (mist: bigint) => Number(mist) / 1_000_000_000;
export const formatOCT = (mist: bigint) => mistToOct(mist).toFixed(2);
```

**3. Transaction Building**
```typescript
export function buildPlaceBetTx(
  eventId: string,
  position: boolean,
  amountMist: number
) {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [amountMist]);
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_escrow::place_bet`,
    arguments: [
      tx.object(eventId),
      tx.pure.bool(position),
      coin,
    ],
  });
  return tx;
}
```

### Features
- ✅ Real-time balance display
- ✅ Bet amount selection (5-100 OCT presets)
- ✅ Custom stake amounts
- ✅ Transaction fee estimation
- ✅ Mist/OCT conversion

---

## 👤 OneID Integration

**Product**: OneID Reputation System  
**Contract**: `user_profile.move`  
**Status**: ✅ Fully Implemented

### Profile Structure
```move
public struct UserProfile has key, store {
    id: UID,
    owner: address,
    total_bets: u64,
    wins: u64,
    losses: u64,
    total_volume: u64,
    current_streak: u64,
    best_streak: u64,
    badges: vector<String>,
    created_at: u64,
}
```

### Badge System
- 🏅 **Rookie**: 0-10 bets
- 🥉 **Bronze**: 11-50 bets
- 🥈 **Silver**: 51-100 bets
- 🥇 **Gold**: 101-500 bets
- 💎 **Diamond**: 501-1000 bets
- 👑 **Legend**: 1000+ bets

### Streak Tracking
- Current win streak
- Best streak (all-time)
- Streak bonus multipliers (future feature)

### Profile Page Features
- Win rate percentage
- Total volume in OCT
- Badge display
- Recent duel history
- Reputation score

---

## 💸 OneTransfer (Auto-Payout)

**Product**: OneTransfer  
**Implementation**: Smart Contract Logic  
**Status**: ✅ Fully Implemented

### Payout Mechanism

**1. Escrow Lock** (on bet placement)
```move
public entry fun place_bet(
    event_id: ID,
    position: bool,
    amount: Coin<OCT>,
    ctx: &mut TxContext
) {
    // Lock funds in MatchedDuel object
    let duel = MatchedDuel {
        id: object::new(ctx),
        event_id,
        player_yes: if (position) sender else opponent,
        player_no: if (!position) sender else opponent,
        amount_yes: if (position) coin::value(&amount) else 0,
        amount_no: if (!position) coin::value(&amount) else 0,
        settled: false,
    };
    transfer::share_object(duel);
}
```

**2. Automatic Settlement** (on event resolution)
```move
public entry fun settle(
    duel: &mut MatchedDuel,
    event: &PredictionEvent,
    ctx: &mut TxContext
) {
    assert!(!duel.settled, E_ALREADY_SETTLED);
    assert!(event.settled, E_EVENT_NOT_SETTLED);
    
    let total_pot = duel.amount_yes + duel.amount_no;
    let winner_amount = (total_pot * 95) / 100; // 95% to winner
    let platform_fee = total_pot - winner_amount; // 5% fee
    
    let winner = if (event.outcome) duel.player_yes else duel.player_no;
    
    // Transfer to winner
    transfer::public_transfer(
        coin::split(&mut duel.pot, winner_amount, ctx),
        winner
    );
    
    duel.settled = true;
}
```

### Features
- ✅ Instant settlement on event resolution
- ✅ 95% payout to winner
- ✅ 5% platform fee
- ✅ No manual withdrawal needed
- ✅ Atomic transaction (all or nothing)

---

## 🎲 OnePredict Mechanics

**Product**: OnePredict  
**Implementation**: Custom P2P Logic  
**Status**: ✅ Fully Implemented

### Core Mechanics

**1. Event Types**
- Binary outcomes (YES/NO)
- Time-bound predictions
- Category-based (Crypto, Sports, Politics, Tech, Entertainment)

**2. P2P Matching**
```typescript
// Simplified matching logic (production uses smart contract)
function matchOpponent(userId: string, position: boolean, eventId: string) {
  // Find opponent with opposite position
  const opponent = findOpponent(eventId, !position);
  
  // Create matched duel
  createMatchedDuel({
    eventId,
    playerYes: position ? userId : opponent,
    playerNo: position ? opponent : userId,
    amountYes: stakeAmount,
    amountNo: stakeAmount,
  });
}
```

**3. Sentiment Tracking**
```typescript
interface EventSentiment {
  yesCount: number;
  noCount: number;
  yesPercentage: number;
  totalVolume: number;
}
```

**4. Real-time Updates**
- Live sentiment bars
- Player count per side
- Time remaining
- Market news integration

### Swipe Mechanics
- **Right Swipe**: Bet YES
- **Left Swipe**: Bet NO
- **Up Swipe**: Bet YES with 3× stake
- **Down Swipe**: Skip event
- **Tap**: View detailed info + news

---

## 🔮 Future Integrations

### OneDEX
- Multi-token betting (swap before bet)
- Liquidity pools for unmatched bets
- Token pair predictions

### OnePlay
- Leaderboards and rankings
- Tournament brackets
- Seasonal competitions
- Achievement system

### OneRWA
- Real-world asset predictions
- Commodity price forecasts
- Real estate market bets

### OnePoker
- Tournament-style brackets
- Multi-round predictions
- Elimination mechanics

---

## 📊 Integration Summary

| Product | Status | Usage | Files |
|---------|--------|-------|-------|
| OneWallet | ✅ Full | Auth, signing, balance | `Providers.tsx`, `Header.tsx` |
| Move Contracts | ✅ Full | Core logic, escrow | `*.move` files |
| OCT Token | ✅ Full | Currency, payments | `onechain.ts`, `constants.ts` |
| OneID | ✅ Full | Reputation, profiles | `user_profile.move`, `profile/page.tsx` |
| OneTransfer | ✅ Full | Auto-payouts | `prediction_escrow.move` |
| OnePredict | ✅ Full | P2P mechanics | All event-related files |
| OneDEX | 🔮 Future | Token swaps | - |
| OnePlay | 🔮 Future | Gamification | - |
| OneRWA | 🔮 Future | RWA markets | - |
| OnePoker | 🔮 Future | Tournaments | - |

---

## 🔗 Resources

- **OneChain Docs**: https://docs.onelabs.cc/DevelopmentDocument
- **OneBox Toolkit**: https://onebox.onelabs.cc/chat
- **Testnet RPC**: https://rpc-testnet.onelabs.cc
- **Testnet Faucet**: https://faucet-testnet.onelabs.cc
- **Explorer**: https://onescan.cc/testnet

---

**Built with ❤️ on OneChain for OneHack 3.0**
