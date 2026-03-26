export type EventStatus = "open" | "settled_yes" | "settled_no" | "cancelled";

export interface PredictionEvent {
  id: string;
  question: string;
  category: string;
  endTime: number;
  creator: string;
  status: EventStatus;
  yesCount: number;
  noCount: number;
  // keywords used to fetch related news
  newsKeywords: string;
  // short context blurb shown in detail
  context: string;
}

export interface MatchedDuel {
  id: string;
  eventId: string;
  playerYes: string;
  playerNo: string;
  potMist: bigint;
  settled: boolean;
}

export interface UserProfile {
  id: string;
  owner: string;
  username: string;
  avatarUrl: string;
  totalDuels: number;
  wins: number;
  losses: number;
  reputation: number;
  currentStreak: number;
  bestStreak: number;
  favoriteCategory: string;
  winRate: number;
}

export type SwipeDirection = "left" | "right" | "up";

export interface SwipeAction {
  eventId: string;
  direction: SwipeDirection;
  position: boolean | null; // true=YES, false=NO, null=skip
}

// Mock events for demo (replace with on-chain queries)
export const MOCK_EVENTS: PredictionEvent[] = [
  {
    id: "0x001",
    question: "Will BTC hit $120,000 before May 2026?",
    category: "crypto",
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 7,
    creator: "0xabc",
    status: "open",
    yesCount: 142,
    noCount: 89,
    newsKeywords: "Bitcoin BTC price 2026",
    context:
      "Bitcoin has been trading between $90k–$105k in Q1 2026. Analysts are split — bulls cite ETF inflows and halving cycle, bears point to macro headwinds and profit-taking.",
  },
  {
    id: "0x002",
    question: "Will ETH flip BTC in market cap by end of 2026?",
    category: "crypto",
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 30,
    creator: "0xdef",
    status: "open",
    yesCount: 67,
    noCount: 201,
    newsKeywords: "Ethereum ETH flippening market cap",
    context:
      "ETH/BTC ratio sits at ~0.035 as of March 2026. The 'flippening' has been predicted many times but BTC dominance remains above 50%. Ethereum's Pectra upgrade is expected mid-2026.",
  },
  {
    id: "0x003",
    question: "Will OneChain reach 1M daily active users in 2026?",
    category: "tech",
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 60,
    creator: "0x123",
    status: "open",
    yesCount: 310,
    noCount: 88,
    newsKeywords: "OneChain onelabs blockchain adoption 2026",
    context:
      "OneChain launched its mainnet in late 2025 and has been growing rapidly. Current DAU is estimated at ~120k. The OneHack 3.0 hackathon is expected to bring a wave of new dApps and users.",
  },
  {
    id: "0x004",
    question: "Will AI replace 30% of software dev jobs by 2027?",
    category: "tech",
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 90,
    creator: "0x456",
    status: "open",
    yesCount: 445,
    noCount: 332,
    newsKeywords: "AI replace software developers jobs 2027",
    context:
      "GitHub Copilot, Cursor, and Claude Code are already handling significant portions of routine coding tasks. A Goldman Sachs report estimates 20–30% of coding tasks could be automated by 2027, though full job replacement remains debated.",
  },
  {
    id: "0x005",
    question: "Will a Move-based chain be top 5 by TVL in 2026?",
    category: "crypto",
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 45,
    creator: "0x789",
    status: "open",
    yesCount: 198,
    noCount: 156,
    newsKeywords: "Move blockchain Sui Aptos TVL DeFi 2026",
    context:
      "Sui and Aptos have been climbing the TVL rankings throughout 2025. Sui crossed $2B TVL in early 2026. OneChain, also Move-based, is gaining traction. The question is whether any of them can crack the top 5 alongside Ethereum, Solana, and BNB Chain.",
  },
  {
    id: "0x006",
    question: "Will the US approve a spot ETH ETF with staking by end of 2026?",
    category: "politics",
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 120,
    creator: "0xaaa",
    status: "open",
    yesCount: 289,
    noCount: 178,
    newsKeywords: "Ethereum ETF staking SEC approval 2026",
    context:
      "The SEC approved spot BTC ETFs in Jan 2024 and spot ETH ETFs in mid-2024. Issuers are now pushing for staking to be included. The new SEC chair under the Trump administration has signaled a more crypto-friendly stance.",
  },
];

