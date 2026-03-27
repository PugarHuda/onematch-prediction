"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { Header } from "@/components/Header";
import { explorerTxUrl } from "@/lib/onechain";
import { CATEGORY_EMOJI } from "@/lib/constants";
import { fetchDuelsForPlayer } from "@/lib/onechain";
import Link from "next/link";

const MOCK_DUELS = [
  {
    id: "0xduel001",
    question: "Will BTC hit $120k before May 2026?",
    myPosition: true,
    opponent: "0xdeadbeef1234",
    opponentStreak: 5,
    opponentWinRate: 67,
    potOCT: 200,
    status: "matched",
    category: "crypto",
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "0xduel002",
    question: "Will ETH flip BTC in market cap by end of 2026?",
    myPosition: false,
    opponent: "0xcafebabe5678",
    opponentStreak: 2,
    opponentWinRate: 54,
    potOCT: 100,
    status: "pending",
    category: "crypto",
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: "0xduel003",
    question: "Will AI replace 30% of software dev jobs by 2027?",
    myPosition: true,
    opponent: "0x1337c0de9abc",
    opponentStreak: 0,
    opponentWinRate: 45,
    potOCT: 300,
    status: "settled_win",
    category: "tech",
    endTime: Date.now() - 1000 * 60 * 60 * 24,
  },
];

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  matched:      { label: "ACTIVE DUEL",    bg: "#FFE500", text: "#0A0A0A" },
  pending:      { label: "FINDING MATCH",  bg: "#4DFFFF", text: "#0A0A0A" },
  settled_win:  { label: "YOU WON 🏆",     bg: "#00FF87", text: "#0A0A0A" },
  settled_loss: { label: "YOU LOST",       bg: "#FF2D55", text: "#FAFAFA" },
};

