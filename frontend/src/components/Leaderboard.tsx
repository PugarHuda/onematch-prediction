"use client";

import { useState, useEffect } from "react";
import { suiClient, explorerObjectUrl } from "@/lib/onechain";
import { PACKAGE_ID } from "@/lib/constants";
import { Trophy, Flame, TrendingUp } from "lucide-react";

interface Entry {
  rank: number; address: string; username: string;
  wins: number; winRate: number; totalStaked: number;
  streak: number; objectId: string; aiRating: number;
}

// Mock leaderboard for demo when no on-chain data
const MOCK_LEADERS: Entry[] = [
  { rank:1, address:"0xace…1337", username:"alpha_whale", wins:247, winRate:79, totalStaked:12450, streak:12, objectId:"", aiRating:7175 },
  { rank:2, address:"0xbob…4242", username:"degen_bob", wins:198, winRate:72, totalStaked:9870, streak:8, objectId:"", aiRating:6166 },
  { rank:3, address:"0xcat…9999", username:"crypto_cat", wins:156, winRate:69, totalStaked:7650, streak:5, objectId:"", aiRating:5082 },
  { rank:4, address:"0xdog…5555", username:"diamond_dog", wins:134, winRate:66, totalStaked:6420, streak:3, objectId:"", aiRating:4543 },
  { rank:5, address:"0xelf…7777", username:"elf_trader", wins:112, winRate:63, totalStaked:5230, streak:7, objectId:"", aiRating:3994 },
];

function calcAiRating(wins: number, streak: number, wr: number) {
  return Math.round(1000 + wins * 25 + streak * 15 + wr * 3);
}

export function Leaderboard() {
  const [tf, setTf] = useState<"daily"|"weekly"|"alltime">("alltime");
  const [leaders, setLeaders] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::user_profile::ProfileCreated` },
      limit: 20, order: "descending",
    }).then(async (result) => {
      if (result.data.length === 0) {
        setLeaders(MOCK_LEADERS);
        setLoading(false);
        return;
      }
      const ids = result.data
        .map(e => (e.parsedJson as { profile_id?: string })?.profile_id)
        .filter(Boolean) as string[];
      if (ids.length === 0) { setLeaders(MOCK_LEADERS); setLoading(false); return; }

      const objects = await suiClient.multiGetObjects({ ids, options: { showContent: true } });
      const parseStr = (v: unknown): string => {
        if (typeof v === "string") return v;
        if (v && typeof v === "object" && "bytes" in v) return String((v as {bytes:string}).bytes);
        return "";
      };
      const entries: Entry[] = objects
        .filter(o => o.data?.content?.dataType === "moveObject")
        .map((o) => {
          const f = (o.data!.content as {fields:Record<string,unknown>}).fields;
          const w = Number(f.wins ?? 0), td = Number(f.total_duels ?? 0);
          const wr = td > 0 ? Math.round((w/td)*100) : 0;
          const s = Number(f.current_streak ?? 0);
          return {
            rank: 0, address: String(f.owner??"").slice(0,6)+"…"+String(f.owner??"").slice(-4),
            username: parseStr(f.username)||"anon", wins: w, winRate: wr,
            totalStaked: Math.round(Number(f.total_staked??0)/1e9), streak: s,
            objectId: o.data!.objectId, aiRating: calcAiRating(w, s, wr),
          };
        })
        .sort((a,b) => b.aiRating - a.aiRating)
        .map((e,i) => ({...e, rank: i+1}));
      setLeaders(entries.length > 0 ? entries : MOCK_LEADERS);
    }).catch(() => setLeaders(MOCK_LEADERS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="border-3 border-black bg-white shadow-brutal relative overflow-hidden group">
      {/* Header */}
      <div className="border-b-3 border-black p-4 bg-brutal-yellow relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10 mb-3">
          <h3 className="font-mono font-bold text-lg text-black flex items-center gap-2">
            <Trophy size={20} /> LEADERBOARD
          </h3>
          <div className="flex items-center gap-1">
            <span className="live-dot" />
            <span className="brutal-tag bg-brutal-purple text-white text-[10px]">ONEPLAY</span>
          </div>
        </div>
        <div className="flex gap-1 relative z-10">
          {(["daily","weekly","alltime"] as const).map(t => (
            <button key={t} onClick={() => setTf(t)}
              className={`flex-1 py-1 font-mono text-xs font-bold border-2 border-black transition-all ${
                tf===t ? "bg-black text-brutal-yellow shadow-brutal" : "bg-white text-black hover:bg-brutal-pink"}`}>
              {t==="alltime"?"ALL TIME":t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y-2 divide-black relative z-10">
        {loading ? Array.from({length:5}).map((_,i) => (
          <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-black/10 border-2 border-black" />
            <div className="flex-1 space-y-1"><div className="h-3 bg-black/10 rounded w-2/3" /><div className="h-2 bg-black/10 rounded w-1/2" /></div>
          </div>
        )) : leaders.slice(0,5).map((e,i) => (
          <div key={e.username+i}
            className={`flex items-center gap-3 p-3 hover:bg-brutal-yellow/20 transition-all cursor-pointer group/e ${i===0?"bg-brutal-yellow/10":""}`}>
            {e.rank<=3 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brutal-green" />}
            <div className={`w-8 h-8 border-2 border-black flex items-center justify-center font-mono font-bold text-xs shadow-brutal ${
              e.rank===1?"bg-brutal-yellow":e.rank===2?"bg-gray-300":e.rank===3?"bg-orange-300":"bg-white"} text-black`}>
              {e.rank<=3?["👑","🥈","🥉"][e.rank-1]:e.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="font-mono text-xs font-bold text-black truncate group-hover/e:text-brutal-purple transition-colors">@{e.username}</span>
                {e.streak>=3 && <Flame size={10} className="text-brutal-orange" />}
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-black/50">
                <span className="text-brutal-green font-bold">{e.wins}W</span>
                <span>{e.winRate}%</span>
                <span className="flex items-center gap-0.5"><TrendingUp size={8} />{e.aiRating} ELO</span>
              </div>
            </div>
            {e.objectId && (
              <a href={explorerObjectUrl(e.objectId)} target="_blank" rel="noopener noreferrer"
                className="font-mono text-brutal-purple text-[10px] opacity-0 group-hover/e:opacity-100">↗</a>
            )}
          </div>
        ))}
      </div>

      <div className="border-t-3 border-black p-3 bg-brutal-purple text-center">
        <p className="font-mono text-[10px] text-white/60">
          Ranked by AI Rating (ELO) · {leaders.length} players · Powered by OnePlay
        </p>
      </div>
    </div>
  );
}
