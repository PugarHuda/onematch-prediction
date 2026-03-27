"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { ToastContainer } from "@/components/Toast";
import { useAppStore } from "@/lib/store";
import { buildCreateProfileTx, fetchUserProfile, mistToOct, explorerObjectUrl } from "@/lib/onechain";
import { useOneChainTx } from "@/lib/useOneChainTx";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/constants";
import type { Category } from "@/lib/constants";
import Link from "next/link";

interface OnChainProfile {
  username: string;
  totalDuels: number;
  wins: number;
  losses: number;
  reputation: number;
  currentStreak: number;
  bestStreak: number;
  favoriteCategory: string;
  winRate: number;
  totalStaked: number;
  totalEarned: number;
  objectId: string;
}

// Derive badges from on-chain stats
function getBadges(p: OnChainProfile) {
  const badges = [];
  if (p.currentStreak >= 3) badges.push({ icon: "🔥", label: "HOT STREAK", bg: "#FF6B00" });
  if (p.totalDuels >= 10)   badges.push({ icon: "⚡", label: "FAST MATCHER", bg: "#FFE500" });
  if (p.winRate >= 60)      badges.push({ icon: "🎯", label: "SHARP CALLER", bg: "#00FF87" });
  if (p.totalStaked >= 100) badges.push({ icon: "💎", label: "DIAMOND HANDS", bg: "#4DFFFF" });
  if (p.totalDuels === 0)   badges.push({ icon: "🌱", label: "NEWCOMER", bg: "#BF5FFF" });
  return badges;
}

// GameFi: XP & Level system
function getLevel(reputation: number) {
  if (reputation >= 1000) return { level: 10, title: "LEGEND", color: "#FFE500", next: null };
  if (reputation >= 500)  return { level: 7,  title: "MASTER", color: "#BF5FFF", next: 1000 };
  if (reputation >= 300)  return { level: 5,  title: "EXPERT", color: "#4DFFFF", next: 500 };
  if (reputation >= 200)  return { level: 3,  title: "VETERAN", color: "#00FF87", next: 300 };
  if (reputation >= 150)  return { level: 2,  title: "DUELIST", color: "#FF3CAC", next: 200 };
  return { level: 1, title: "ROOKIE", color: "#FF6B00", next: 150 };
}

// AI Skill Rating (ELO-like based on win rate + streak)
function getAIRating(p: OnChainProfile): number {
  const base = 1000;
  const winBonus = p.wins * 25;
  const streakBonus = p.currentStreak * 15;
  const rateBonus = p.winRate * 3;
  return Math.round(base + winBonus + streakBonus + rateBonus);
}

