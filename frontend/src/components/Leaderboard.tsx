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
    <div className="border-3 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden group">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-1 bg-brutal-purple animate-shimmer" />
        <div className="absolute bottom-0 right-0 w-full h-1 bg-brutal-yellow animate-shimmer" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* OnePlay Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="brutal-tag bg-brutal-purple text-white text-[10px] animate-pulse-glow relative overflow-hidden">
          <span className="relative z-10">ONEPLAY</span>
          <div className="absolute inset-0 bg-white opacity-0 animate-shimmer" />
        </span>
      </div>

      {/* Header */}
      <div className="border-b-3 border-black p-4 bg-brutal-yellow relative overflow-hidden">
        {/* Animated shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <h3 className="font-mono font-bold text-lg text-black mb-3 relative z-10 flex items-center gap-2">
          <span className="animate-bounce-subtle inline-block">🏆</span>
          LEADERBOARD
        </h3>

        {/* Time Frame Selector */}
        <div className="flex gap-1 relative z-10">
          {(["daily", "weekly", "alltime"] as TimeFrame[]).map((tf, i) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`flex-1 py-1 font-mono text-xs font-bold border-2 border-black transition-all hover:scale-105 relative overflow-hidden group/tab ${
                timeFrame === tf
                  ? "bg-black text-brutal-yellow shadow-brutal"
                  : "bg-white text-black hover:bg-brutal-pink"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="relative z-10">{tf.toUpperCase()}</span>
              {timeFrame === tf && (
                <div className="absolute inset-0 bg-brutal-yellow opacity-20 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y-2 divide-black relative z-10">
        {MOCK_LEADERS.map((entry, i) => (
          <div
            key={entry.address}
            className={`p-3 hover:bg-brutal-yellow/20 transition-all cursor-pointer group/entry relative overflow-hidden animate-slide-in-left ${
              i === 0 ? "bg-brutal-yellow/10" : ""
            }`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Rank change indicator (animated) */}
            {entry.rank <= 3 && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-brutal-green animate-pulse" />
            )}
            
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div
                className={`w-8 h-8 border-2 border-black flex items-center justify-center font-mono font-bold text-sm shadow-brutal group-hover/entry:scale-110 group-hover/entry:rotate-3 transition-all relative overflow-hidden ${
                  entry.rank === 1
                    ? "bg-brutal-yellow text-black"
                    : entry.rank === 2
                    ? "bg-gray-300 text-black"
                    : entry.rank === 3
                    ? "bg-orange-300 text-black"
                    : "bg-white text-black"
                }`}
              >
                <span className="relative z-10">{entry.rank}</span>
                {entry.rank === 1 && (
                  <div className="absolute inset-0 bg-white opacity-0 group-hover/entry:opacity-30 animate-pulse" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-black truncate group-hover/entry:text-brutal-purple transition-colors">
                    {entry.address}
                  </span>
                  <span className="text-sm animate-bounce-subtle inline-block">{entry.badge}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-black/50">
                  <span className="hover:text-brutal-green transition-colors">🏆 {entry.wins}W</span>
                  <span className="hover:text-brutal-purple transition-colors">📊 {entry.winRate}%</span>
                  <span className="hover:text-brutal-yellow transition-colors">💰 {entry.volume} OCT</span>
                  <span className="text-brutal-orange animate-pulse">🔥 {entry.streak}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="opacity-0 group-hover/entry:opacity-100 group-hover/entry:translate-x-1 transition-all">
                <span className="font-mono text-brutal-purple font-bold">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t-3 border-black p-3 bg-brutal-purple text-center relative overflow-hidden group/footer">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/footer:translate-x-full transition-transform duration-1000" />
        
        <p className="font-mono text-xs text-white/80 mb-2 relative z-10">
          Your Rank: <span className="font-bold text-brutal-yellow animate-pulse-scale inline-block">#42</span>
          <span className="ml-1 text-brutal-green text-[10px] animate-bounce-subtle inline-block">↑ +3</span>
        </p>
        <button className="btn-brutal bg-brutal-yellow text-black w-full py-2 text-xs hover:scale-105 active:scale-95 relative overflow-hidden group/btn z-10">
          <span className="relative z-10">VIEW FULL RANKINGS →</span>
          <div className="absolute inset-0 bg-black opacity-0 group-hover/btn:opacity-10 transition-opacity" />
        </button>
      </div>

      <p className="font-mono text-[10px] text-black/30 text-center py-2 relative z-10 animate-fade-in-up">
        Powered by OnePlay · Live Rankings
      </p>
    </div>
  );
}
