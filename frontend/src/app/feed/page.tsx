"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { Header } from "@/components/Header";
import { EventCard } from "@/components/EventCard";
import { StakeSlider } from "@/components/StakeSlider";
import { MatchModal } from "@/components/MatchModal";
import { TokenSwapWidget } from "@/components/TokenSwapWidget";
import { ToastContainer } from "@/components/Toast";
import { useAppStore } from "@/lib/store";
import { MOCK_EVENTS } from "@/lib/types";
import { buildPlaceBetTx, octToMist } from "@/lib/onechain";
import { useOneChainTx } from "@/lib/useOneChainTx";
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
  const { mutate: signAndExecute } = useOneChainTx();
  const stakeAmount = useAppStore((s) => s.stakeAmount);
  const showMatch   = useAppStore((s) => s.showMatch);
  const swipedIds   = useAppStore((s) => s.swipedIds);
  const addSwiped   = useAppStore((s) => s.addSwiped);
  const toasts      = useAppStore((s) => s.toasts);
  const addToast    = useAppStore((s) => s.addToast);
  const removeToast = useAppStore((s) => s.removeToast);

  const [lastAction, setLastAction] = useState<{ dir: SwipeDir; question: string } | null>(null);
  const [txPending, setTxPending]   = useState(false);
  const [betCount, setBetCount]     = useState(0); // only actual bets (not skips)
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

      setBetCount((c) => c + 1);

      const tx = buildPlaceBetTx(event.id, position, octToMist(finalStake));
      setTxPending(true);
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            setTxPending(false);
            addToast("Transaction successful!", "success");
            setTimeout(() => {
              showMatch({
                playerYes: account.address,
                playerNo: "0xdeadbeef1234567890abcdef",
                eventQuestion: event.question,
              });
            }, 1500);
          },
          onError: () => {
            setTxPending(false);
            addToast("Transaction failed", "error");
          },
        }
      );
    },
    [account, remaining, stakeAmount, addSwiped, signAndExecute, showMatch, addToast]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!account || remaining.length === 0) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch(e.key.toLowerCase()) {
        case "arrowright":
        case "d":
          handleSwipe("right");
          break;
        case "arrowleft":
        case "a":
          handleSwipe("left");
          break;
        case "arrowup":
        case "w":
          handleSwipe("up");
          break;
        case "arrowdown":
        case "s":
          handleSwipe("down");
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [account, remaining.length, handleSwipe]);

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col bg-brutal-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="border-3 border-black bg-brutal-yellow shadow-brutal-xl p-8 text-center max-w-sm hover:shadow-brutal-2xl transition-all animate-bounce-in relative overflow-hidden group">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brutal-pink/20 via-transparent to-brutal-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 border-3 border-black bg-white mx-auto mb-4 flex items-center justify-center text-4xl animate-bounce-subtle shadow-brutal">
                🔐
              </div>
              <p className="font-mono font-bold text-2xl mb-2 animate-pulse-scale">CONNECT WALLET</p>
              <p className="text-sm text-black/60 mb-4 leading-relaxed">
                Connect your OneWallet to start swiping and placing bets.
              </p>
              <p className="font-mono text-xs text-black/40 animate-pulse">Use CONNECT in the header ↑</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />
      <MatchModal />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Card stack ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono font-bold text-xl text-black relative group">
                <span className="relative z-10">PREDICTION FEED</span>
                <span className="text-brutal-pink ml-2 text-sm animate-bounce-subtle inline-block">{remaining.length} LEFT</span>
                {/* Decorative animated underline */}
                <div className="absolute -bottom-1 left-0 w-24 h-1 bg-brutal-yellow group-hover:w-full transition-all duration-300" />
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-brutal-pink opacity-50 group-hover:w-full transition-all duration-500" />
              </h2>
              <div className="flex items-center gap-2">
                {txPending && (
                  <span className="brutal-tag bg-brutal-orange text-black animate-pulse animate-glow-pulse relative overflow-hidden">
                    <span className="relative z-10">TX PENDING…</span>
                    <span className="absolute inset-0 bg-white opacity-0 animate-shimmer" />
                  </span>
                )}
                {/* Progress indicator */}
                <div className="border-2 border-black bg-white px-2 py-1 shadow-brutal">
                  <span className="font-mono text-xs font-bold text-black">
                    {MOCK_EVENTS.length - remaining.length}/{MOCK_EVENTS.length}
                  </span>
                </div>
              </div>
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
                className="border-3 border-black bg-brutal-yellow shadow-brutal-xl flex flex-col items-center justify-center gap-4 text-center p-8 hover:shadow-brutal-2xl transition-all relative overflow-hidden group"
                style={{ height: 580 }}
              >
                {/* Confetti effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-brutal-pink animate-particle-float"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative z-10">
                  <p className="font-mono font-bold text-4xl animate-bounce-subtle mb-2">ALL DONE! 🎉</p>
                  <p className="text-black/60 mb-4 animate-fade-in-up">You've seen all events for now.</p>
                  <Link href="/duels" className="btn-yellow px-6 py-3 animate-glow-pulse inline-block hover:scale-110 transition-transform">
                    VIEW MY DUELS →
                  </Link>
                </div>
              </div>
            )}

            {/* Last action feedback */}
            {lastAction && (
              <div className="mt-4 border-3 border-black bg-white shadow-brutal p-3 flex items-center gap-3 animate-wiggle relative overflow-hidden group">
                {/* Animated background bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 animate-pulse"
                  style={{ backgroundColor: DIR_LABEL[lastAction.dir].color }}
                />
                <span className="font-mono text-xs text-black/40 ml-2">LAST ACTION:</span>
                <span
                  className="font-mono font-bold text-sm animate-pulse-scale inline-block"
                  style={{ color: DIR_LABEL[lastAction.dir].color }}
                >
                  {DIR_LABEL[lastAction.dir].text}
                </span>
                <span className="font-mono text-xs text-black/50 truncate">
                  {lastAction.question}
                </span>
                {/* Hover shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-4">
            <StakeSlider />
            
            {/* Token Swap Widget */}
            <TokenSwapWidget />

            {/* Swipe guide */}
            <div className="border-3 border-black bg-white shadow-brutal p-4 hover:shadow-brutal-lg transition-all relative overflow-hidden group">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-8 h-8 border-l-3 border-b-3 border-brutal-purple opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-r-3 border-t-3 border-brutal-purple opacity-30 group-hover:opacity-60 transition-opacity" />
              
              <p className="font-mono text-xs text-black/40 uppercase font-bold mb-3 relative z-10 flex items-center gap-1">
                HOW TO SWIPE
                <span className="inline-block animate-bounce-subtle">👆</span>
              </p>
              <div className="space-y-3 relative z-10">
                {[
                  { icon: "→", label: "Swipe RIGHT", desc: "Bet YES",       color: "#00AA55" },
                  { icon: "←", label: "Swipe LEFT",  desc: "Bet NO",        color: "#CC0033" },
                  { icon: "↑", label: "Swipe UP",    desc: "YES × 3 stake", color: "#FF6B00" },
                  { icon: "↓", label: "Swipe DOWN",  desc: "Skip event",    color: "#888888" },
                  { icon: "👆", label: "Tap card",   desc: "View details",  color: "#BF5FFF" },
                ].map((g, i) => (
                  <div key={g.label} className="flex items-center gap-3 hover:translate-x-1 transition-transform cursor-pointer group/item relative overflow-hidden" style={{ animationDelay: `${i * 0.05}s` }}>
                    {/* Hover background */}
                    <div className="absolute inset-0 bg-brutal-yellow opacity-0 group-hover/item:opacity-20 transition-opacity" />
                    
                    <span className="font-mono font-bold text-lg w-6 text-center group-hover/item:scale-125 transition-transform relative z-10" style={{ color: g.color }}>
                      {g.icon}
                    </span>
                    <div className="relative z-10">
                      <p className="font-mono text-xs font-bold text-black group-hover/item:text-brutal-purple transition-colors">{g.label}</p>
                      <p className="font-mono text-xs text-black/40">{g.desc}</p>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity relative z-10">
                      <span className="font-mono text-xs" style={{ color: g.color }}>▸</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session stats */}
            <div className="border-3 border-black bg-brutal-purple shadow-brutal p-4 hover:shadow-brutal-lg transition-all relative overflow-hidden group">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-brutal-yellow animate-shimmer" />
                <div className="absolute bottom-0 right-0 w-full h-1 bg-brutal-pink animate-shimmer" style={{ animationDelay: '1s' }} />
              </div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-brutal-yellow rounded-full animate-particle-float"
                    style={{
                      left: `${20 + i * 20}%`,
                      top: `${30 + i * 10}%`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
              
              <p className="font-mono text-xs text-white/60 uppercase font-bold mb-3 relative z-10 flex items-center gap-1">
                📊 SESSION
                <span className="inline-block animate-pulse">•</span>
              </p>
              <div className="grid grid-cols-2 gap-2 relative z-10">
                {[
                  { label: "SWIPED",  value: swipedIds.size,        color: "bg-brutal-yellow text-black", icon: "🃏", iconAnim: "animate-levitate" },
                  { label: "OCT BET", value: stakeAmount * betCount, color: "bg-brutal-green  text-black", icon: "🪙", iconAnim: "animate-coin-flip" },
                ].map((s, i) => (
                  <div key={s.label} className={`border-2 border-black p-2 text-center shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all cursor-pointer group/stat ${s.color} relative overflow-hidden`} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className={`absolute top-1 right-1 opacity-50 group-hover/stat:opacity-100 group-hover/stat:scale-125 transition-all ${s.iconAnim}`}>
                      <span className="text-xs">{s.icon}</span>
                    </div>
                    <p className="font-mono font-bold text-2xl group-hover/stat:scale-110 transition-transform inline-block">{s.value}</p>
                    <p className="font-mono text-xs opacity-60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Keyboard shortcuts hint */}
            <div className="border-3 border-black bg-brutal-cyan shadow-brutal p-3 hover:shadow-brutal-lg transition-all relative overflow-hidden group animate-fade-in-up">
              <p className="font-mono text-xs text-black/60 uppercase font-bold mb-2 flex items-center gap-1">
                ⌨️ KEYBOARD SHORTCUTS
              </p>
              <div className="space-y-1 font-mono text-xs text-black/70">
                {[
                  { keys: "← / A", action: "Bet NO" },
                  { keys: "→ / D", action: "Bet YES" },
                  { keys: "↑ / W", action: "3× Stake" },
                  { keys: "↓ / S", action: "Skip" },
                ].map((s, i) => (
                  <div key={s.keys} className="flex items-center justify-between hover:text-brutal-purple transition-colors cursor-pointer group/key" style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="font-bold border border-black bg-white px-1.5 py-0.5 group-hover/key:bg-brutal-yellow transition-colors">{s.keys}</span>
                    <span className="text-xs">{s.action}</span>
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
