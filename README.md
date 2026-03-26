# OneMatch — P2P Social Prediction Market

> Swipe. Match. Predict. Win. Built on OneChain for OneHack 3.0.

## What is OneMatch?

OneMatch is a P2P prediction market with a Tinder-like swipe UX. Every prediction is a **direct duel** between two users — not against a liquidity pool. Smart contracts on OneChain hold funds in escrow until the event settles.

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Move on OneChain (fork of Sui) |
| Frontend | Next.js 15 + React 19 + Framer Motion |
| Wallet | @onelabs/dapp-kit (OneWallet) |
| SDK | @onelabs/sui |
| Currency | OCT (native token) |
| Network | OneChain Testnet |

## OneChain Products Used

### ✅ Actively Implemented

1. **OneWallet** 🔐
   - Full wallet integration via `@onelabs/dapp-kit`
   - Transaction signing for all bet placements
   - Real-time balance display in header
   - Connect/disconnect functionality
   - **Files**: `Header.tsx`, `Providers.tsx`, all page components

2. **Move Smart Contracts** 📜
   - `prediction_event.move` - Event lifecycle management
   - `prediction_escrow.move` - P2P escrow with auto-matching
   - `user_profile.move` - On-chain reputation system
   - **Network**: OneChain Testnet
   - **Currency**: OCT native token

3. **OCT Token** 💰
   - Native currency for all predictions
   - Mist ↔ OCT conversion utilities
   - Real-time balance tracking via OneChain RPC
   - **Files**: `onechain.ts`, `constants.ts`

4. **OneID Concept** 👤
   - On-chain user profiles with reputation
   - Win rate, total volume, streak tracking
   - Badge system (Rookie, Pro, Legend, etc.)
   - Persistent identity across sessions
   - **Files**: `user_profile.move`, `profile/page.tsx`

5. **OneTransfer** 💸
   - Automatic winner payouts via smart contract
   - 95% to winner, 5% platform fee
   - Instant settlement on event resolution
   - Escrow fund management in `MatchedDuel` objects
   - **Files**: `prediction_escrow.move`

6. **OnePredict Mechanics** 🎲
   - P2P prediction market implementation
   - Binary outcome events (YES/NO positions)
   - Real-time sentiment tracking
   - Category-based organization (Crypto, Sports, Politics, etc.)
   - **Files**: `prediction_event.move`, `EventCard.tsx`

### 🔮 Future Integration Opportunities

- **OneDEX**: Multi-token betting (swap tokens before placing bets)
- **OnePlay**: Leaderboards, tournaments, seasonal competitions
- **OneRWA**: Real-world asset prediction markets
- **OnePoker**: Tournament-style bracket predictions

## Project Structure

```
onematch/
├── contracts/
│   ├── Move.toml
│   └── sources/
│       ├── prediction_event.move   # Event creation & settlement
│       ├── prediction_escrow.move  # P2P escrow & matching
│       └── user_profile.move       # On-chain reputation (OneID)
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx            # Landing page
        │   ├── feed/page.tsx       # Swipe feed
        │   ├── duels/page.tsx      # Active duels
        │   └── profile/page.tsx    # User profile
        ├── components/
        │   ├── EventCard.tsx       # Swipeable card
        │   ├── MatchModal.tsx      # "It's a Match!" animation
        │   ├── StakeSlider.tsx     # Stake amount selector
        │   ├── Header.tsx          # Nav + wallet connect
        │   └── Providers.tsx       # SDK providers
        └── lib/
            ├── onechain.ts         # Transaction builders
            ├── constants.ts        # Config & contract IDs
            ├── types.ts            # TypeScript types
            └── store.ts            # Zustand state
```

## Getting Started

### 1. Deploy Contracts

```bash
cd contracts
one move build
one move test
one client publish --gas-budget 50000000
```

Copy the PackageID, EventRegistry ID, and ProfileRegistry ID into `frontend/src/lib/constants.ts`.

### 2. Run Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

### 3. Get Testnet OCT

```bash
curl -X POST https://faucet-testnet.onelabs.cc/v1/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest": {"recipient": "<YOUR_ADDRESS>"}}'
```

## How It Works

1. **Swipe** — User sees event cards one at a time. Swipe right = YES, left = NO, up = YES × 3 stake.
2. **Match** — AI matchmaking finds an opponent with the opposite position. Funds locked in `MatchedDuel` shared object.
3. **Settle** — After event deadline, admin/oracle calls `settle()`. Smart contract pays winner 95% of pot.
4. **Reputation** — Win/loss recorded on-chain in `UserProfile` (OneID-compatible).

## Explorer

All transactions visible at: https://onescan.cc/testnet
