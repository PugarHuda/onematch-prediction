"use client";

import { useAppStore } from "@/lib/store";

const PRESETS = [5, 10, 25, 50, 100];

export function StakeSlider() {
  const stakeAmount    = useAppStore((s) => s.stakeAmount);
  const setStakeAmount = useAppStore((s) => s.setStakeAmount);

  return (
    <div className="border-3 border-black bg-brutal-yellow shadow-brutal p-4 hover:shadow-brutal-lg transition-all relative overflow-hidden group">
      {/* Animated corner accent */}
      <div className="absolute top-0 left-0 w-12 h-12 border-r-3 border-b-3 border-black opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-l-3 border-t-3 border-black opacity-20 group-hover:opacity-40 transition-opacity" />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className="font-mono text-xs text-black/60 uppercase font-bold flex items-center gap-1">
          💰 Stake Amount
        </p>
        <div className="border-2 border-black bg-black px-2 py-0.5 animate-pulse-glow relative overflow-hidden">
          <span className="font-mono font-bold text-brutal-yellow text-sm relative z-10">{stakeAmount} OCT</span>
          <div className="absolute inset-0 bg-brutal-yellow opacity-0 group-hover:opacity-20 transition-opacity" />
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5 mb-2 relative z-10">
        {PRESETS.map((p, i) => (
          <button
            key={p}
            onClick={() => setStakeAmount(p)}
            className={`flex-1 py-2 font-mono text-xs font-bold border-2 border-black transition-all hover:scale-105 active:scale-95 relative overflow-hidden group/btn
              ${stakeAmount === p
                ? "bg-black text-brutal-yellow shadow-brutal"
                : "bg-white text-black hover:bg-brutal-pink hover:shadow-brutal"
              }`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="relative z-10">{p}</span>
            {stakeAmount === p && (
              <div className="absolute inset-0 bg-brutal-yellow opacity-20 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Custom */}
      <div className="flex items-center gap-2 relative z-10">
        <input
          type="number"
          min={1}
          max={10000}
          value={stakeAmount}
          onChange={(e) => setStakeAmount(Number(e.target.value))}
          className="brutal-input text-sm flex-1 transition-all focus:shadow-brutal-lg"
          placeholder="Custom"
        />
        <span className="font-mono text-xs text-black/60 font-bold animate-pulse">OCT</span>
      </div>
      
      {/* Hint */}
      <p className="font-mono text-[10px] text-black/30 text-center mt-2 relative z-10 animate-fade-in-up">
        💡 Swipe UP for 3× stake boost
      </p>
    </div>
  );
}