export default function DuelsPage() {
  const account = useCurrentAccount();
  const [filter, setFilter] = useState<"all" | "active" | "settled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onChainCount, setOnChainCount] = useState<{ matched: number; settled: number } | null>(null);

  // Fetch on-chain duel events for this player
  useEffect(() => {
    if (!account) return;
    fetchDuelsForPlayer(account.address)
      .then(({ matched, settled }) => {
        setOnChainCount({ matched: matched.length, settled: settled.length });
      })
      .catch(() => {});
  }, [account]);

  const filteredDuels = MOCK_DUELS.filter((duel) => {
    const matchesFilter = 
      filter === "all" ||
      (filter === "active" && (duel.status === "matched" || duel.status === "pending")) ||
      (filter === "settled" && (duel.status === "settled_win" || duel.status === "settled_loss"));
    
    const matchesSearch = duel.question.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col bg-brutal-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="border-3 border-black bg-brutal-yellow shadow-brutal p-8 text-center">
            <p className="font-mono font-bold text-xl">CONNECT WALLET</p>
            <p className="text-black/60 text-sm mt-2">Connect to view your duels.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 animate-slide-in-left">
          <h1 className="font-mono font-bold text-3xl text-black relative group">
            <span className="relative z-10 flex items-center gap-2">
              <span className="inline-block animate-sword-clash">⚔️</span>
              MY DUELS
            </span>
            <span className="text-brutal-pink ml-2 text-lg animate-pulse-scale inline-block">{MOCK_DUELS.length}</span>
            {/* Animated underline */}
            <div className="absolute -bottom-1 left-0 w-32 h-1 bg-brutal-pink group-hover:w-full transition-all duration-300" />
          </h1>
          <Link href="/feed" className="btn-yellow px-4 py-2 text-sm hover:scale-110 active:scale-95 relative overflow-hidden group">
            <span className="relative z-10">+ NEW BET</span>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          </Link>
        </div>

        {/* Summary */}
        <div className="border-3 border-black bg-black shadow-brutal-xl grid grid-cols-3 divide-x-3 divide-brutal-yellow mb-6 relative overflow-hidden group animate-pop-in">
          {/* Animated glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-brutal-yellow/0 via-brutal-yellow/20 to-brutal-yellow/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {[
            { label: "ACTIVE", value: onChainCount ? String(onChainCount.matched) : "2", color: "text-brutal-yellow", icon: "⚔️", iconAnim: "animate-sword-clash" },
            { label: "WON",    value: "1", color: "text-brutal-green",  icon: "🏆", iconAnim: "animate-trophy-bounce" },
            { label: "SETTLED", value: onChainCount ? String(onChainCount.settled) : "0", color: "text-brutal-red", icon: "✅", iconAnim: "animate-tada" },
          ].map((s, i) => (
            <div key={s.label} className="p-4 text-center relative z-10 hover:bg-white/5 transition-colors cursor-pointer group/stat" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`absolute top-2 right-2 opacity-30 group-hover/stat:opacity-80 group-hover/stat:scale-125 transition-all ${s.iconAnim}`}>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className={`font-mono font-bold text-3xl ${s.color} group-hover/stat:scale-110 transition-transform inline-block`}>{s.value}</p>
              <p className="font-mono text-xs text-white/40 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
        
        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
          {/* Filter buttons */}
          <div className="flex gap-1">
            {(["all", "active", "settled"] as const).map((f, i) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-mono text-xs font-bold border-2 border-black transition-all hover:scale-105 ${
                  filter === f
                    ? "bg-black text-brutal-yellow shadow-brutal"
                    : "bg-white text-black hover:bg-brutal-pink"
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search duels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="brutal-input text-sm flex-1 min-w-0"
          />
        </div>

        {/* Duel cards */}
        <div className="space-y-4">
          {filteredDuels.length === 0 ? (
            <div className="border-3 border-black bg-white shadow-brutal p-8 text-center animate-fade-in-up">
              <div className="text-5xl mb-3 animate-bounce-subtle">🔍</div>
              <p className="font-mono font-bold text-xl text-black mb-2">NO DUELS FOUND</p>
              <p className="font-mono text-sm text-black/50">Try adjusting your filters or search query</p>
            </div>
          ) : (
            filteredDuels.map((duel, idx) => {
            const cfg = STATUS_CFG[duel.status] ?? STATUS_CFG.pending;
            const diff = duel.endTime - Date.now();
            const timeLeft = diff < 0 ? "ENDED" : `${Math.floor(diff / 86_400_000)}d left`;

            return (
              <div key={duel.id} className="border-3 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all animate-slide-in-left relative overflow-hidden group" style={{ animationDelay: `${idx * 0.1}s` }}>
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-brutal-yellow/0 via-brutal-pink/0 to-brutal-cyan/0 group-hover:from-brutal-yellow/10 group-hover:via-brutal-pink/10 group-hover:to-brutal-cyan/10 transition-all duration-500 pointer-events-none" />
                
                {/* Status bar */}
                <div
                  className="border-b-3 border-black p-3 flex items-center justify-between relative overflow-hidden"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <span className="brutal-tag bg-black text-white relative z-10 animate-pop-in">{cfg.label}</span>
                  <span className="font-mono text-xs border border-black bg-white text-black px-2 py-0.5 relative z-10 animate-pulse-glow">
                    {timeLeft}
                  </span>
                  {/* Animated shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                <div className="p-4 relative z-10">
                  {/* Category + question */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="brutal-tag bg-brutal-yellow text-black animate-pop-in">
                      {CATEGORY_EMOJI[duel.category]} {duel.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-mono font-bold text-lg text-black mb-4 leading-tight hover:text-brutal-purple transition-colors cursor-pointer">
                    {duel.question}
                  </p>

                  {/* Players */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 border-2 border-black p-3 text-center bg-brutal-bg hover:shadow-brutal transition-all group/player">
                      <p className="font-mono text-xs text-black/40 mb-1">YOU</p>
                      <p className={`font-mono font-bold text-xl group-hover/player:scale-110 transition-transform inline-block ${duel.myPosition ? "text-brutal-green" : "text-brutal-red"}`}
                        style={{ WebkitTextStroke: "1px #0A0A0A" }}>
                        {duel.myPosition ? "YES" : "NO"}
                      </p>
                    </div>
                    <div className="font-mono font-bold text-2xl text-black/30 animate-pulse-scale">⚔️</div>
                    <div className="flex-1 border-2 border-black p-3 text-center bg-brutal-bg hover:shadow-brutal transition-all group/opponent">
                      <p className="font-mono text-xs text-black/40 mb-1 truncate">
                        {duel.opponent.slice(0, 8)}…
                      </p>
                      <p className={`font-mono font-bold text-xl group-hover/opponent:scale-110 transition-transform inline-block ${!duel.myPosition ? "text-brutal-green" : "text-brutal-red"}`}
                        style={{ WebkitTextStroke: "1px #0A0A0A" }}>
                        {!duel.myPosition ? "YES" : "NO"}
                      </p>
                      <p className="font-mono text-xs text-black/40">
                        {duel.opponentWinRate}% WR · <span className="text-brutal-orange animate-pulse">🔥{duel.opponentStreak}</span>
                      </p>
                    </div>
                  </div>

                  {/* Pot + explorer */}
                  <div className="flex items-center justify-between border-t-2 border-black pt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-black/40">POT:</span>
                      <span className="font-mono font-bold text-brutal-pink text-lg animate-pulse-scale inline-block">{duel.potOCT} OCT</span>
                    </div>
                    <a
                      href={explorerTxUrl(duel.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-brutal-purple hover:underline font-bold hover:translate-x-1 transition-transform inline-block"
                    >
                      ON-CHAIN ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </main>
    </div>
  );
}
