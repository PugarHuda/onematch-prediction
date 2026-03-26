"use client";

import { useState } from "react";
import { useCurrentAccount } from "@onelabs/dapp-kit";

// Simulated token prices (in production, fetch from OneDEX)
const TOKENS = [
  { symbol: "OCT", name: "OneChain Token", price: 1.0, icon: "🪙" },
  { symbol: "USDC", name: "USD Coin", price: 1.0, icon: "💵" },
  { symbol: "WETH", name: "Wrapped ETH", price: 2500, icon: "💎" },
];

export function TokenSwapWidget() {
  const account = useCurrentAccount();
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [amount, setAmount] = useState(10);

  const convertedAmount = (amount * fromToken.price) / toToken.price;

  if (!account) return null;

  return (
    <div className="border-3 border-black bg-brutal-cyan shadow-brutal p-4 hover:shadow-brutal-lg transition-all relative overflow-hidden">
      {/* OneDEX Badge */}
      <div className="absolute top-2 right-2">
        <span className="brutal-tag bg-black text-brutal-cyan text-[10px] animate-pulse-glow">
          ONEDEX
        </span>
      </div>

      <p className="font-mono text-xs text-black/60 uppercase font-bold mb-3">
        💱 QUICK SWAP
      </p>

      {/* From Token */}
      <div className="border-2 border-black bg-white p-2 mb-2 shadow-brutal">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs text-black/40">FROM</span>
          <select
            value={fromToken.symbol}
            onChange={(e) => setFromToken(TOKENS.find((t) => t.symbol === e.target.value)!)}
            className="font-mono text-xs font-bold border border-black px-1 bg-white"
          >
            {TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.icon} {t.symbol}
              </option>
            ))}
          </select>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full font-mono font-bold text-lg border-none outline-none"
          min={0}
        />
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center -my-1 relative z-10">
        <button
          onClick={() => {
            setFromToken(toToken);
            setToToken(fromToken);
          }}
          className="border-2 border-black bg-brutal-yellow w-8 h-8 flex items-center justify-center shadow-brutal hover:rotate-180 transition-transform duration-300"
        >
          <span className="font-mono font-bold">⇅</span>
        </button>
      </div>

      {/* To Token */}
      <div className="border-2 border-black bg-white p-2 mb-3 shadow-brutal">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs text-black/40">TO</span>
          <select
            value={toToken.symbol}
            onChange={(e) => setToToken(TOKENS.find((t) => t.symbol === e.target.value)!)}
            className="font-mono text-xs font-bold border border-black px-1 bg-white"
          >
            {TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.icon} {t.symbol}
              </option>
            ))}
          </select>
        </div>
        <div className="font-mono font-bold text-lg text-brutal-purple">
          ≈ {convertedAmount.toFixed(4)}
        </div>
      </div>

      {/* Swap Button */}
      <button className="btn-brutal bg-black text-brutal-cyan w-full py-2 text-xs hover:scale-105 active:scale-95">
        SWAP ON ONEDEX →
      </button>

      <p className="font-mono text-[10px] text-black/30 text-center mt-2">
        Powered by OneDEX · Coming Soon
      </p>
    </div>
  );
}
