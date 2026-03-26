"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@onelabs/dapp-kit";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { useAppStore } from "@/lib/store";
import { buildCreateProfileTx } from "@/lib/onechain";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/constants";
import type { Category } from "@/lib/constants";

const MOCK = {
  username: "crypto_degen_88",
  totalDuels: 47,
  wins: 31,
  losses: 16,
  reputation: 420,
  currentStreak: 5,
  bestStreak: 9,
  favoriteCategory: "crypto",
  winRate: 66,
  totalStaked: 2340,
  totalEarned: 4120,
};

const BADGES = [
  { icon: "🔥", label: "HOT STREAK",    bg: "#FF6B00" },
  { icon: "⚡", label: "FAST MATCHER",  bg: "#FFE500" },
  { icon: "🎯", label: "SHARP CALLER",  bg: "#00FF87" },
  { icon: "💎", label: "DIAMOND HANDS", bg: "#4DFFFF" },
];

export default function ProfilePage() {
  const account  = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const setProfile = useAppStore((s) => s.setProfile);

  const [creating,  setCreating]  = useState(false);
  const [username,  setUsername]  = useState("");
  const [category,  setCategory]  = useState<Category>("crypto");
  const [txPending, setTxPending] = useState(false);

  function handleCreate() {
    if (!account || !username.trim()) return;
    const tx = buildCreateProfileTx(username, "", category);
    setTxPending(true);
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setTxPending(false);
          setCreating(false);
          setProfile({
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
          });
        },
        onError: () => setTxPending(false),
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

  const p = MOCK;

  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">

          {/* ── Profile card ── */}
          <div className="border-3 border-black bg-white shadow-brutal-xl">
            {/* Avatar */}
            <div className="border-b-3 border-black bg-brutal-yellow p-6 text-center">
              <div className="w-20 h-20 border-3 border-black bg-brutal-pink mx-auto mb-3 flex items-center justify-center text-4xl shadow-brutal">
                🎯
              </div>
              <p className="font-mono font-bold text-2xl text-black">@{p.username}</p>
              <p className="font-mono text-xs text-black/40 mt-1">
                {account.address.slice(0, 8)}…{account.address.slice(-6)}
              </p>
            </div>

            {/* Reputation */}
            <div className="border-b-3 border-black p-4 text-center bg-brutal-bg">
              <p className="font-mono text-xs text-black/40 uppercase mb-1">Reputation</p>
              <p className="font-mono font-bold text-5xl text-black">{p.reputation}</p>
              <div className="flex justify-center gap-0.5 mt-2">
                {Array.from({ length: Math.min(5, Math.floor(p.reputation / 100)) }).map((_, i) => (
                  <span key={i} className="text-brutal-yellow text-lg">⭐</span>
                ))}
              </div>
            </div>

            {/* Streak */}
            <div className="p-4 text-center">
              <p className="font-mono text-xs text-black/40 uppercase mb-1">Current Streak</p>
              <p className="font-mono font-bold text-4xl text-brutal-orange">🔥 {p.currentStreak}</p>
              <p className="font-mono text-xs text-black/30 mt-1">Best: {p.bestStreak}</p>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="space-y-4">
            {/* Win rate */}
            <div className="border-3 border-black bg-brutal-green shadow-brutal p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-black/50 uppercase">Win Rate</p>
                  <p className="font-mono font-bold text-6xl text-black">{p.winRate}%</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-black/50">{p.wins}W / {p.losses}L</p>
                  <p className="font-mono font-bold text-black text-2xl">{p.totalDuels} DUELS</p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "TOTAL STAKED", value: `${p.totalStaked} OCT`, bg: "#FFE500" },
                { label: "TOTAL EARNED", value: `${p.totalEarned} OCT`, bg: "#00FF87" },
                { label: "BEST STREAK",  value: `🔥 ${p.bestStreak}`,   bg: "#FF6B00" },
                { label: "FAVORITE",     value: `${CATEGORY_EMOJI[p.favoriteCategory]} ${p.favoriteCategory.toUpperCase()}`, bg: "#FF3CAC" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="border-3 border-black shadow-brutal p-4"
                  style={{ backgroundColor: s.bg }}
                >
                  <p className="font-mono text-xs text-black/50 uppercase mb-1">{s.label}</p>
                  <p className="font-mono font-bold text-xl text-black">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="border-3 border-black bg-white shadow-brutal p-4">
              <p className="font-mono text-xs text-black/40 uppercase font-bold mb-3">BADGES</p>
              <div className="flex flex-wrap gap-2">
                {BADGES.map((b) => (
                  <div
                    key={b.label}
                    className="border-2 border-black px-3 py-1 flex items-center gap-1 shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                    style={{ backgroundColor: b.bg }}
                  >
                    <span>{b.icon}</span>
                    <span className="font-mono text-xs text-black font-bold">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}
