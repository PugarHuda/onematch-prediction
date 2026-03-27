# OneMatch — P2P Prediction Duels on OneChain

> Swipe. Match. Predict. Win. Built for OneHack 3.0 AI-GameFi Edition.

## What is OneMatch?

OneMatch is a P2P prediction market with a Tinder-like swipe UX. Every prediction is a direct duel between two users — not against a liquidity pool. Move smart contracts on OneChain hold funds in escrow until the event settles. AI-powered sentiment analysis helps users make informed decisions.

## Live Demo

- **Website**: https://frontend-pi-one-48.vercel.app
- **GitHub**: https://github.com/PugarHuda/onematch-prediction
- **Explorer**: https://onescan.cc/testnet
- **Package ID**: `0xcf72b6d537ebef117b1b743fd06779a9a1e97ffcbbc24e288561799aed1bca39`

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Move on OneChain (3 modules, 14 unit tests) |
| Frontend | Next.js 15 + React 18 + Framer Motion + Tailwind |
| Wallet | @onelabs/dapp-kit (OneWallet) |
| AI Engine | NLP sentiment analysis + ELO rating system |
| Currency | OCT (native token, min bet 0.1 OCT) |
| Network | OneChain Testnet |

## OneChain Products Integrated

| Product | Usage | Status |
|---------|-------|--------|
| **OneWallet** | Connect, sign transactions | ✅ Live |
| **Move Contracts** | P2P escrow, events, profiles | ✅ Deployed |
| **OCT Token** | Betting currency, balance display | ✅ Live |
| **OneID** | On-chain profiles, reputation, badges | ✅ Live |
| **OneTransfer** | Auto-payout 95% to winner | ✅ In contracts |
| **OneDEX** | Token swap widget | ✅ UI + tx building |
| **OnePlay** | AI-ranked leaderboard | ✅ Live |
| **OnePredict** | P2P prediction mechanics | ✅ Live |

## AI Features

- **NLP Sentiment Analysis**: Weighted keyword analysis of news headlines (bullish/bearish scoring)
- **Multi-Factor Blending**: 55% AI sentiment + 35% crowd wisdom + 10% base
- **AI Matchmaking**: ELO-based rating (base 1000 + wins×25 + streak×15 + winRate×3)
- **Recommendation Engine**: YES/NO/HOLD with confidence % per event
- **Key Signal Extraction**: Shows which keywords triggered the analysis

## GameFi Mechanics

- **XP & Level System**: LV.1 Rookie → LV.10 Legend (reputation-based)
- **ELO Rating**: AI-calculated skill score visible on profile + leaderboard
- **Streak Bonuses**: +5 reputation every 5-win streak
- **Dynamic Badges**: Hot Streak, Sharp Caller, Diamond Hands, Newcomer
- **P2P Duels**: Direct 1v1 prediction battles with escrow

## Smart Contracts (14 tests, all passing)

### prediction_event.move
- Event creation with category + end time
- Admin settlement with Clock validation
- Event cancellation (emergency)
- Vote count tracking (yes/no)

### prediction_escrow.move
- P2P escrow with TreasuryConfig (fees to deployer, not burned)
- PendingBet with 24h expiry
- Match validation (equal stakes, same event, not expired)
- 95% winner payout, 5% platform fee
- Bet cancellation with refund

### user_profile.move
- On-chain profiles with username validation (3-20 chars)
- Win/loss/streak tracking
- Reputation system (+10 win, +2 participation, +5 streak bonus)
- ProfileRegistry prevents duplicates

## Project Structure

