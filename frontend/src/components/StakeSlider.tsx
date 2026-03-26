"use client";

import { useAppStore } from "@/lib/store";

const PRESETS = [5, 10, 25, 50, 100];

export function StakeSlider() {
  const stakeAmount    = useAppStore((s) => s.stakeAmount);
  const setStakeAmount = useAppStore((s) => s.setStakeAmount);

  return (
    <div className="border-3 border-black bg-brutal-yellow shadow-brutal p-4 hover:shadow-brutal-lg transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-xs text-black/60 uppercase font-bold">Stake Amount</p>
        <div className="border-2 border-black bg-black px-2 py-0.5 animate-pulse-glow">
          <span className="font-mono font-bold text-brutal-yellow text-sm">{stakeAmount} OCT</span>
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5 mb-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setStakeAmount(p)}
            className={`flex-1 py-2 font-mono text-xs font-bold border-2 border-black transition-all hover:scale-105 active:scale-95
              ${stakeAmount === p
                ? "bg-black text-brutal-yellow shadow-brutal"
                : "bg-white text-black hover:bg-brutal-pink hover:shadow-brutal"
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Custom */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={10000}
          value={stakeAmount}
          onChange={(e) => setStakeAmount(Number(e.target.value))}
          className="brutal-input text-sm flex-1"
          placeholder="Custom"
        />
        <span className="font-mono text-xs text-black/60 font-bold">OCT</span>
      </div>
    </div>
  );
}
