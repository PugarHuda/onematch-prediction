# OneMatch — OneHack 3.0 AI-GameFi Submission

## Project Name
OneMatch — P2P Prediction Duels

## Team
- **Name**: Pugar Huda Mantoro
- **Role**: Solo Developer (Full-stack + Smart Contracts)
- **Email**: hudapugar@gmail.com

## Links
- **GitHub**: https://github.com/PugarHuda/onematch-prediction
- **Explorer**: https://onescan.cc/testnet
- **Package ID**: `0xcf72b6d537ebef117b1b743fd06779a9a1e97ffcbbc24e288561799aed1bca39`

---

## Project Description / Backstory

OneMatch is a P2P prediction market with a Tinder-like swipe UX built on OneChain. Instead of betting against a liquidity pool, every prediction is a direct 1v1 duel between two real users.

**The Problem**: Traditional prediction markets are impersonal — you bet against a pool, not a person. There's no social element, no rivalry, no skin-in-the-game feeling.

**The Solution**: OneMatch makes predictions personal and fun. Swipe on events like you swipe on Tinder. AI analyzes news to help you decide. Get matched with a real opponent. Winner takes 95% of the pot. Build your reputation on-chain.

**Why OneChain**: Move smart contracts provide the safety guarantees needed for financial escrow. OneWallet provides seamless UX. OCT token is the native betting currency. The OneChain ecosystem (OneDEX, OnePlay, OneID) provides the infrastructure for a complete GameFi experience.

---

## Working MVP


**Core Features (all working):**
1. **Swipe Feed** — Browse prediction events, swipe to bet (right=YES, left=NO, up=3× stake)
2. **AI Analysis** — NLP sentiment analysis of news headlines with YES/NO/HOLD recommendation
3. **On-chain Betting** — OCT tokens locked in Move smart contract escrow (min 0.1 OCT)
4. **AI Matchmaking** — ELO-based opponent matching with equal stakes
5. **Profile & Reputation** — On-chain profiles with XP, levels (Rookie→Legend), badges
6. **Leaderboard** — AI-ranked (ELO) with on-chain data fetch
7. **OneDEX Swap** — Token swap widget (OCT/USDC/WETH/WBTC)
8. **Admin Panel** — Create events, settle, cancel (AdminCap protected)
9. **Duels Page** — Track active bets synced from feed
10. **Documentation** — Full docs page with architecture

### On-Chain Data (Testnet):
- 5 PredictionEvent objects (crypto, tech, politics categories)
- 5 UserProfile objects (OneMatch_Admin, crypto_whale, degen_bob, move_maxi, ai_trader)
- EventRegistry, ProfileRegistry, TreasuryConfig, AdminCap
- All verifiable on OneScan explorer

---

## OneWallet Integration

**Status: ✅ Fully Integrated**

- Connect/disconnect via `@onelabs/dapp-kit` ConnectButton
- Transaction signing via `useSignTransaction` + manual RPC execute
- Real-time OCT balance display in header
- Profile creation on-chain (signed via OneWallet)
- Bet placement on-chain (signed via OneWallet)
- OneDEX swap transactions (signed via OneWallet)

**Technical**: Uses `@onelabs/dapp-kit` v0.15.6 with `SuiClientProvider` + `WalletProvider`. Custom `useOneChainTx` hook handles sign + execute flow.

---

## AI Features (Track: AI-GameFi)

1. **NLP Sentiment Analysis** (`/api/ai` route)
   - Weighted keyword scoring (crash=3, rally=3, drop=2, gain=2, etc.)
   - Multi-factor blending: 55% AI sentiment + 35% crowd wisdom + 10% base
   - Key signal extraction (shows which words triggered analysis)
   - Confidence calibration based on data quality

2. **AI Matchmaking**
   - ELO-based rating: base 1000 + wins×25 + streak×15 + winRate×3
   - Skill-based opponent matching

3. **AI Recommendation Engine**
   - YES/NO/HOLD per event with confidence percentage
   - Visible in EventCard AI tab

---

## GameFi Features (Track: AI-GameFi)

1. **XP & Level System**: LV.1 Rookie → LV.10 Legend
2. **ELO Rating**: AI-calculated skill score
3. **Win Streak Bonuses**: +5 reputation every 5-win streak
4. **Dynamic Badges**: Hot Streak, Sharp Caller, Diamond Hands, Newcomer
5. **P2P Dueling**: Direct 1v1 with escrow
6. **Economy**: 95% winner payout, 5% treasury fee, 24h bet expiry

---

## Smart Contracts

3 Move modules, 14 unit tests (all passing):

| Module | Purpose |
|--------|---------|
| `prediction_event.move` | Event lifecycle, settlement, cancellation |
| `prediction_escrow.move` | P2P escrow, treasury, bet expiry, matchmaking |
| `user_profile.move` | On-chain profiles, reputation, streaks |

---

## OneChain Products Used

| Product | Usage | Status |
|---------|-------|--------|
| OneWallet | Connect, sign transactions | ✅ Live |
| Move Contracts | P2P escrow, events, profiles | ✅ Deployed |
| OCT Token | Betting currency | ✅ Live |
| OneID | On-chain profiles, reputation | ✅ Live |
| OneTransfer | Auto-payout to winner | ✅ In contracts |
| OneDEX | Token swap widget | ✅ Live |
| OnePlay | AI-ranked leaderboard | ✅ Live |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Move on OneChain (3 modules, 14 tests) |
| Frontend | Next.js 15 + React 18 + Framer Motion + Tailwind |
| Wallet | @onelabs/dapp-kit (OneWallet) |
| AI | NLP sentiment + ELO rating |
| Design | Neo-brutalism + Lucide icons |
| Deployment | Vercel |

---

## Video Demo
https://drive.google.com/file/d/1m8OnEU5Oo87ntV5dnG21NlhLt45ItazA/view?usp=sharing

---

Built with ❤️ on OneChain for OneHack 3.0 AI-GameFi Edition
