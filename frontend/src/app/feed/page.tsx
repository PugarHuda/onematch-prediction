"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@onelabs/dapp-kit";
import { Header } from "@/components/Header";
import { EventCard } from "@/components/EventCard";
import { StakeSlider } from "@/components/StakeSlider";
import { MatchModal } from "@/components/MatchModal";
import { TokenSwapWidget } from "@/components/TokenSwapWidget";
import { Leaderboard } from "@/components/Leaderboard";
import { useAppStore } from "@/lib/store";
import { MOCK_EVENTS } from "@/lib/types";
import { buildPlaceBetTx, octToMist } from "@/lib/onechain";
import Link from "next/link";

type SwipeDir = "left" | "right" | "up" | "down";

const DIR_LABEL: Record<SwipeDir, { text: string; color: string }> = {
  right: { text: "YES ✓",   color: "#00AA55" },
  left:  { text: "NO ✗",    color: "#CC0033" },
  up:    { text: "RAISE 🔥", color: "#FF6B00" },
  down:  { text: "SKIP ↓",  color: "#888888" },
};

export default function FeedPage() {
  const account  = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const stakeAmount = useAppStore((s) => s.stakeAmount);
  const showMatch   = useAppStore((s) => s.showMatch);
  const swipedIds   = useAppStore((s) => s.swipedIds);
  const addSwiped   = useAppStore((s) => s.addSwiped);

  const [lastAction, setLastAction] = useState<{ dir: SwipeDir; question: string } | null>(null);
  const [txPending, setTxPending]   = useState(false);
  // track base color index so stack colors shift after each swipe
  const [colorBase, setColorBase]   = useState(0);

  const remaining = MOCK_EVENTS.filter((e) => !swipedIds.has(e.id));

  const handleSwipe = useCallback(
    (direction: SwipeDir) => {
      if (remaining.length === 0) return;
      const event = remaining[0];

      setLastAction({ dir: direction, question: event.question });
      addSwiped(event.id);
      setColorBase((c) => c + 1);

      // skip = no bet, just remove card
      if (direction === "down") return;
      if (!account) return;

      const position   = direction === "right" || direction === "up";
      const multiplier = direction === "up" ? 3 : 1;
      const finalStake = stakeAmount * multiplier;

      const tx = buildPlaceBetTx(event.id, position, octToMist(finalStake));
      setTxPending(true);
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setTxPending(false);
            setTimeout(() => {
              showMatch({
                playerYes: account.address,
                playerNo: "0xdeadbeef1234567890abcdef",
                eventQuestion: event.question,
              });
            }, 1500);
          },
          onError: () => setTxPending(false),
        }
      );
    },
    [account, remaining, stakeAmount, addSwiped, signAndExecute, showMatch]
  );

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col bg-brutal-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="border-3 border-black bg-brutal-yellow shadow-brutal-xl p-8 text-center max-w-sm hover:shadow-brutal-2xl transition-all">
            <p className="font-mono font-bold text-2xl mb-2 animate-bounce-subtle">CONNECT WALLET</p>
            <p className="text-sm text-black/60 mb-4">
              Connect your OneWallet to start swiping and placing bets.
            </p>
            <p className="font-mono text-xs text-black/40">Use CONNECT in the header ↑</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />
      <MatchModal />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Card stack ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono font-bold text-xl text-black relative">
                PREDICTION FEED
                <span className="text-brutal-pink ml-2 text-sm animate-bounce-subtle inline-block">{remaining.length} LEFT</span>
                {/* Decorative underline */}
                <div className="absolute -bottom-1 left-0 w-24 h-1 bg-brutal-yellow" />
              </h2>
              {txPending && (
                <span className="brutal-tag bg-brutal-orange text-black animate-pulse animate-glow-pulse relative">
                  <span className="relative z-10">TX PENDING…</span>
                  <span className="absolute inset-0 bg-white opacity-0 animate-shimmer" />
                </span>
              )}
            </div>

            {remaining.length > 0 ? (
              <div className="relative" style={{ height: 560 }}>
                <AnimatePresence mode="popLayout">
                  {remaining.slice(0, 4).map((event, i) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onSwipe={handleSwipe}
                      isTop={i === 0}
                      index={i}
                      colorIndex={colorBase + i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div
                className="border-3 border-black bg-brutal-yellow shadow-brutal-xl flex flex-col items-center justify-center gap-4 text-center p-8 hover:shadow-brutal-2xl transition-all"
                style={{ height: 580 }}
              >
                <p className="font-mono font-bold text-4xl animate-bounce-subtle">ALL DONE! 🎉</p>
                <p className="text-black/60">You've seen all events for now.</p>
                <Link href="/duels" className="btn-yellow px-6 py-3 animate-glow-pulse">
                  VIEW MY DUELS →
                </Link>
              </div>
            )}

            {/* Last action feedback */}
            {lastAction && (
              <div className="mt-4 border-3 border-black bg-white shadow-brutal p-3 flex items-center gap-3 animate-wiggle">
                <span className="font-mono text-xs text-black/40">LAST ACTION:</span>
                <span
                  className="font-mono font-bold text-sm animate-pulse"
                  style={{ color: DIR_LABEL[lastAction.dir].color }}
                >
                  {DIR_LABEL[lastAction.dir].text}
                </span>
                <span className="font-mono text-xs text-black/50 truncate">
                  {lastAction.question}
                </span>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-4">
            <StakeSlider />
            
            {/* Token Swap Widget */}
            <TokenSwapWidget />

            {/* Swipe guide */}
            <div className="border-3 border-black bg-white shadow-brutal p-4 hover:shadow-brutal-lg transition-all relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-8 h-8 border-l-3 border-b-3 border-brutal-purple opacity-30" />
              
              <p className="font-mono text-xs text-black/40 uppercase font-bold mb-3 relative z-10">HOW TO SWIPE</p>
              <div className="space-y-3 relative z-10">
                {[
                  { icon: "→", label: "Swipe RIGHT", desc: "Bet YES",       color: "#00AA55" },
                  { icon: "←", label: "Swipe LEFT",  desc: "Bet NO",        color: "#CC0033" },
                  { icon: "↑", label: "Swipe UP",    desc: "YES × 3 stake", color: "#FF6B00" },
                  { icon: "↓", label: "Swipe DOWN",  desc: "Skip event",    color: "#888888" },
                  { icon: "👆", label: "Tap card",   desc: "View details",  color: "#BF5FFF" },
                ].map((g) => (
                  <div key={g.label} className="flex items-center gap-3 hover:translate-x-1 transition-transform cursor-pointer group">
                    <span className="font-mono font-bold text-lg w-6 text-center group-hover:scale-125 transition-transform" style={{ color: g.color }}>
                      {g.icon}
                    </span>
                    <div>
                      <p className="font-mono text-xs font-bold text-black group-hover:text-brutal-purple transition-colors">{g.label}</p>
                      <p className="font-mono text-xs text-black/40">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session stats */}
            <div className="border-3 border-black bg-brutal-purple shadow-brutal p-4 hover:shadow-brutal-lg transition-all relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-brutal-yellow animate-shimmer" />
                <div className="absolute bottom-0 right-0 w-full h-1 bg-brutal-pink animate-shimmer" style={{ animationDelay: '1s' }} />
              </div>
              
              <p className="font-mono text-xs text-white/60 uppercase font-bold mb-3 relative z-10">SESSION</p>
              <div className="grid grid-cols-2 gap-2 relative z-10">
                {[
                  { label: "SWIPED",  value: swipedIds.size,                    color: "bg-brutal-yellow text-black" },
                  { label: "OCT BET", value: stakeAmount * swipedIds.size,       color: "bg-brutal-green  text-black" },
                ].map((s) => (
                  <div key={s.label} className={`border-2 border-black p-2 text-center shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all cursor-pointer group ${s.color}`}>
                    <p className="font-mono font-bold text-2xl group-hover:scale-110 transition-transform inline-block">{s.value}</p>
                    <p className="font-mono text-xs opacity-60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
