"use client";

import { useState } from "react";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { Header } from "@/components/Header";
import { ToastContainer } from "@/components/Toast";
import { useAppStore } from "@/lib/store";
import { useOneChainTx } from "@/lib/useOneChainTx";
import {
  buildCreateEventTx,
  buildSettleEventTx,
  buildCancelEventTx,
  explorerTxUrl,
} from "@/lib/onechain";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/constants";
import type { Category } from "@/lib/constants";

const ADMIN_CAP_ID =
  process.env.NEXT_PUBLIC_ADMIN_CAP ??
  "0xdb907e688173caab6c6393308854d72e843c7c7de88c29acd5ae692a8bae171e";

export default function AdminPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useOneChainTx();
  const addToast = useAppStore((s) => s.addToast);
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  // Create event form
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<Category>("crypto");
  const [daysFromNow, setDaysFromNow] = useState(7);
  const [creating, setCreating] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);

  // Settle / cancel form
  const [eventId, setEventId] = useState("");
  const [settleResult, setSettleResult] = useState(true);
  const [settling, setSettling] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  function handleCreate() {
    if (!account || !question.trim()) return;
    const endTimeMs = Date.now() + daysFromNow * 86_400_000;
    const tx = buildCreateEventTx(question.trim(), category, endTimeMs);
    setCreating(true);
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setCreating(false);
          setLastTx(result.digest);
          setQuestion("");
          addToast("Event created on-chain!", "success");
        },
        onError: (e) => {
          setCreating(false);
          addToast(`Failed: ${e.message}`, "error");
        },
      }
    );
  }

  function handleSettle() {
    if (!account || !eventId.trim()) return;
    const tx = buildSettleEventTx(ADMIN_CAP_ID, eventId.trim(), settleResult);
    setSettling(true);
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setSettling(false);
          setLastTx(result.digest);
          addToast(`Event settled — ${settleResult ? "YES" : "NO"} wins!`, "success");
        },
        onError: (e) => {
          setSettling(false);
          addToast(`Failed: ${e.message}`, "error");
        },
      }
    );
  }

  function handleCancel() {
    if (!account || !eventId.trim()) return;
    const tx = buildCancelEventTx(ADMIN_CAP_ID, eventId.trim());
    setCancelling(true);
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setCancelling(false);
          setLastTx(result.digest);
          addToast("Event cancelled.", "info");
        },
        onError: (e) => {
          setCancelling(false);
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
            <p className="font-mono text-sm text-black/50 mt-1">Admin wallet required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brutal-bg">
      <Header />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full space-y-6">
        {/* Header */}
        <div className="border-3 border-black bg-brutal-pink shadow-brutal p-4">
          <h1 className="font-mono font-bold text-2xl text-black flex items-center gap-2">
            🔧 ADMIN PANEL
          </h1>
          <p className="font-mono text-xs text-black/60 mt-1">
            AdminCap: {ADMIN_CAP_ID.slice(0, 16)}…
          </p>
        </div>

        {/* Last TX */}
        {lastTx && (
          <div className="border-3 border-black bg-brutal-green shadow-brutal p-3 flex items-center justify-between">
            <span className="font-mono text-xs text-black font-bold">LAST TX:</span>
            <a
              href={explorerTxUrl(lastTx)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-brutal-purple hover:underline font-bold"
            >
              {lastTx.slice(0, 20)}… ↗
            </a>
          </div>
        )}

        {/* ── Create Event ── */}
        <div className="border-3 border-black bg-white shadow-brutal-xl">
          <div className="border-b-3 border-black p-4 bg-brutal-yellow">
            <h2 className="font-mono font-bold text-xl text-black">➕ CREATE EVENT</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="font-mono text-xs text-black/40 uppercase block mb-1">
                Question
              </label>
              <input
                className="brutal-input"
                placeholder="Will BTC hit $120k before May 2026?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={200}
              />
              <p className="font-mono text-xs text-black/30 mt-1 text-right">
                {question.length}/200
              </p>
            </div>

            <div>
              <label className="font-mono text-xs text-black/40 uppercase block mb-2">
                Category
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`border-2 border-black py-2 font-mono text-xs font-bold uppercase transition-all shadow-brutal
                      ${category === c ? "bg-black text-brutal-yellow" : "bg-white text-black hover:bg-brutal-yellow"}`}
                  >
                    {CATEGORY_EMOJI[c]}
                    <br />
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-xs text-black/40 uppercase block mb-1">
                Duration (days from now)
              </label>
              <div className="flex gap-2">
                {[1, 3, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDaysFromNow(d)}
                    className={`flex-1 py-2 font-mono text-xs font-bold border-2 border-black transition-all shadow-brutal
                      ${daysFromNow === d ? "bg-black text-brutal-yellow" : "bg-white text-black hover:bg-brutal-pink"}`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
              <p className="font-mono text-xs text-black/40 mt-1">
                Ends: {new Date(Date.now() + daysFromNow * 86_400_000).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={handleCreate}
              disabled={!question.trim() || creating}
              className="btn-yellow w-full py-3 text-base disabled:opacity-50"
            >
              {creating ? "CREATING…" : "CREATE ON-CHAIN →"}
            </button>
          </div>
        </div>

        {/* ── Settle / Cancel Event ── */}
        <div className="border-3 border-black bg-white shadow-brutal-xl">
          <div className="border-b-3 border-black p-4 bg-brutal-cyan">
            <h2 className="font-mono font-bold text-xl text-black">⚖️ SETTLE / CANCEL EVENT</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="font-mono text-xs text-black/40 uppercase block mb-1">
                Event Object ID
              </label>
              <input
                className="brutal-input font-mono text-xs"
                placeholder="0x..."
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              />
            </div>

            <div>
              <label className="font-mono text-xs text-black/40 uppercase block mb-2">
                Result
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSettleResult(true)}
                  className={`py-3 font-mono font-bold border-2 border-black transition-all shadow-brutal
                    ${settleResult ? "bg-brutal-green text-black" : "bg-white text-black hover:bg-brutal-green/50"}`}
                >
                  ✓ YES WINS
                </button>
                <button
                  onClick={() => setSettleResult(false)}
                  className={`py-3 font-mono font-bold border-2 border-black transition-all shadow-brutal
                    ${!settleResult ? "bg-brutal-red text-white" : "bg-white text-black hover:bg-brutal-red/30"}`}
                >
                  ✗ NO WINS
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSettle}
                disabled={!eventId.trim() || settling}
                className="btn-yellow py-3 text-sm disabled:opacity-50"
              >
                {settling ? "SETTLING…" : "SETTLE EVENT →"}
              </button>
              <button
                onClick={handleCancel}
                disabled={!eventId.trim() || cancelling}
                className="btn-brutal bg-brutal-red text-white py-3 text-sm disabled:opacity-50"
              >
                {cancelling ? "CANCELLING…" : "CANCEL EVENT ✕"}
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="border-3 border-black bg-black shadow-brutal p-4">
          <p className="font-mono text-xs text-brutal-yellow font-bold mb-2">📋 QUICK REFERENCE</p>
          <div className="space-y-1 font-mono text-xs text-white/60">
            <p>Package: <span className="text-brutal-cyan">{process.env.NEXT_PUBLIC_PACKAGE_ID?.slice(0, 20)}…</span></p>
            <p>EventRegistry: <span className="text-brutal-cyan">{process.env.NEXT_PUBLIC_EVENT_REGISTRY?.slice(0, 20)}…</span></p>
            <p>ProfileRegistry: <span className="text-brutal-cyan">{process.env.NEXT_PUBLIC_PROFILE_REGISTRY?.slice(0, 20)}…</span></p>
          </div>
        </div>
      </main>
    </div>
  );
}