```
onematch/
├── contracts/
│   ├── sources/
│   │   ├── prediction_event.move    # Event lifecycle
│   │   ├── prediction_escrow.move   # P2P escrow + treasury
│   │   ├── user_profile.move        # On-chain reputation
│   │   └── tests.move               # 14 unit tests
│   └── Move.toml
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx             # Landing page
        │   ├── feed/page.tsx        # Swipe feed
        │   ├── duels/page.tsx       # Active duels (synced)
        │   ├── profile/page.tsx     # On-chain profile + GameFi
        │   ├── admin/page.tsx       # Admin panel (AdminCap only)
        │   ├── docs/page.tsx        # Documentation
        │   └── api/
        │       ├── ai/route.ts      # AI sentiment API
        │       └── news/route.ts    # GNews proxy
        ├── components/
        │   ├── EventCard.tsx        # Swipeable card + AI tab
        │   ├── MatchModal.tsx       # Match animation + AI indicator
        │   ├── StakeSlider.tsx      # Stake selector (0.1-10000 OCT)
        │   ├── TokenSwapWidget.tsx  # OneDEX swap
        │   ├── Leaderboard.tsx      # AI-ranked (on-chain fetch)
        │   ├── Header.tsx           # Nav + AdminCap check
        │   └── Toast.tsx            # Notifications
        └── lib/
            ├── onechain.ts          # Transaction builders + queries
            ├── useOneChainTx.ts     # Sign + execute hook
            ├── useAISentiment.ts    # AI analysis hook
            ├── constants.ts         # Contract addresses
            ├── store.ts             # Zustand (bets, profile, toasts)
            └── types.ts             # TypeScript types + events
```

## Getting Started

### 1. Deploy Contracts
```bash
cd contracts
one move build
one move test        # 14/14 should pass
one client publish --gas-budget 100000000
```

### 2. Run Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### 3. Get Testnet OCT
```bash
curl -X POST https://faucet-testnet.onelabs.cc/v1/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest":{"recipient":"YOUR_ADDRESS"}}'
```

## On-Chain Data (Testnet)

- 5 PredictionEvent objects (crypto, tech, politics)
- 5 UserProfile objects (OneMatch_Admin, crypto_whale, degen_bob, move_maxi, ai_trader)
- EventRegistry, ProfileRegistry, TreasuryConfig, AdminCap

## How It Works

### Game Flow
1. **Swipe** → Browse prediction events. Right=YES, Left=NO, Up=3×stake, Down=Skip
2. **AI Analysis** → NLP reads news headlines. Weighted sentiment: 55% AI + 35% crowd + 10% base. Get YES/NO/HOLD recommendation with confidence %
3. **Bet** → OCT locked in Move smart contract escrow. Min 0.1 OCT, max 10K OCT
4. **Match** → AI matchmaker (ELO-based) finds opponent with opposite position and equal stake. Creates MatchedDuel shared object
5. **Settle** → After deadline, admin settles event on-chain. Smart contract pays winner 95% of pot
6. **Level Up** → Win: +10 rep, streak+1. Lose: +2 rep, streak reset. Every 5-win streak: +5 bonus

### Economy
- Min bet: 0.1 OCT · Max: 10,000 OCT
- Winner takes 95% of total pot
- 5% platform fee → TreasuryConfig (deployer wallet)
- Unmatched bets auto-expire after 24 hours (full refund)
- OneDEX swap: OCT/USDC/WETH/WBTC with 0.3% fee

### Progression System
| Level | Title | Reputation Required |
|-------|-------|-------------------|
| 1 | ROOKIE | 0-149 |
| 2 | DUELIST | 150-199 |
| 3 | VETERAN | 200-299 |
| 5 | EXPERT | 300-499 |
| 7 | MASTER | 500-999 |
| 10 | LEGEND | 1000+ |

### Badges (Dynamic, from on-chain stats)
- 🔥 Hot Streak — 3+ win streak
- ⚡ Fast Matcher — 10+ total duels
- 🎯 Sharp Caller — 60%+ win rate
- 💎 Diamond Hands — 100+ OCT staked
- 🌱 Newcomer — 0 duels (new player)

## Architecture

```
Frontend (Next.js) → OneWallet (Sign) → OneChain RPC (Execute)
     ↓                                        ↓
AI Engine (NLP)                         3 Move Contracts
     ↓                                        ↓
GNews API                              On-chain Objects
```

---

Built with ❤️ on OneChain for OneHack 3.0 AI-GameFi Edition
