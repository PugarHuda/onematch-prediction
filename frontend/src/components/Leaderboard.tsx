"use client";

import { useState, useEffect } from "react";
import { suiClient, explorerObjectUrl } from "@/lib/onechain";
import { PACKAGE_ID } from "@/lib/constants";

interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  wins: number;
  winRate: number;
  totalStaked: number;
  streak: number;
  objectId: string;
}

type TimeFrame = "daily" | "weekly" | "alltime";

// Rank badge based on position
function rankBadge(rank: number) {
  if (rank === 1) return { icon: "👑", color: "bg-brutal-yellow text-black" };
  if (rank === 2) return { icon: "🥈", color: "bg-gray-300 text-black" };
  if (rank === 3) return { icon: "🥉", color: "bg-orange-300 text-black" };
  return { icon: `#${rank}`, color: "bg-white text-black" };
}

export function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("alltime");
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch ProfileCreated events to get all profiles, then fetch their objects
    suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::user_profile::ProfileCreated` },
      limit: 20,
      order: "descending",
    })
      .then(async (result) => {
        if (result.data.length === 0) { setLoading(false); return; }

        const profileIds = result.data
          .map((e) => {
            const p = e.parsedJson as { profile_id?: string } | undefined;
            return p?.profile_id;
          })
          .filter(Boolean) as string[];

        if (profileIds.length === 0) { setLoading(false); return; }

        const objects = await suiClient.multiGetObjects({
          ids: profileIds,
          options: { showContent: true },
        });

        const parseStr = (v: unknown): string => {
          if (typeof v === "string") return v;
          if (v && typeof v === "object" && "bytes" in v) return String((v as { bytes: string }).bytes);
          return "";
        };

        const entries: LeaderboardEntry[] = objects
          .filter((o) => o.data?.content?.dataType === "moveObject")
          .map((o, i) => {
            const f = (o.data!.content as { fields: Record<string, unknown> }).fields;
            const wins = Number(f.wins ?? 0);
            const totalDuels = Number(f.total_duels ?? 0);
            return {
              rank: i + 1,
              address: String(f.owner ?? "").slice(0, 6) + "…" + String(f.owner ?? "").slice(-4),
              username: parseStr(f.username) || "anon",
              wins,
              winRate: totalDuels > 0 ? Math.round((wins / totalDuels) * 100) : 0,
              totalStaked: Math.round(Number(f.total_staked ?? 0) / 1e9),
              streak: Number(f.current_streak ?? 0),
              objectId: o.data!.objectId,
            };
          })
          // Sort by wins desc
          .sort((a, b) => b.wins - a.wins)
          .map((e, i) => ({ ...e, rank: i + 1 }));

        setLeaders(entries);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="border-3 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden group">
      {/* Animated diagonal stripe background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #0A0A0A 0, #0A0A0A 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />

      {/* Header */}
      <div className="border-b-3 border-black p-4 bg-brutal-yellow relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <div className="flex items-center justify-between relative z-10 mb-3">
          <h3 className="font-mono font-bold text-lg text-black flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            LEADERBOARD
          </h3>
          <span className="brutal-tag bg-brutal-purple text-white text-[10px]">LIVE</span>
        </div>
        <div className="flex gap-1 relative z-10">
          {(["daily", "weekly", "alltime"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`flex-1 py-1 font-mono text-xs font-bold border-2 border-black transition-all hover:scale-105 ${
                timeFrame === tf ? "bg-black text-brutal-yellow shadow-brutal" : "bg-white text-black hover:bg-brutal-pink"
              }`}
            >
              {tf === "alltime" ? "ALL TIME" : tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y-2 divide-black relative z-10">
        {loading ? (
          // Skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-black/10 border-2 border-black" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-black/10 rounded w-2/3" />
                <div className="h-2 bg-black/10 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : leaders.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">🌱</div>
            <p className="font-mono text-xs text-black/40">No players yet. Be the first!</p>
          </div>
        ) : (
          leaders.slice(0, 5).map((entry, i) => {
            const badge = rankBadge(entry.rank);
            return (
              <a
                key={entry.objectId}
                href={explorerObjectUrl(entry.objectId)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3 hover:bg-brutal-yellow/20 transition-all cursor-pointer group/entry relative overflow-hidden animate-slide-in-left ${i === 0 ? "bg-brutal-yellow/10" : ""}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {entry.rank <= 3 && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brutal-green animate-pulse" />
                )}
                {/* Rank badge */}
                <div className={`w-8 h-8 border-2 border-black flex items-center justify-center font-mono font-bold text-xs shadow-brutal group-hover/entry:scale-110 group-hover/entry:rotate-3 transition-all ${badge.color}`}>
                  {entry.rank <= 3 ? badge.icon : entry.rank}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="font-mono text-xs font-bold text-black truncate group-hover/entry:text-brutal-purple transition-colors">
                      @{entry.username}
                    </span>
                    {entry.streak >= 3 && (
                      <span className="text-xs animate-pulse">🔥</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-black/50">
                    <span className="text-brutal-green font-bold">{entry.wins}W</span>
                    <span>{entry.winRate}% WR</span>
                    <span>{entry.totalStaked} OCT</span>
                  </div>
                </div>
                <span className="font-mono text-brutal-purple font-bold opacity-0 group-hover/entry:opacity-100 group-hover/entry:translate-x-1 transition-all text-xs">↗</span>
              </a>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t-3 border-black p-3 bg-brutal-purple text-center relative overflow-hidden group/footer">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/footer:translate-x-full transition-transform duration-1000" />
        <p className="font-mono text-[10px] text-white/60 relative z-10">
          Powered by OneChain · {leaders.length} players ranked
        </p>
      </div>
    </div>
  );
}
