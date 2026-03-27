import { Header } from "@/components/Header";
import { BookOpen, Code, Brain, Gamepad2, Wallet, ArrowDownUp, Trophy, Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "SMART CONTRACTS",
    Icon: Code,
    color: "#FFE500",
    items: [
      { label: "prediction_event.move", desc: "Event creation, settlement, cancellation. Shared EventRegistry tracks all markets." },
      { label: "prediction_escrow.move", desc: "P2P escrow with TreasuryConfig. 95% to winner, 5% fee. 24h bet expiry." },
      { label: "user_profile.move", desc: "On-chain profiles with reputation, streaks, win/loss tracking." },
      { label: "14 Unit Tests", desc: "Full test coverage: happy paths, edge cases, error conditions." },
    ],
  },
  {
    title: "AI ENGINE",
    Icon: Brain,
    color: "#BF5FFF",
    items: [
      { label: "NLP Sentiment Analysis", desc: "Keyword-based NLP analyzes news headlines for bullish/bearish signals." },
      { label: "Crowd Wisdom Blending", desc: "60% AI sentiment + 40% crowd vote data = blended confidence score." },
      { label: "AI Matchmaking", desc: "ELO-based rating system matches players of similar skill levels." },
      { label: "Recommendation Engine", desc: "YES/NO/HOLD recommendation with confidence percentage per event." },
    ],
  },
  {
    title: "GAMEFI MECHANICS",
    Icon: Gamepad2,
    color: "#00FF87",
    items: [
      { label: "XP & Level System", desc: "LV.1 Rookie → LV.10 Legend. Reputation earned from wins (+10) and participation (+2)." },
      { label: "ELO Rating", desc: "AI-calculated skill score: base 1000 + wins×25 + streak×15 + winRate×3." },
      { label: "Streak Bonuses", desc: "+5 reputation bonus every 5-win streak. Streak resets on loss." },
      { label: "Dynamic Badges", desc: "Hot Streak, Sharp Caller, Diamond Hands — earned from on-chain stats." },
    ],
  },
  {
    title: "ONECHAIN PRODUCTS",
    Icon: Wallet,
    color: "#FF3CAC",
    items: [
      { label: "OneWallet", desc: "Browser extension wallet for signing transactions. Connect + sign flow." },
      { label: "OneDEX", desc: "Token swap widget with rate calculation, 0.3% fee, slippage tolerance." },
      { label: "OnePlay", desc: "Leaderboard ranked by AI Rating. Fetches profiles from chain." },
      { label: "OneID", desc: "On-chain user profiles with reputation, stats, and badges." },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-6">
        <div className="border-3 border-black bg-black shadow-brutal p-6">
          <h1 className="font-mono font-bold text-3xl text-brutal-yellow mb-2 flex items-center gap-2">
            <BookOpen size={28} /> DOCUMENTATION
          </h1>
          <p className="font-mono text-sm text-white/60">
            OneMatch — P2P Prediction Duels on OneChain · Built for OneHack 3.0 AI-GameFi
          </p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title} className="border-3 border-black bg-white shadow-brutal">
            <div className="border-b-3 border-black p-4 flex items-center gap-2" style={{ backgroundColor: section.color }}>
              <section.Icon size={20} className="text-black" />
              <h2 className="font-mono font-bold text-lg text-black">{section.title}</h2>
            </div>
            <div className="divide-y-2 divide-black">
              {section.items.map((item) => (
                <div key={item.label} className="p-4 hover:bg-brutal-yellow/10 transition-colors">
                  <p className="font-mono text-sm font-bold text-black mb-1">{item.label}</p>
                  <p className="font-mono text-xs text-black/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Architecture */}
        <div className="border-3 border-black bg-white shadow-brutal">
          <div className="border-b-3 border-black p-4 bg-brutal-cyan flex items-center gap-2">
            <Shield size={20} />
            <h2 className="font-mono font-bold text-lg text-black">ARCHITECTURE</h2>
          </div>
          <div className="p-4 font-mono text-xs text-black/70 space-y-2">
            <pre className="bg-black text-brutal-yellow p-4 overflow-x-auto border-2 border-black">{`
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│  OneWallet   │────▶│  OneChain   │
│  Next.js 15 │     │  Sign Only   │     │  Testnet    │
└──────┬──────┘     └──────────────┘     └──────┬──────┘
       │                                        │
       ▼                                        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  AI Engine  │     │  GNews API   │     │  3 Move     │
│  NLP + ELO  │◀────│  Headlines   │     │  Contracts  │
└─────────────┘     └──────────────┘     └─────────────┘
            `}</pre>
            <p>Package ID: <span className="text-brutal-purple font-bold">0xcf72b6d5...1bca39</span></p>
            <p>Network: OneChain Testnet · RPC: rpc-testnet.onelabs.cc</p>
          </div>
        </div>

        {/* Links */}
        <div className="border-3 border-black bg-brutal-purple shadow-brutal p-4 flex flex-wrap gap-3 justify-center">
          {[
            { label: "GitHub", href: "https://github.com/PugarHuda/onematch-prediction" },
            { label: "OneScan", href: "https://onescan.cc/testnet" },
            { label: "OneChain Docs", href: "https://docs.onelabs.cc" },
            { label: "Hackathon", href: "https://dorahacks.io/hackathon/onehackathon" },
          ].map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="brutal-tag bg-white text-black hover:bg-brutal-yellow transition-colors">
              {l.label} ↗
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
