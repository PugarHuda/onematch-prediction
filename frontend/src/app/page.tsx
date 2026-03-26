import Link from "next/link";
import { Header } from "@/components/Header";

const STEPS = [
  { n: "01", title: "SWIPE",  desc: "Browse events one card at a time. Right = YES, Left = NO, Up = YES×3, Down = Skip.",  bg: "#FFE500" },
  { n: "02", title: "MATCH",  desc: "AI matches you with a real opponent who took the opposite side. Funds locked in escrow.", bg: "#FF3CAC" },
  { n: "03", title: "WIN",    desc: "Event settles on-chain. Smart contract pays winner 95% of pot. Reputation updates.",     bg: "#00FF87" },
];

const STATS = [
  { label: "ACTIVE DUELS", value: "1,247" },
  { label: "TOTAL POT",    value: "84,320 OCT" },
  { label: "USERS",        value: "3,891" },
  { label: "SETTLED",      value: "12,043" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full space-y-8">

        {/* ── Hero ── */}
        <div className="border-3 border-black bg-white shadow-brutal-2xl p-8 hover:shadow-brutal-xl transition-all noise-overlay hover-tilt relative overflow-hidden">
          {/* Animated corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-r-3 border-b-3 border-brutal-yellow opacity-50" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-l-3 border-t-3 border-brutal-pink opacity-50" />
          
          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="flex-1">
              <span className="brutal-tag bg-brutal-yellow text-black mb-4 inline-block animate-float">
                BUILT ON ONECHAIN · ONEHACK 3.0
              </span>
              <h1 className="font-mono font-bold text-6xl md:text-7xl leading-none mb-4 text-black">
                SWIPE.<br />
                <span className="text-brutal-pink animate-pulse">MATCH.</span><br />
                <span className="text-brutal-green animate-bounce-subtle inline-block" style={{ WebkitTextStroke: "2px #0A0A0A" }}>WIN.</span>
              </h1>
              <p className="text-black/60 text-lg mb-6 max-w-md">
                P2P prediction duels on OneChain. Swipe on events, get matched with a real opponent,
                smart contract holds the pot. No pools. Just you vs them.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/feed" className="btn-yellow px-6 py-3 text-base animate-glow-pulse relative group">
                  <span className="relative z-10">START SWIPING →</span>
                  <div className="absolute inset-0 bg-brutal-pink opacity-0 group-hover:opacity-20 transition-opacity" />
                </Link>
                <Link href="/profile" className="btn-ghost px-6 py-3 text-base hover-tilt">
                  MY PROFILE
                </Link>
              </div>
            </div>

            {/* Mini card preview */}
            <div className="w-full md:w-64 border-3 border-black bg-brutal-yellow shadow-brutal-xl hover:shadow-brutal-2xl hover:-translate-y-1 transition-all animate-float">
              <div className="border-b-3 border-black p-3 flex justify-between items-center bg-brutal-pink">
                <span className="brutal-tag bg-black text-white">₿ CRYPTO</span>
                <span className="font-mono text-xs border border-black bg-white px-2 py-0.5 animate-pulse-glow">⏱ 7d</span>
              </div>
              <div className="p-4">
                <p className="font-mono font-bold text-base leading-tight mb-3 text-black">
                  Will BTC hit $120k before May 2026?
                </p>
                <div className="h-3 border-2 border-black bg-white mb-1 overflow-hidden relative group">
                  <div className="h-full bg-brutal-green transition-all duration-500" style={{ width: "61%" }}>
                    <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <div className="flex justify-between font-mono text-xs text-black">
                  <span>YES 61%</span><span>NO 39%</span>
                </div>
              </div>
              <div className="border-t-3 border-black grid grid-cols-3 divide-x-3 divide-black">
                <div className="py-2 text-center font-mono text-xs font-bold text-brutal-red hover:bg-brutal-red hover:text-white transition-colors cursor-pointer">← NO</div>
                <div className="py-2 text-center font-mono text-xs font-bold text-brutal-orange hover:bg-brutal-orange hover:text-black transition-colors cursor-pointer">↑ 3×</div>
                <div className="py-2 text-center font-mono text-xs font-bold hover:bg-brutal-green hover:text-black transition-colors cursor-pointer" style={{ color: "#00AA55" }}>YES →</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="border-3 border-black shadow-brutal p-5 hover:shadow-brutal-xl hover:-translate-y-1 transition-all cursor-pointer group"
              style={{ 
                backgroundColor: s.bg,
                animationDelay: `${i * 0.1}s`
              }}
            >
              <p className="font-mono font-bold text-5xl text-black/15 mb-1 group-hover:text-black/25 transition-colors">{s.n}</p>
              <h3 className="font-mono font-bold text-2xl text-black mb-2 group-hover:scale-105 transition-transform inline-block">{s.title}</h3>
              <p className="text-black/70 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Stats ── */}
        <div className="border-3 border-black bg-black shadow-brutal-xl grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x-3 divide-y-3 md:divide-y-0 divide-brutal-yellow overflow-hidden relative">
          {/* Animated background lines */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-px bg-brutal-yellow animate-shimmer" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-brutal-pink animate-shimmer" style={{ animationDelay: '1s' }} />
          </div>
          
          {STATS.map((s, i) => (
            <div key={s.label} className="p-5 text-center hover:bg-brutal-yellow/10 transition-all group cursor-pointer relative z-10" style={{ animationDelay: `${i * 0.1}s` }}>
              <p className="font-mono font-bold text-2xl text-brutal-yellow group-hover:scale-110 transition-transform inline-block group-hover:animate-neon">{s.value}</p>
              <p className="font-mono text-xs text-white/40 uppercase mt-1 group-hover:text-white/60 transition-colors">{s.label}</p>
              {/* Hover indicator */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-brutal-yellow group-hover:w-full transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* ── OneChain badge ── */}
        <div className="border-3 border-black bg-brutal-purple shadow-brutal p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-brutal-xl transition-all">
          <div>
            <p className="font-mono font-bold text-xl text-white">Powered by OneChain</p>
            <p className="font-mono text-xs text-white/50 mt-1">
              Move-based smart contracts · OCT native token · OneWallet · OneID reputation
            </p>
          </div>
          <a
            href="https://onelabs.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-yellow px-4 py-2 text-sm whitespace-nowrap hover:scale-105 transition-transform"
          >
            LEARN MORE ↗
          </a>
        </div>
      </main>

      <footer className="border-t-3 border-black bg-white py-4 text-center hover:bg-brutal-yellow/20 transition-colors">
        <p className="font-mono text-xs text-black/30">
          ONEMATCH · ONECHAIN · ONEHACK 3.0 · MIT LICENSE
        </p>
      </footer>
    </div>
  );
}
