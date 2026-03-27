# OneMatch — P2P Prediction Duels on OneChain

> Swipe. Match. Predict. Win. Built for OneHack 3.0 AI-GameFi Edition.

## Live Demo

- **Website**: https://onematch-onechain.vercel.app
- **GitHub**: https://github.com/PugarHuda/onematch-prediction
- **Explorer**: https://onescan.cc/testnet
- **Package ID**: `0xcf72b6d537ebef117b1b743fd06779a9a1e97ffcbbc24e288561799aed1bca39`

## What is OneMatch?

OneMatch is a P2P prediction market with a Tinder-like swipe UX built on OneChain. Every prediction is a direct 1v1 duel between two real users — not against a pool. Move smart contracts hold funds in escrow. AI analyzes news to help you decide. Win and level up your on-chain reputation.

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- OneChain CLI (`one`) — [install guide](https://docs.onelabs.cc)
- OneWallet Chrome extension — [install](https://chromewebstore.google.com/detail/onechain-wallet/gclmcgmpkgblaglfokkaclneihpnbkli)

### 1. Clone & Install

```bash
git clone https://github.com/PugarHuda/onematch-prediction.git
cd onematch-prediction/frontend
pnpm install
```

### 2. Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_FAUCET_URL=https://faucet-testnet.onelabs.cc/v1/gas
NEXT_PUBLIC_EXPLORER_URL=https://onescan.cc/testnet

# Contract addresses (already deployed on testnet)
NEXT_PUBLIC_PACKAGE_ID=0xcf72b6d537ebef117b1b743fd06779a9a1e97ffcbbc24e288561799aed1bca39
NEXT_PUBLIC_EVENT_REGISTRY=0x15f9cc02fc887eb9d6c1b09b903eeca02d7a9cc26e91a43447395d22664ac763
NEXT_PUBLIC_PROFILE_REGISTRY=0x4727b0f5b2361716589b0d4f207fc5c50ac40e2b4e33d382406ceb91aaf237b3
NEXT_PUBLIC_ADMIN_CAP=0xd2d5c52d3aa25e886a78a0cd7b9c3e2397665ea35335946420d71d87bc70980a
NEXT_PUBLIC_TREASURY_CONFIG=0x79fec5a7bfb4fdba61ae26d13e0b587cd59c7d90fc3959e7dd00049c6e752c40
NEXT_PUBLIC_MATCHMAKER=0xd498ca45353fc376a9c18a33cb491988cce310a2429947d3d54da479f1be7be7

# Optional: GNews API key for real news
GNEWS_API_KEY=your_key_here
```

### 3. Run Frontend

```bash
cd frontend
pnpm dev
# Open http://localhost:3000
```

### 4. Get Testnet OCT

```bash
curl -X POST https://faucet-testnet.onelabs.cc/v1/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest":{"recipient":"YOUR_WALLET_ADDRESS"}}'
```

### 5. Deploy Contracts (optional — already deployed)

```bash
cd contracts
one move build
one move test        # 14/14 should pass
one client publish --gas-budget 100000000
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Move on OneChain (3 modules, 14 unit tests) |
| Frontend | Next.js 15 + React 18 + Framer Motion + Tailwind |
| Wallet | @onelabs/dapp-kit (OneWallet) |
| AI | NLP sentiment analysis + ELO rating |
| Design | Neo-brutalism + Lucide icons |
| Deployment | Vercel |

## OneChain Products Integrated

| Product | Usage | Status |
|---------|-------|--------|
| **OneWallet** | Connect, sign transactions | ✅ Live |
| **Move Contracts** | P2P escrow, events, profiles | ✅ Deployed |
| **OCT Token** | Betting currency, balance display | ✅ Live |
| **OneID** | On-chain profiles, reputation, badges | ✅ Live |
| **OneTransfer** | Auto-payout 95% to winner | ✅ In contracts |
| **OneDEX** | Token swap widget | ✅ Live |
| **OnePlay** | AI-ranked leaderboard | ✅ Live |

## AI Features

- **NLP Sentiment Analysis**: Weighted keyword scoring (bullish/bearish)
- **Multi-Factor Blending**: 55% AI + 35% crowd wisdom + 10% base
- **AI Matchmaking**: ELO-based rating system
- **Recommendation Engine**: YES/NO/HOLD per event with confidence %

## GameFi Mechanics

- **XP & Level System**: LV.1 Rookie → LV.10 Legend
- **ELO Rating**: AI-calculated skill score
- **Win Streak Bonuses**: +5 rep every 5-win streak
- **Dynamic Badges**: Hot Streak, Sharp Caller, Diamond Hands, Newcomer
- **P2P Dueling**: Direct 1v1 with escrow

## Game Flow

1. **Swipe** → Browse prediction events. Right=YES, Left=NO, Up=3×stake, Down=Skip
2. **AI Analysis** → NLP reads news. Get YES/NO/HOLD recommendation with confidence %
3. **Bet** → OCT locked in Move smart contract escrow. Min 0.1 OCT, max 10K OCT
4. **Match** → AI matchmaker finds opponent with opposite position and equal stake
5. **Settle** → After deadline, admin settles on-chain. Winner gets 95% of pot
6. **Level Up** → Win: +10 rep, streak+1. Lose: +2 rep, streak reset

## Economy

- Min bet: 0.1 OCT · Max: 10,000 OCT
- Winner takes 95% of total pot
- 5% platform fee → TreasuryConfig
- Unmatched bets auto-expire after 24 hours (full refund)

## Progression System

| Level | Title | Reputation |
|-------|-------|-----------|
| 1 | ROOKIE | 0-149 |
| 2 | DUELIST | 150-199 |
| 3 | VETERAN | 200-299 |
| 5 | EXPERT | 300-499 |
| 7 | MASTER | 500-999 |
| 10 | LEGEND | 1000+ |

## Smart Contracts (14 tests, all passing)

### prediction_event.move
- Event creation with category + end time
- Admin settlement with Clock validation
- Event cancellation (emergency)
- Vote count tracking

### prediction_escrow.move
- P2P escrow with TreasuryConfig
- PendingBet with 24h expiry
- Match validation (equal stakes, same event)
- 95% winner payout, 5% platform fee
- Bet cancellation with refund

### user_profile.move
- On-chain profiles with username validation (3-20 chars)
- Win/loss/streak tracking
- Reputation system
- ProfileRegistry prevents duplicates

## On-Chain Data (Testnet)

- 5 PredictionEvent objects (crypto, tech, politics)
- 5 UserProfile objects (OneMatch_Admin, crypto_whale, degen_bob, move_maxi, ai_trader)
- EventRegistry, ProfileRegistry, TreasuryConfig, AdminCap

## Project Structure

```
onematch/
├── contracts/
│   ├── sources/
│   │   ├── prediction_event.move
│   │   ├── prediction_escrow.move
│   │   ├── user_profile.move
│   │   └── tests.move               # 14 unit tests
│   └── Move.toml
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Landing page
│       │   ├── feed/page.tsx        # Swipe feed (realtime from chain)
│       │   ├── duels/page.tsx       # Active duels
│       │   ├── profile/page.tsx     # On-chain profile + GameFi
│       │   ├── admin/page.tsx       # Admin panel
│       │   ├── docs/page.tsx        # Documentation
│       │   └── api/
│       │       ├── ai/route.ts      # AI sentiment API
│       │       └── news/route.ts    # GNews proxy
│       ├── components/
│       │   ├── EventCard.tsx        # Swipeable card + AI tab
│       │   ├── MatchModal.tsx       # Match animation
│       │   ├── StakeSlider.tsx      # Stake selector
│       │   ├── TokenSwapWidget.tsx  # OneDEX swap
│       │   ├── Leaderboard.tsx      # AI-ranked
│       │   └── Header.tsx           # Nav + AdminCap check
│       └── lib/
│           ├── onechain.ts          # Transaction builders + queries
│           ├── useOneChainTx.ts     # Sign + execute hook
│           ├── useAISentiment.ts    # AI analysis hook
│           ├── constants.ts         # Contract addresses
│           ├── store.ts             # Zustand state
│           └── types.ts             # TypeScript types
├── SUBMISSION.md                    # Hackathon submission details
└── README.md
```

---

Built with ❤️ on OneChain for OneHack 3.0 AI-GameFi Edition