export default function ProfilePage() {
  const account  = useCurrentAccount();
  const { mutate: signAndExecute } = useOneChainTx();
  const setProfile = useAppStore((s) => s.setProfile);
  const addToast = useAppStore((s) => s.addToast);
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  const [creating,  setCreating]  = useState(false);
  const [username,  setUsername]  = useState("");
  const [category,  setCategory]  = useState<Category>("crypto");
  const [txPending, setTxPending] = useState(false);
  const [onChainProfile, setOnChainProfile] = useState<OnChainProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch on-chain profile when wallet connects
  useEffect(() => {
    if (!account) return;
    setLoadingProfile(true);
    fetchUserProfile(account.address)
      .then((obj) => {
        if (!obj || !obj.data?.content || obj.data.content.dataType !== "moveObject") {
          setOnChainProfile(null);
          return;
        }
        const fields = (obj.data.content as { fields: Record<string, unknown> }).fields;
        const wins = Number(fields.wins ?? 0);
        const totalDuels = Number(fields.total_duels ?? 0);

        // Move String is serialized as { bytes: "..." } or plain string depending on SDK version
        const parseStr = (v: unknown): string => {
          if (typeof v === "string") return v;
          if (v && typeof v === "object" && "bytes" in v) return String((v as { bytes: string }).bytes);
          return "";
        };

        setOnChainProfile({
          username: parseStr(fields.username),
          totalDuels,
          wins,
          losses: Number(fields.losses ?? 0),
          reputation: Number(fields.reputation ?? 100),
          currentStreak: Number(fields.current_streak ?? 0),
          bestStreak: Number(fields.best_streak ?? 0),
          favoriteCategory: parseStr(fields.favorite_category) || "crypto",
          winRate: totalDuels > 0 ? Math.round((wins / totalDuels) * 100) : 0,
          totalStaked: mistToOct(BigInt(String(fields.total_staked ?? "0"))),
          totalEarned: mistToOct(BigInt(String(fields.total_earned ?? "0"))),
          objectId: obj.data.objectId,
        });
      })
      .catch(() => setOnChainProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [account]);

  function handleCopyAddress() {
    if (!account) return;
    navigator.clipboard.writeText(account.address);
    addToast("Address copied!", "success");
  }

  function handleCreate() {
    if (!account || !username.trim()) return;
    const tx = buildCreateProfileTx(username, "", category);
    setTxPending(true);
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: (result) => {
          setTxPending(false);
          setCreating(false);
          const newProfile = {
            id: "0x...",
            owner: account.address,
            username,
            avatarUrl: "",
            totalDuels: 0,
            wins: 0,
            losses: 0,
            reputation: 100,
            currentStreak: 0,
            bestStreak: 0,
            favoriteCategory: category,
            winRate: 0,
          };
          setProfile(newProfile);
          setOnChainProfile({
            ...newProfile,
            totalStaked: 0,
            totalEarned: 0,
            objectId: result.digest ?? "",
          });
          addToast("Profile created on-chain!", "success");
          // Refetch profile after short delay
          setTimeout(() => {
            fetchUserProfile(account.address).then((obj) => {
              if (obj?.data?.content?.dataType === "moveObject") {
                const f = (obj.data.content as { fields: Record<string, unknown> }).fields;
                const parseStr = (v: unknown): string => {
                  if (typeof v === "string") return v;
                  if (v && typeof v === "object" && "bytes" in v) return String((v as { bytes: string }).bytes);
                  return "";
                };
                setOnChainProfile({
                  username: parseStr(f.username),
                  totalDuels: 0, wins: 0, losses: 0,
                  reputation: Number(f.reputation ?? 100),
                  currentStreak: 0, bestStreak: 0,
                  favoriteCategory: parseStr(f.favorite_category) || category,
                  winRate: 0, totalStaked: 0, totalEarned: 0,
                  objectId: obj.data.objectId,
                });
              }
            }).catch(() => {});
          }, 2000);
        },
        onError: (e) => {
          setTxPending(false);
          addToast(`Failed: ${e.message}`, "error");
        },
      }
    );
  }

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

  // Loading on-chain profile
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-brutal-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="border-3 border-black bg-white shadow-brutal p-8 text-center animate-pulse">
            <p className="font-mono font-bold text-xl">LOADING PROFILE…</p>
            <p className="font-mono text-sm text-black/40 mt-2">Fetching from OneChain</p>
          </div>
        </div>
      </div>
    );
  }

  // No profile yet — show create form or prompt
  if (!onChainProfile && !creating) {
    return (
      <div className="min-h-screen flex flex-col bg-brutal-bg">
        <Header />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="border-3 border-black bg-brutal-yellow shadow-brutal-xl p-8 text-center max-w-sm">
            <div className="text-5xl mb-4 animate-bounce-subtle">👤</div>
            <p className="font-mono font-bold text-2xl mb-2">NO PROFILE YET</p>
            <p className="font-mono text-sm text-black/60 mb-6">
              Create your on-chain OneID profile to track your duels and reputation.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="btn-yellow w-full py-3 text-base"
            >
              CREATE PROFILE →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="min-h-screen flex flex-col bg-brutal-bg">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-12 w-full">
          <div className="border-3 border-black bg-white shadow-brutal-xl">
            <div className="border-b-3 border-black p-4 bg-brutal-pink">
              <h1 className="font-mono font-bold text-2xl text-black">CREATE PROFILE</h1>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="font-mono text-xs text-black/40 uppercase block mb-2">Username</label>
                <input
                  className="brutal-input"
                  placeholder="crypto_degen_88"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div>
                <label className="font-mono text-xs text-black/40 uppercase block mb-2">Favorite Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`border-2 border-black py-2 font-mono text-xs font-bold uppercase transition-all shadow-brutal
                        ${category === c ? "bg-black text-brutal-yellow" : "bg-white text-black hover:bg-brutal-yellow"}`}
                    >
                      {CATEGORY_EMOJI[c]} {c}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={!username.trim() || txPending}
                className="btn-yellow w-full py-3 text-base disabled:opacity-50"
              >
                {txPending ? "CREATING…" : "CREATE ON-CHAIN →"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const p = onChainProfile!;
  const BADGES = getBadges(p);
  const lvl = getLevel(p.reputation);
  const aiRating = getAIRating(p);
  const xpProgress = lvl.next ? Math.round(((p.reputation - (lvl.next - 150)) / 150) * 100) : 100;

  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">

          {/* ── Profile card ── */}
          <div className="border-3 border-black bg-white shadow-brutal-xl hover:shadow-brutal-2xl transition-all animate-pop-in relative overflow-hidden group">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brutal-pink/5 via-transparent to-brutal-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Avatar */}
            <div className="border-b-3 border-black bg-brutal-yellow p-6 text-center relative overflow-hidden">
              {/* Animated shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="w-20 h-20 border-3 border-black bg-brutal-pink mx-auto mb-3 flex items-center justify-center text-4xl shadow-brutal hover:rotate-6 hover:scale-110 transition-all cursor-pointer relative z-10 animate-levitate sticker">
                🎯
              </div>
              <p className="font-mono font-bold text-2xl text-black relative z-10 hover:text-brutal-purple transition-colors">@{p.username}</p>
              <button
                onClick={handleCopyAddress}
                className="font-mono text-xs text-black/40 mt-1 relative z-10 hover:text-brutal-purple transition-colors cursor-pointer flex items-center gap-1 mx-auto group/copy"
              >
                <span>{account.address.slice(0, 8)}…{account.address.slice(-6)}</span>
                <span className="opacity-0 group-hover/copy:opacity-100 transition-opacity">📋</span>
              </button>
              {p.objectId && (
                <a
                  href={explorerObjectUrl(p.objectId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-brutal-purple hover:underline mt-1 block relative z-10"
                >
                  VIEW ON-CHAIN ↗
                </a>
              )}
            </div>

            {/* Reputation */}
            <div className="border-b-3 border-black p-4 text-center bg-brutal-bg relative overflow-hidden group/rep">
              <p className="font-mono text-xs text-black/40 uppercase mb-1 relative z-10">Reputation</p>
              <p className="font-mono font-bold text-5xl text-black relative z-10 group-hover/rep:scale-110 transition-transform inline-block">{p.reputation}</p>
              <div className="flex justify-center gap-0.5 mt-2 relative z-10">
                {Array.from({ length: Math.min(5, Math.floor(p.reputation / 100)) }).map((_, i) => (
                  <span key={i} className="text-brutal-yellow text-lg animate-bounce-subtle inline-block" style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1 bg-black/10 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-brutal-yellow animate-shimmer" style={{ width: `${(p.reputation % 100)}%` }} />
              </div>
            </div>

            {/* Streak */}
            <div className="p-4 text-center relative z-10">
              <p className="font-mono text-xs text-black/40 uppercase mb-1">Current Streak</p>
              <p className="font-mono font-bold text-4xl text-brutal-orange hover:scale-110 transition-transform inline-block cursor-pointer">
                <span className="animate-streak-fire inline-block">🔥</span> {p.currentStreak}
              </p>
              <p className="font-mono text-xs text-black/30 mt-1">Best: <span className="text-brutal-purple font-bold">{p.bestStreak}</span></p>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="space-y-4">
            {/* GameFi: Level + AI Rating */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border-3 border-black bg-black shadow-brutal p-4 relative overflow-hidden group/lvl">
                <div className="absolute inset-0 bg-gradient-to-br from-brutal-purple/30 to-transparent" />
                <p className="font-mono text-xs text-white/40 uppercase mb-1 relative z-10">LEVEL</p>
                <p className="font-mono font-bold text-3xl relative z-10" style={{ color: lvl.color }}>
                  LV.{lvl.level}
                </p>
                <p className="font-mono text-xs font-bold relative z-10" style={{ color: lvl.color }}>{lvl.title}</p>
                {lvl.next && (
                  <div className="mt-2 relative z-10">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${xpProgress}%`, backgroundColor: lvl.color }} />
                    </div>
                    <p className="font-mono text-[10px] text-white/30 mt-0.5">{p.reputation}/{lvl.next} XP</p>
                  </div>
                )}
              </div>
              <div className="border-3 border-black bg-brutal-purple shadow-brutal p-4 relative overflow-hidden group/ai">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <p className="font-mono text-xs text-white/40 uppercase mb-1 relative z-10 flex items-center gap-1">
                  <span className="live-dot" style={{ background: "#00FF87" }} />
                  AI RATING
                </p>
                <p className="font-mono font-bold text-3xl text-brutal-yellow relative z-10">{aiRating}</p>
                <p className="font-mono text-[10px] text-white/40 relative z-10">ELO-based skill score</p>
              </div>
            </div>

            {/* Win rate */}
            <div className="border-3 border-black bg-brutal-green shadow-brutal p-5 hover:shadow-brutal-lg transition-all animate-slide-in-right relative overflow-hidden group">
              {/* Animated glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="font-mono text-sm text-black/50 uppercase flex items-center gap-1">
                    Win Rate
                    <span className="inline-block animate-bounce-subtle">📈</span>
                  </p>
                  <p className="font-mono font-bold text-6xl text-black group-hover:scale-105 transition-transform inline-block">{p.winRate}%</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-black/50">{p.wins}W / {p.losses}L</p>
                  <p className="font-mono font-bold text-black text-2xl hover:text-brutal-purple transition-colors">{p.totalDuels} DUELS</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-black animate-shimmer" style={{ width: `${p.winRate}%` }} />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "TOTAL STAKED", value: `${p.totalStaked} OCT`, bg: "#FFE500", icon: "💰" },
                { label: "TOTAL EARNED", value: `${p.totalEarned} OCT`, bg: "#00FF87", icon: "💵" },
                { label: "BEST STREAK",  value: `🔥 ${p.bestStreak}`,   bg: "#FF6B00", icon: "🔥" },
                { label: "FAVORITE",     value: `${CATEGORY_EMOJI[p.favoriteCategory]} ${p.favoriteCategory.toUpperCase()}`, bg: "#FF3CAC", icon: "❤️" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="border-3 border-black shadow-brutal p-4 hover:shadow-brutal-lg hover:-translate-y-1 transition-all cursor-pointer animate-pop-in relative overflow-hidden group/card"
                  style={{ backgroundColor: s.bg, animationDelay: `${i * 0.1}s` }}
                >
                  <div className="absolute top-2 right-2 opacity-30 group-hover/card:scale-125 transition-transform">
                    <span className="text-sm">{s.icon}</span>
                  </div>
                  <p className="font-mono text-xs text-black/50 uppercase mb-1 relative z-10">{s.label}</p>
                  <p className="font-mono font-bold text-xl text-black relative z-10 group-hover/card:scale-105 transition-transform inline-block">{s.value}</p>
                  {/* Hover shine */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover/card:opacity-20 transition-opacity" />
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="border-3 border-black bg-white shadow-brutal p-4 hover:shadow-brutal-lg transition-all animate-slide-in-right relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <p className="font-mono text-xs text-black/40 uppercase font-bold mb-3 flex items-center gap-1">
                BADGES
                <span className="inline-block animate-bounce-subtle">🏅</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {BADGES.map((b, i) => (
                  <div
                    key={b.label}
                    className="border-2 border-black px-3 py-1 flex items-center gap-1 shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all cursor-pointer animate-pop-in relative overflow-hidden group/badge"
                    style={{ backgroundColor: b.bg, animationDelay: `${i * 0.1}s` }}
                  >
                    <span className="group-hover/badge:scale-125 transition-transform inline-block">{b.icon}</span>
                    <span className="font-mono text-xs text-black font-bold relative z-10">{b.label}</span>
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover/badge:opacity-30 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <Leaderboard />
            
            {/* Quick Actions */}
            <div className="border-3 border-black bg-white shadow-brutal p-4 hover:shadow-brutal-lg transition-all animate-slide-in-right relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
              <p className="font-mono text-xs text-black/40 uppercase font-bold mb-3 flex items-center gap-1">
                QUICK ACTIONS
                <span className="inline-block animate-bounce-subtle">⚡</span>
              </p>
              <div className="space-y-2">
                {[
                  { label: "🃏 New Bet", href: "/feed", color: "bg-brutal-yellow hover:bg-brutal-yellow/80" },
                  { label: "⚔️ My Duels", href: "/duels", color: "bg-brutal-pink hover:bg-brutal-pink/80" },
                  { label: "💰 Get Testnet OCT", href: "https://onebox.onelabs.cc", color: "bg-brutal-cyan hover:bg-brutal-cyan/80", external: true },
                ].map((action, i) => (
                  action.external ? (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block border-2 border-black ${action.color} text-black font-mono text-sm font-bold py-2 px-3 text-center shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all animate-pop-in relative overflow-hidden group/action`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="relative z-10">{action.label} ↗</span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover/action:opacity-20 transition-opacity" />
                    </a>
                  ) : (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={`block border-2 border-black ${action.color} text-black font-mono text-sm font-bold py-2 px-3 text-center shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all animate-pop-in relative overflow-hidden group/action`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="relative z-10">{action.label}</span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover/action:opacity-20 transition-opacity" />
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
