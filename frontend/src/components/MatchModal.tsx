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
              <div className="absolute inset-0 animate-shimmer opacity-30" />
              <p className="font-mono font-bold text-3xl text-black tracking-widest animate-bounce-subtle relative z-10">
                🎉 IT'S A MATCH!
              </p>
            </div>

            {/* Players */}
            <div className="p-5 flex items-center justify-between gap-3">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 border-3 border-black bg-brutal-green mx-auto mb-2 flex items-center justify-center text-3xl shadow-brutal animate-float">
                  🟢
                </div>
                <p className="font-mono text-xs font-bold text-black">YOU</p>
                <p className="font-mono text-xs text-black/50">YES</p>
              </div>

              <div className="border-3 border-black bg-black px-3 py-2 shadow-brutal animate-pulse">
                <span className="font-mono font-bold text-brutal-yellow text-xl">⚔️</span>
              </div>

              <div className="flex-1 text-center">
                <div className="w-16 h-16 border-3 border-black bg-brutal-red mx-auto mb-2 flex items-center justify-center text-3xl shadow-brutal animate-float" style={{ animationDelay: '0.5s' }}>
                  🔴
                </div>
                <p className="font-mono text-xs font-bold text-black truncate">
                  {matchData.playerNo.slice(0, 6)}…
                </p>
                <p className="font-mono text-xs text-black/50">NO</p>
              </div>
            </div>

            {/* Event */}
            <div className="border-t-3 border-black mx-4 mb-3 pt-3">
              <p className="font-mono text-xs text-black/40 uppercase mb-1">Duel on</p>
              <p className="font-mono text-sm text-black font-bold leading-snug">
                {matchData.eventQuestion}
              </p>
            </div>

            {/* Notice */}
            <div className="mx-4 mb-4 border-2 border-black bg-white p-2 shadow-brutal">
              <p className="font-mono text-xs text-black">
                ⚡ Funds locked in escrow. Winner takes 95% of pot.
              </p>
            </div>

            {/* Actions */}
            <div className="border-t-3 border-black grid grid-cols-2 divide-x-3 divide-black">
              <button
                className="py-3 font-mono text-sm font-bold text-black/50 hover:bg-white transition-all hover:scale-105"
                onClick={hideMatch}
              >
                DISMISS
              </button>
              <button
                className="py-3 font-mono text-sm font-bold text-black bg-brutal-green hover:opacity-80 transition-all hover:scale-105 animate-glow-pulse"
                onClick={hideMatch}
              >
                LET'S GO 🔥
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
