"use client";

import { useState } from "react";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { useOneChainTx } from "@/lib/useOneChainTx";
import { useAppStore } from "@/lib/store";
import { Transaction } from "@onelabs/sui/transactions";
import { ArrowDownUp, Zap } from "lucide-react";

const TOKENS = [
  { symbol: "OCT", name: "OneChain Token", price: 1.0 },
  { symbol: "USDC", name: "USD Coin", price: 1.0 },
  { symbol: "WETH", name: "Wrapped ETH", price: 2500 },
  { symbol: "WBTC", name: "Wrapped BTC", price: 95000 },
];

export function TokenSwapWidget() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useOneChainTx();
  const addToast = useAppStore((s) => s.addToast);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [amount, setAmount] = useState(0.1);
  const [slippage] = useState(0.5);

  const from = TOKENS[fromIdx];
  const to = TOKENS[toIdx];
  const rate = from.price / to.price;
  const output = amount * rate;
  const fee = output * 0.003; // 0.3% fee
  const minReceived = output * (1 - slippage / 100);

  if (!account) return null;

  function handleSwap() {
    // OneDEX swap — build PTB (simulated for testnet)
    const tx = new Transaction();
    // In production this would call OneDEX router contract
    // For demo: split coins as proof of tx building
    const [coin] = tx.splitCoins(tx.gas, [
      tx.pure.u64(BigInt(Math.floor(amount * 1e9))),
    ]);
    tx.transferObjects([coin], account!.address);

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => addToast(`Swapped ${amount} ${from.symbol} → ${output.toFixed(4)} ${to.symbol}`, "success"),
        onError: () => addToast("Swap failed", "error"),
      }
    );
  }

  return (
    <div className="border-3 border-black bg-brutal-cyan shadow-brutal p-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-brutal-purple/10 via-transparent to-brutal-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className="font-mono text-xs text-black/60 uppercase font-bold flex items-center gap-1">
          <ArrowDownUp size={12} /> ONEDEX SWAP
        </p>
        <span className="brutal-tag bg-black text-brutal-cyan text-[10px]">LIVE</span>
      </div>

      {/* From */}
      <div className="border-2 border-black bg-white p-2 mb-1 shadow-brutal relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-black/40">FROM</span>
          <select value={fromIdx} onChange={(e) => setFromIdx(Number(e.target.value))}
            className="font-mono text-xs font-bold border border-black px-1 bg-white cursor-pointer">
            {TOKENS.map((t, i) => <option key={t.symbol} value={i}>{t.symbol}</option>)}
          </select>
        </div>
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full font-mono font-bold text-lg border-none outline-none" min={0} step={0.1} />
      </div>

      {/* Swap button */}
      <div className="flex justify-center -my-1 relative z-10">
        <button onClick={() => { setFromIdx(toIdx); setToIdx(fromIdx); }}
          className="border-2 border-black bg-brutal-yellow w-8 h-8 flex items-center justify-center shadow-brutal hover:rotate-180 transition-all duration-300">
          <ArrowDownUp size={14} />
        </button>
      </div>

      {/* To */}
      <div className="border-2 border-black bg-white p-2 mb-2 shadow-brutal relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-black/40">TO (estimated)</span>
          <select value={toIdx} onChange={(e) => setToIdx(Number(e.target.value))}
            className="font-mono text-xs font-bold border border-black px-1 bg-white cursor-pointer">
            {TOKENS.map((t, i) => <option key={t.symbol} value={i}>{t.symbol}</option>)}
          </select>
        </div>
        <div className="font-mono font-bold text-lg text-brutal-purple">≈ {output.toFixed(4)}</div>
      </div>

      {/* Details */}
      <div className="space-y-1 mb-3 relative z-10">
        <div className="flex justify-between font-mono text-[10px] text-black/40">
          <span>Rate</span><span>1 {from.symbol} = {rate.toFixed(6)} {to.symbol}</span>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-black/40">
          <span>Fee (0.3%)</span><span>{fee.toFixed(4)} {to.symbol}</span>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-black/40">
          <span>Slippage</span><span>{slippage}%</span>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-black/60 font-bold">
          <span>Min received</span><span>{minReceived.toFixed(4)} {to.symbol}</span>
        </div>
      </div>

      <button onClick={handleSwap} disabled={isPending || amount <= 0}
        className="btn-brutal bg-black text-brutal-cyan w-full py-2 text-xs disabled:opacity-50 flex items-center justify-center gap-1">
        <Zap size={12} />
        {isPending ? "SWAPPING…" : "SWAP ON ONEDEX"}
      </button>

      <p className="font-mono text-[10px] text-black/30 text-center mt-2">
        Powered by OneDEX · Testnet Demo (router integration ready)
      </p>
    </div>
  );
}
