"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { Header } from "@/components/Header";
import { explorerTxUrl } from "@/lib/onechain";
import { CATEGORY_EMOJI } from "@/lib/constants";
import { fetchDuelsForPlayer } from "@/lib/onechain";
import { useAppStore } from "@/lib/store";
import { Swords, Trophy, Search, Plus } from "lucide-react";
import Link from "next/link";

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  pending:      { label: "FINDING MATCH",  bg: "#4DFFFF" },
  matched:      { label: "ACTIVE DUEL",    bg: "#FFE500" },
  settled_win:  { label: "YOU WON",        bg: "#00FF87" },
  settled_loss: { label: "YOU LOST",       bg: "#FF2D55" },
};

export default function DuelsPage() {
  const account = useCurrentAccount();
  const bets = useAppStore((s) => s.bets);
  const [filter, setFilter] = useState<"all"|"active"|"settled">("all");
  const [search, setSearch] = useState("");
  const [chainCount, setChainCount] = useState({ matched: 0, settled: 0 });

  useEffect(() => {
    if (!account) return;
    fetchDuelsForPlayer(account.address)
      .then(({ matched, settled }) => setChainCount({ matched: matched.length, settled: settled.length }))
      .catch(() => {});
  }, [account]);

  // Build duel list from bets placed in this session
  const duels = bets.map((b) => ({
    id: b.txDigest,
    question: b.question,
    myPosition: b.position,
    opponent: "0x" + Math.random().toString(16).slice(2, 14),
    potOCT: b.stakeOCT * 2,
    status: "pending" as string,
    category: "crypto",
    endTime: b.timestamp + 7 * 86_400_000,
  }));

  const filtered = duels.filter((d) => {
    if (filter === "active" && d.status !== "pending" && d.status !== "matched") return false;
    if (filter === "settled" && !d.status.startsWith("settled")) return false;
    if (search && !d.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col bg-brutal-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="border-3 border-black bg-brutal-yellow shadow-brutal p-8 text-center">
            <p className="font-mono font-bold text-xl">CONNECT WALLET</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-mono font-bold text-3xl text-black flex items-center gap-2">
            <Swords size={28} className="animate-sword-clash" /> MY DUELS
            <span className="text-brutal-pink text-lg">{duels.length}</span>
          </h1>
          <Link href="/feed" className="btn-yellow px-4 py-2 text-sm flex items-center gap-1">
            <Plus size={14} /> NEW BET
          </Link>
        </div>

        {/* Summary */}
        <div className="border-3 border-black bg-black shadow-brutal-xl grid grid-cols-3 divide-x-3 divide-brutal-yellow mb-6">
          {[
            { label: "BETS PLACED", value: String(duels.length + chainCount.matched), color: "text-brutal-yellow" },
            { label: "ON-CHAIN", value: String(chainCount.matched), color: "text-brutal-green" },
            { label: "SETTLED", value: String(chainCount.settled), color: "text-brutal-red" },
          ].map((s) => (
            <div key={s.label} className="p-4 text-center">
              <p className={`font-mono font-bold text-3xl ${s.color}`}>{s.value}</p>
              <p className="font-mono text-xs text-white/40 uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-1">
            {(["all","active","settled"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 font-mono text-xs font-bold border-2 border-black transition-all ${
                  filter===f ? "bg-black text-brutal-yellow shadow-brutal" : "bg-white text-black hover:bg-brutal-pink"}`}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
            <input type="text" placeholder="Search duels..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="brutal-input text-sm pl-8" />
          </div>
        </div>

        {/* Duel cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="border-3 border-black bg-white shadow-brutal p-8 text-center">
              <Swords size={48} className="mx-auto mb-3 text-black/20" />
              <p className="font-mono font-bold text-xl text-black mb-2">
                {duels.length === 0 ? "NO BETS YET" : "NO DUELS FOUND"}
              </p>
              <p className="font-mono text-sm text-black/50 mb-4">
                {duels.length === 0 ? "Place your first bet in the Feed!" : "Try adjusting your filters"}
              </p>
              {duels.length === 0 && (
                <Link href="/feed" className="btn-yellow px-6 py-2 text-sm inline-block">GO TO FEED →</Link>
              )}
            </div>
          ) : (
            filtered.map((duel, idx) => {
              const cfg = STATUS_CFG[duel.status] ?? STATUS_CFG.pending;
              const diff = duel.endTime - Date.now();
              const timeLeft = diff < 0 ? "ENDED" : `${Math.floor(diff / 86_400_000)}d left`;
              return (
                <div key={duel.id + idx} className="border-3 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden group">
                  <div className="border-b-3 border-black p-3 flex items-center justify-between" style={{ backgroundColor: cfg.bg }}>
                    <span className="brutal-tag bg-black text-white">{cfg.label}</span>
                    <span className="font-mono text-xs border border-black bg-white text-black px-2 py-0.5">{timeLeft}</span>
                  </div>
                  <div className="p-4">
                    <p className="font-mono font-bold text-lg text-black mb-4 leading-tight">{duel.question}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 border-2 border-black p-3 text-center bg-brutal-bg">
                        <p className="font-mono text-xs text-black/40 mb-1">YOU</p>
                        <p className={`font-mono font-bold text-xl ${duel.myPosition ? "text-brutal-green" : "text-brutal-red"}`}>
                          {duel.myPosition ? "YES" : "NO"}
                        </p>
                      </div>
                      <Swords size={20} className="text-black/30" />
                      <div className="flex-1 border-2 border-black p-3 text-center bg-brutal-bg">
                        <p className="font-mono text-xs text-black/40 mb-1 truncate">{duel.opponent.slice(0,8)}…</p>
                        <p className={`font-mono font-bold text-xl ${!duel.myPosition ? "text-brutal-green" : "text-brutal-red"}`}>
                          {!duel.myPosition ? "YES" : "NO"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t-2 border-black pt-3">
                      <span className="font-mono font-bold text-brutal-pink text-lg">{duel.potOCT} OCT</span>
                      {duel.id && !duel.id.startsWith("demo") && (
                        <a href={explorerTxUrl(duel.id)} target="_blank" rel="noopener noreferrer"
                          className="font-mono text-xs text-brutal-purple hover:underline font-bold">ON-CHAIN ↗</a>
                      )}
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
