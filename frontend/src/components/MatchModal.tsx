"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

export function MatchModal() {
  const matchData = useAppStore((s) => s.matchData);
  const hideMatch = useAppStore((s) => s.hideMatch);

  return (
    <AnimatePresence>
      {matchData && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(10,10,10,0.75)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={hideMatch}
        >
          <motion.div
            className="border-3 border-black w-full max-w-sm overflow-hidden"
            style={{ backgroundColor: "#FFE500", boxShadow: "10px 10px 0px #0A0A0A" }}
            initial={{ scale: 0.4, rotate: -8 }}
            animate={{ scale: 1,   rotate: 0  }}
            exit={{ scale: 0.4,    rotate: 8  }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner */}
            <div className="bg-brutal-pink border-b-3 border-black p-4 text-center relative overflow-hidden">
              {/* Animated confetti particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full animate-particle-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      backgroundColor: ['#FFE500', '#00FF87', '#4DFFFF', '#BF5FFF'][i % 4],
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
              
              <div className="absolute inset-0 animate-shimmer opacity-30" />
              <p className="font-mono font-bold text-3xl text-black tracking-widest animate-bounce-subtle relative z-10">
                <span className="inline-block animate-pulse-scale">🎉</span> IT'S A MATCH!
              </p>
            </div>

            {/* Players */}
            <div className="p-5 flex items-center justify-between gap-3">
              <div className="flex-1 text-center group/player">
                <div className="w-16 h-16 border-3 border-black bg-brutal-green mx-auto mb-2 flex items-center justify-center text-3xl shadow-brutal animate-float hover:rotate-6 hover:scale-110 transition-all cursor-pointer">
                  🟢
                </div>
                <p className="font-mono text-xs font-bold text-black group-hover/player:text-brutal-green transition-colors">YOU</p>
                <p className="font-mono text-xs text-black/50">YES</p>
              </div>

              <div className="border-3 border-black bg-black px-3 py-2 shadow-brutal animate-pulse relative overflow-hidden">
                <span className="font-mono font-bold text-brutal-yellow text-xl relative z-10 inline-block animate-pulse-scale">⚔️</span>
                <div className="absolute inset-0 bg-brutal-yellow opacity-0 animate-shimmer" />
              </div>

              <div className="flex-1 text-center group/opponent">
                <div className="w-16 h-16 border-3 border-black bg-brutal-red mx-auto mb-2 flex items-center justify-center text-3xl shadow-brutal animate-float hover:-rotate-6 hover:scale-110 transition-all cursor-pointer" style={{ animationDelay: '0.5s' }}>
                  🔴
                </div>
                <p className="font-mono text-xs font-bold text-black truncate group-hover/opponent:text-brutal-red transition-colors">
                  {matchData.playerNo.slice(0, 6)}…
                </p>
                <p className="font-mono text-xs text-black/50">NO</p>
              </div>
            </div>

            {/* Event */}
            <div className="border-t-3 border-black mx-4 mb-3 pt-3">
              <p className="font-mono text-xs text-black/40 uppercase mb-1 flex items-center gap-1">
                Duel on
                <span className="inline-block animate-bounce-subtle">⚡</span>
              </p>
              <p className="font-mono text-sm text-black font-bold leading-snug hover:text-brutal-purple transition-colors">
                {matchData.eventQuestion}
              </p>
            </div>

            {/* Notice */}
            <div className="mx-4 mb-4 border-2 border-black bg-white p-2 shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden group/notice">
              <p className="font-mono text-xs text-black relative z-10">
                ⚡ Funds locked in escrow. Winner takes 95% of pot.
              </p>
              {/* Hover shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brutal-yellow/30 to-transparent -translate-x-full group-hover/notice:translate-x-full transition-transform duration-700" />
            </div>

            {/* Actions */}
            <div className="border-t-3 border-black grid grid-cols-2 divide-x-3 divide-black">
              <button
                className="py-3 font-mono text-sm font-bold text-black/50 hover:bg-white transition-all hover:scale-105 relative overflow-hidden group/dismiss"
                onClick={hideMatch}
              >
                <span className="relative z-10">DISMISS</span>
              </button>
              <button
                className="py-3 font-mono text-sm font-bold text-black bg-brutal-green hover:opacity-80 transition-all hover:scale-105 animate-glow-pulse relative overflow-hidden group/go"
                onClick={hideMatch}
              >
                <span className="relative z-10">LET'S GO 🔥</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover/go:opacity-20 animate-pulse" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
