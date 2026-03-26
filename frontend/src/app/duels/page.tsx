"use client";

import { useCurrentAccount } from "@onelabs/dapp-kit";
import { Header } from "@/components/Header";
import { explorerTxUrl } from "@/lib/onechain";
import { CATEGORY_EMOJI } from "@/lib/constants";
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-mono font-bold text-3xl text-black">
            MY DUELS
            <span className="text-brutal-pink ml-2 text-lg">{MOCK_DUELS.length}</span>
          </h1>
          <Link href="/feed" className="btn-yellow px-4 py-2 text-sm">+ NEW BET</Link>
        </div>

        {/* Summary */}
        <div className="border-3 border-black bg-black shadow-brutal-xl grid grid-cols-3 divide-x-3 divide-brutal-yellow mb-6">
          {[
            { label: "ACTIVE", value: "2", color: "text-brutal-yellow" },
            { label: "WON",    value: "1", color: "text-brutal-green"  },
            { label: "LOST",   value: "0", color: "text-brutal-red"    },
          ].map((s) => (
            <div key={s.label} className="p-4 text-center">
              <p className={`font-mono font-bold text-3xl ${s.color}`}>{s.value}</p>
              <p className="font-mono text-xs text-white/40 uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Duel cards */}
        <div className="space-y-4">
          {MOCK_DUELS.map((duel) => {
            const cfg = STATUS_CFG[duel.status] ?? STATUS_CFG.pending;
            const diff = duel.endTime - Date.now();
            const timeLeft = diff < 0 ? "ENDED" : `${Math.floor(diff / 86_400_000)}d left`;

            return (
              <div key={duel.id} className="border-3 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all">
                {/* Status bar */}
                <div
                  className="border-b-3 border-black p-3 flex items-center justify-between"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <span className="brutal-tag bg-black text-white">{cfg.label}</span>
                  <span className="font-mono text-xs border border-black bg-white text-black px-2 py-0.5">
                    {timeLeft}
                  </span>
                </div>

                <div className="p-4">
                  {/* Category + question */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="brutal-tag bg-brutal-yellow text-black">
                      {CATEGORY_EMOJI[duel.category]} {duel.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-mono font-bold text-lg text-black mb-4 leading-tight">
                    {duel.question}
                  </p>

                  {/* Players */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 border-2 border-black p-3 text-center bg-brutal-bg">
                      <p className="font-mono text-xs text-black/40 mb-1">YOU</p>
                      <p className={`font-mono font-bold text-xl ${duel.myPosition ? "text-brutal-green" : "text-brutal-red"}`}
                        style={{ WebkitTextStroke: "1px #0A0A0A" }}>
                        {duel.myPosition ? "YES" : "NO"}
                      </p>
                    </div>
                    <div className="font-mono font-bold text-2xl text-black/30">⚔️</div>
                    <div className="flex-1 border-2 border-black p-3 text-center bg-brutal-bg">
                      <p className="font-mono text-xs text-black/40 mb-1 truncate">
                        {duel.opponent.slice(0, 8)}…
                      </p>
                      <p className={`font-mono font-bold text-xl ${!duel.myPosition ? "text-brutal-green" : "text-brutal-red"}`}
                        style={{ WebkitTextStroke: "1px #0A0A0A" }}>
                        {!duel.myPosition ? "YES" : "NO"}
                      </p>
                      <p className="font-mono text-xs text-black/40">
                        {duel.opponentWinRate}% WR · 🔥{duel.opponentStreak}
                      </p>
                    </div>
                  </div>

                  {/* Pot + explorer */}
                  <div className="flex items-center justify-between border-t-2 border-black pt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-black/40">POT:</span>
                      <span className="font-mono font-bold text-brutal-pink text-lg">{duel.potOCT} OCT</span>
                    </div>
                    <a
                      href={explorerTxUrl(duel.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-brutal-purple hover:underline font-bold"
                    >
                      ON-CHAIN ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
