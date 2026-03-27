import Link from "next/link";
import { Header } from "@/components/Header";

const STEPS = [
  { n: "01", title: "SWIPE",  desc: "Browse events one card at a time. Right = YES, Left = NO, Up = YES×3, Down = Skip.",  bg: "#FFE500", icon: "🃏", iconAnim: "animate-levitate" },
  { n: "02", title: "MATCH",  desc: "AI matches you with a real opponent who took the opposite side. Funds locked in escrow.", bg: "#FF3CAC", icon: "⚔️", iconAnim: "animate-sword-clash" },
  { n: "03", title: "WIN",    desc: "Event settles on-chain. Smart contract pays winner 95% of pot. Reputation updates.",     bg: "#00FF87", icon: "🏆", iconAnim: "animate-trophy-bounce" },
];

const STATS = [
  { label: "ACTIVE DUELS", value: "1,247", icon: "⚔️", color: "#FFE500", iconAnim: "animate-sword-clash" },
  { label: "TOTAL POT",    value: "84,320 OCT", icon: "🪙", color: "#00FF87", iconAnim: "animate-coin-flip" },
  { label: "USERS",        value: "3,891", icon: "👥", color: "#4DFFFF", iconAnim: "animate-bounce-subtle" },
  { label: "SETTLED",      value: "12,043", icon: "✅", color: "#FF3CAC", iconAnim: "animate-tada" },
];

