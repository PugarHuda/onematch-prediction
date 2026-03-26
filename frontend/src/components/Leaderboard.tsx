"use client";

import { useState } from "react";

interface LeaderboardEntry {
  rank: number;
  address: string;
  wins: number;
  winRate: number;
  volume: number;
  streak: number;
  badge: string;
}

// Mock data (in production, fetch from smart contract)
const MOCK_LEADERS: LeaderboardEntry[] = [
  { rank: 1, address: "0xace...1337", wins: 247, winRate: 78.5, volume: 12450, streak: 12, badge: "👑" },
  { rank: 2, address: "0xbob...4242", wins: 198, winRate: 72.3, volume: 9870, streak: 8, badge: "💎" },
  { rank: 3, address: "0xcat...9999", wins: 156, winRate: 69.1, volume: 7650, streak: 5, badge: "💎" },
  { rank: 4, address: "0xdog...5555", wins: 134, winRate: 65.8, volume: 6420, streak: 3, badge: "🥇" },
  { rank: 5, address: "0xelf...7777", wins: 112, winRate: 63.2, volume: 5230, streak: 7, badge: "🥇" },
];

type TimeFrame = "daily" | "weekly" | "alltime";

export function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("weekly");

  return (
    <div className="border-3 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden">
      {/* OnePlay Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="brutal-tag bg-brutal-purple text-white text-[10px] animate-pulse-glow">
          ONEPLAY
        </span>
      </div>

      {/* Header */}
      <div className="border-b-3 border-black p-4 bg-brutal-yellow">
        <h3 className="font-mono font-bold text-lg text-black mb-3">
          🏆 LEADERBOARD
        </h3>

        {/* Time Frame Selector */}
        <div className="flex gap-1">
          {(["daily", "weekly", "alltime"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`flex-1 py-1 font-mono text-xs font-bold border-2 border-black transition-all hover:scale-105 ${
                timeFrame === tf
                  ? "bg-black text-brutal-yellow shadow-brutal"
                  : "bg-white text-black hover:bg-brutal-pink"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y-2 divide-black">
        {MOCK_LEADERS.map((entry, i) => (
          <div
            key={entry.address}
            className={`p-3 hover:bg-brutal-yellow/20 transition-all cursor-pointer group ${
              i === 0 ? "bg-brutal-yellow/10" : ""
            }`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div
                className={`w-8 h-8 border-2 border-black flex items-center justify-center font-mono font-bold text-sm shadow-brutal group-hover:scale-110 transition-transform ${
                  entry.rank === 1
                    ? "bg-brutal-yellow text-black"
                    : entry.rank === 2
                    ? "bg-gray-300 text-black"
                    : entry.rank === 3
                    ? "bg-orange-300 text-black"
                    : "bg-white text-black"
                }`}
              >
                {entry.rank}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-black truncate">
                    {entry.address}
                  </span>
                  <span className="text-sm">{entry.badge}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-black/50">
                  <span>🏆 {entry.wins}W</span>
                  <span>📊 {entry.winRate}%</span>
                  <span>💰 {entry.volume} OCT</span>
                  <span className="text-brutal-orange">🔥 {entry.streak}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-mono text-brutal-purple">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t-3 border-black p-3 bg-brutal-purple text-center">
        <p className="font-mono text-xs text-white/80 mb-2">
          Your Rank: <span className="font-bold text-brutal-yellow">#42</span>
        </p>
        <button className="btn-brutal bg-brutal-yellow text-black w-full py-2 text-xs hover:scale-105 active:scale-95">
          VIEW FULL RANKINGS →
        </button>
      </div>

      <p className="font-mono text-[10px] text-black/30 text-center py-2">
        Powered by OnePlay · Live Rankings
      </p>
    </div>
  );
}