const FEATURES = [
  { icon: "🔐", title: "TRUSTLESS", desc: "Smart contract escrow, no middleman", iconAnim: "animate-wobble" },
  { icon: "⚡", title: "INSTANT", desc: "Real-time matching & settlement", iconAnim: "animate-streak-fire" },
  { icon: "🎯", title: "FAIR", desc: "Transparent odds, on-chain verification", iconAnim: "animate-spin-slow" },
  { icon: "🏆", title: "REPUTATION", desc: "Build your OneID profile & badges", iconAnim: "animate-trophy-bounce" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full space-y-8">

        {/* ── Hero ── */}
        <div className="border-3 border-black bg-white shadow-brutal-2xl p-8 hover:shadow-brutal-xl transition-all noise-overlay hover-tilt relative overflow-hidden animate-fade-in-up">
          {/* Animated corner accents with pulse */}
          <div className="absolute top-0 left-0 w-20 h-20 border-r-3 border-b-3 border-brutal-yellow opacity-50 animate-pulse-scale" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-l-3 border-t-3 border-brutal-pink opacity-50 animate-pulse-scale" style={{ animationDelay: '0.5s' }} />
          
          {/* Floating particles */}
          <div className="absolute top-10 right-20 w-3 h-3 bg-brutal-yellow rounded-full opacity-30 animate-float" />
          <div className="absolute bottom-20 left-10 w-2 h-2 bg-brutal-pink rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-10 w-2 h-2 bg-brutal-green rounded-full opacity-30 animate-float" style={{ animationDelay: '1.5s' }} />
          
          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="flex-1">
              <span className="brutal-tag bg-brutal-yellow text-black mb-4 inline-block animate-float">
                BUILT ON ONECHAIN · ONEHACK 3.0
              </span>
              <h1 className="font-mono font-bold text-6xl md:text-7xl leading-none mb-4 text-black">
                SWIPE.<br />
                <span className="text-brutal-pink animate-pulse-scale inline-block">MATCH.</span><br />
                <span className="text-brutal-green animate-bounce-subtle inline-block" style={{ WebkitTextStroke: "2px #0A0A0A" }}>WIN.</span>
              </h1>
              <p className="text-black/60 text-lg mb-6 max-w-md leading-relaxed">
                P2P prediction duels on OneChain. Swipe on events, get matched with a real opponent,
                smart contract holds the pot. No pools. Just you vs them.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/feed" className="btn-yellow px-6 py-3 text-base animate-glow-pulse relative group overflow-hidden">
                  <span className="relative z-10">START SWIPING →</span>
                  <div className="absolute inset-0 bg-brutal-pink opacity-0 group-hover:opacity-20 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
                <Link href="/profile" className="btn-ghost px-6 py-3 text-base hover-tilt group relative overflow-hidden">
                  <span className="relative z-10">MY PROFILE</span>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-brutal-purple group-hover:w-full transition-all duration-300" />
                </Link>
              </div>
            </div>

            {/* Mini card preview with enhanced animations */}
            <div className="w-full md:w-64 border-3 border-black bg-brutal-yellow shadow-brutal-xl hover:shadow-brutal-2xl hover:-translate-y-2 transition-all animate-float card-3d group">
              <div className="border-b-3 border-black p-3 flex justify-between items-center bg-brutal-pink relative overflow-hidden">
                <span className="brutal-tag bg-black text-white relative z-10">₿ CRYPTO</span>
                <span className="font-mono text-xs border border-black bg-white px-2 py-0.5 animate-pulse-glow relative z-10">⏱ 7d</span>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              <div className="p-4">
                <p className="font-mono font-bold text-base leading-tight mb-3 text-black group-hover:text-brutal-purple transition-colors">
                  Will BTC hit $120k before May 2026?
                </p>
                <div className="h-3 border-2 border-black bg-white mb-1 overflow-hidden relative group/bar">
                  <div className="h-full bg-brutal-green transition-all duration-500 group-hover:animate-pulse-scale" style={{ width: "61%" }}>
                    <div className="absolute inset-0 animate-shimmer opacity-0 group-hover/bar:opacity-100" />
                  </div>
                </div>
                <div className="flex justify-between font-mono text-xs text-black">
                  <span>YES 61%</span><span>NO 39%</span>
                </div>
              </div>
              <div className="border-t-3 border-black grid grid-cols-3 divide-x-3 divide-black">
                <div className="py-2 text-center font-mono text-xs font-bold text-brutal-red hover:bg-brutal-red hover:text-white transition-all cursor-pointer hover:scale-110 duration-200">← NO</div>
                <div className="py-2 text-center font-mono text-xs font-bold text-brutal-orange hover:bg-brutal-orange hover:text-black transition-all cursor-pointer hover:scale-110 duration-200">↑ 3×</div>
                <div className="py-2 text-center font-mono text-xs font-bold hover:bg-brutal-green hover:text-black transition-all cursor-pointer hover:scale-110 duration-200" style={{ color: "#00AA55" }}>YES →</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="border-3 border-black bg-white shadow-brutal-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="border-b-3 border-black p-3 bg-black flex items-center justify-between">
            <h2 className="font-mono font-bold text-lg text-brutal-yellow">HOW IT WORKS</h2>
            <span className="font-mono text-xs text-white/40">3 steps to start dueling</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y-3 md:divide-y-0 md:divide-x-3 divide-black">
            {STEPS.map((s) => (
              <div key={s.n} className="p-4 hover:bg-brutal-yellow/10 transition-colors group relative overflow-hidden" style={{ backgroundColor: s.bg + "20" }}>
                <div className="flex items-start gap-3">
                  <div className="border-2 border-black w-10 h-10 flex items-center justify-center font-mono font-bold text-lg shadow-brutal flex-shrink-0" style={{ backgroundColor: s.bg }}>
                    {s.n}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-sm text-black mb-1">{s.title}</p>
                    <p className="font-mono text-xs text-black/60 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="border-3 border-black bg-black shadow-brutal-xl grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x-3 divide-y-3 md:divide-y-0 divide-brutal-yellow overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {/* Animated background lines */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-px bg-brutal-yellow animate-shimmer" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-brutal-pink animate-shimmer" style={{ animationDelay: '1s' }} />
            <div className="absolute left-0 top-0 w-px h-full bg-brutal-green animate-shimmer" style={{ animationDelay: '0.5s' }} />
            <div className="absolute right-0 top-0 w-px h-full bg-brutal-purple animate-shimmer" style={{ animationDelay: '1.5s' }} />
          </div>
          
          {STATS.map((s, i) => (
            <div key={s.label} className="p-5 text-center hover:bg-brutal-yellow/10 transition-all group cursor-pointer relative z-10 spotlight" style={{ animationDelay: `${i * 0.1}s` }}>
              {/* Icon */}
              <div className={`text-2xl mb-1 opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all inline-block ${s.iconAnim}`} style={{ color: s.color }}>
                {s.icon}
              </div>
              <p className="font-mono font-bold text-3xl text-brutal-yellow group-hover:scale-125 transition-transform inline-block group-hover:animate-neon duration-300">{s.value}</p>
              <p className="font-mono text-xs text-white/40 uppercase mt-1 group-hover:text-white/70 transition-colors">{s.label}</p>
              {/* Hover indicator with expand animation */}
              <div className="absolute bottom-0 left-0 w-0 h-1 group-hover:w-full transition-all duration-500 animate-expand" style={{ backgroundColor: s.color }} />
              {/* Pulse dot */}
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 animate-pulse-glow" style={{ backgroundColor: s.color }} />
            </div>
          ))}
        </div>

        {/* ── Features Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="border-3 border-black bg-white shadow-brutal p-4 hover:shadow-brutal-lg hover:-translate-y-1 transition-all text-center group cursor-pointer relative overflow-hidden animate-pop-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Hover background */}
              <div className="absolute inset-0 bg-brutal-yellow opacity-0 group-hover:opacity-20 transition-opacity" />
              
              <div className={`text-3xl mb-2 group-hover:scale-125 group-hover:rotate-6 transition-all inline-block relative z-10 ${f.iconAnim}`}>
                {f.icon}
              </div>
              <p className="font-mono font-bold text-sm text-black mb-1 relative z-10 group-hover:text-brutal-purple transition-colors">{f.title}</p>
              <p className="font-mono text-xs text-black/50 leading-relaxed relative z-10">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Game Mechanics ── */}
        <div className="border-3 border-black bg-white shadow-brutal-xl animate-fade-in-up" style={{ animationDelay: '0.42s' }}>
          <div className="border-b-3 border-black p-4 bg-brutal-pink">
            <h2 className="font-mono font-bold text-xl text-black">🎮 HOW THE GAME WORKS</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {[
                { step: "1", title: "SWIPE", desc: "Browse prediction events. Swipe right=YES, left=NO, up=3× stake", bg: "#FFE500" },
                { step: "2", title: "AI ANALYZE", desc: "NLP reads news headlines. Get YES/NO/HOLD recommendation with confidence %", bg: "#BF5FFF" },
                { step: "3", title: "BET", desc: "OCT locked in smart contract escrow. Min 0.1 OCT, max 10K OCT", bg: "#4DFFFF" },
                { step: "4", title: "MATCH", desc: "AI matchmaker finds opponent with opposite position. Equal stakes required", bg: "#FF3CAC" },
                { step: "5", title: "WIN", desc: "Event settles on-chain. Winner gets 95% of pot. Reputation + XP earned", bg: "#00FF87" },
              ].map((s) => (
                <div key={s.step} className="border-2 border-black p-3 text-center" style={{ backgroundColor: s.bg }}>
                  <p className="font-mono font-bold text-3xl text-black/20">{s.step}</p>
                  <p className="font-mono font-bold text-sm text-black">{s.title}</p>
                  <p className="font-mono text-[10px] text-black/60 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Economy + GameFi */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-black bg-brutal-bg p-3">
                <p className="font-mono text-xs font-bold text-black mb-2">💰 ECONOMY</p>
                <div className="space-y-1 font-mono text-[10px] text-black/60">
                  <p>• Min bet: 0.1 OCT · Max: 10,000 OCT</p>
                  <p>• Winner takes 95% of pot</p>
                  <p>• 5% platform fee → Treasury</p>
                  <p>• Unmatched bets auto-cancel after 24h</p>
                  <p>• OneDEX swap for token conversion</p>
                </div>
              </div>
              <div className="border-2 border-black bg-brutal-bg p-3">
                <p className="font-mono text-xs font-bold text-black mb-2">🏆 GAMEFI</p>
                <div className="space-y-1 font-mono text-[10px] text-black/60">
                  <p>• XP system: LV.1 Rookie → LV.10 Legend</p>
                  <p>• ELO rating: AI-calculated skill score</p>
                  <p>• Win streak bonuses (+5 rep per 5 wins)</p>
                  <p>• Dynamic badges from on-chain stats</p>
                  <p>• OnePlay leaderboard ranked by ELO</p>
                </div>
              </div>
            </div>

            {/* AI */}
            <div className="border-2 border-black bg-brutal-purple p-3">
              <p className="font-mono text-xs font-bold text-white mb-2">🧠 AI ENGINE</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "NLP SENTIMENT", value: "55%", desc: "Weighted keyword analysis of news" },
                  { label: "CROWD WISDOM", value: "35%", desc: "YES/NO vote ratio from players" },
                  { label: "BASE SIGNAL", value: "10%", desc: "Market context + recency" },
                ].map((f) => (
                  <div key={f.label} className="border border-white/20 p-2 text-center">
                    <p className="font-mono font-bold text-lg text-brutal-yellow">{f.value}</p>
                    <p className="font-mono text-[10px] text-white/80 font-bold">{f.label}</p>
                    <p className="font-mono text-[10px] text-white/40">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Documentation / Tech Stack ── */}
        <div className="border-3 border-black bg-white shadow-brutal-xl animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
          <div className="border-b-3 border-black p-4 bg-black">
            <h2 className="font-mono font-bold text-xl text-brutal-yellow flex items-center gap-2">
              📋 TECH STACK & INTEGRATION
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x-3 divide-y-3 md:divide-y-0 divide-black">
            {[
              { title: "SMART CONTRACTS", items: ["3 Move modules", "14 unit tests", "P2P escrow", "Treasury config"], color: "#FFE500" },
              { title: "ONECHAIN PRODUCTS", items: ["OneWallet", "OneDEX swap", "OnePlay ranks", "OneID profiles"], color: "#FF3CAC" },
              { title: "AI & GAMEFI", items: ["NLP sentiment", "AI matchmaking", "ELO rating", "XP/Level system"], color: "#4DFFFF" },
              { title: "FRONTEND", items: ["Next.js 15", "Framer Motion", "Zustand state", "GNews API"], color: "#00FF87" },
            ].map((col) => (
              <div key={col.title} className="p-4">
                <p className="font-mono text-xs font-bold uppercase mb-2" style={{ color: col.color }}>{col.title}</p>
                <ul className="space-y-1">
                  {col.items.map((item) => (
                    <li key={item} className="font-mono text-xs text-black/60 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-black/30 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t-3 border-black p-3 bg-brutal-bg flex flex-wrap items-center justify-center gap-3">
            <a href="https://github.com/PugarHuda/onematch-prediction" target="_blank" rel="noopener noreferrer"
              className="brutal-tag bg-black text-white hover:bg-brutal-purple transition-colors">GITHUB ↗</a>
            <a href="https://onescan.cc/testnet" target="_blank" rel="noopener noreferrer"
              className="brutal-tag bg-black text-white hover:bg-brutal-purple transition-colors">ONESCAN ↗</a>
            <a href="https://docs.onelabs.cc" target="_blank" rel="noopener noreferrer"
              className="brutal-tag bg-black text-white hover:bg-brutal-purple transition-colors">ONECHAIN DOCS ↗</a>
            <span className="brutal-tag bg-brutal-yellow text-black">PACKAGE: 0xcf72...ca39</span>
          </div>
        </div>

        {/* ── OneChain badge ── */}
        <div className="border-3 border-black bg-brutal-purple shadow-brutal p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-brutal-xl transition-all relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-brutal-purple via-brutal-pink/20 to-brutal-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient" />
          
          <div className="relative z-10">
            <p className="font-mono font-bold text-xl text-white group-hover:scale-105 transition-transform inline-block flex items-center gap-2">
              <span className="animate-pulse-scale inline-block">⛓️</span>
              Powered by OneChain
            </p>
            <p className="font-mono text-xs text-white/50 mt-1 group-hover:text-white/70 transition-colors">
              Move-based smart contracts · OCT native token · OneWallet · OneID reputation
            </p>
          </div>
          <a
            href="https://onelabs.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-yellow px-4 py-2 text-sm whitespace-nowrap hover:scale-110 transition-transform relative z-10 group/btn overflow-hidden"
          >
            <span className="relative z-10">LEARN MORE ↗</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
          </a>
        </div>
      </main>

      <footer className="border-t-3 border-black bg-white py-6 text-center hover:bg-brutal-yellow/20 transition-colors group relative overflow-hidden">
        {/* Animated shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brutal-yellow/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="relative z-10 space-y-2">
          <p className="font-mono text-xs text-black/30 group-hover:text-black/50 transition-colors">
            ONEMATCH · ONECHAIN · ONEHACK 3.0 · MIT LICENSE
          </p>
          <div className="flex items-center justify-center gap-4 font-mono text-xs">
            <a href="https://github.com/PugarHuda/onematch-prediction" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-brutal-purple transition-colors hover:scale-110 inline-block">
              GITHUB ↗
            </a>
            <span className="text-black/20">·</span>
            <a href="https://docs.onelabs.cc" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-brutal-purple transition-colors hover:scale-110 inline-block">
              DOCS ↗
            </a>
            <span className="text-black/20">·</span>
            <a href="https://onebox.onelabs.cc" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-brutal-purple transition-colors hover:scale-110 inline-block">
              FAUCET ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
