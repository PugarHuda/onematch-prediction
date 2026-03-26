"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  AnimatePresence,
} from "framer-motion";
import type { PredictionEvent } from "@/lib/types";
import { CATEGORY_EMOJI } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { useMarketNews } from "@/lib/useMarketNews";
import { useState } from "react";
import clsx from "clsx";

// Card bg colors cycling through fun palette
const CARD_COLORS = [
  { bg: "#FFE500", text: "#0A0A0A", accent: "#FF3CAC" }, // yellow
  { bg: "#FF3CAC", text: "#0A0A0A", accent: "#FFE500" }, // pink
  { bg: "#4DFFFF", text: "#0A0A0A", accent: "#BF5FFF" }, // cyan
  { bg: "#00FF87", text: "#0A0A0A", accent: "#FF6B00" }, // green
  { bg: "#BF5FFF", text: "#FAFAFA", accent: "#FFE500" }, // purple
];

interface Props {
  event: PredictionEvent;
  onSwipe: (direction: "left" | "right" | "up" | "down") => void;
  isTop: boolean;
  index: number;
  colorIndex: number;
}

export function EventCard({ event, onSwipe, isTop, index, colorIndex }: Props) {
  const stakeAmount = useAppStore((s) => s.stakeAmount);
  const [showDetail, setShowDetail] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const colors = CARD_COLORS[colorIndex % CARD_COLORS.length];

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-20, 20]);

  const yesOpacity  = useTransform(x, [30, 120], [0, 1]);
  const noOpacity   = useTransform(x, [-120, -30], [1, 0]);
  const skipOpacity = useTransform(y, [30, 120], [0, 1]);

  const totalVotes = event.yesCount + event.noCount;
  const yesPct = totalVotes > 0 ? Math.round((event.yesCount / totalVotes) * 100) : 50;

  const timeLeft = () => {
    const diff = event.endTime - Date.now();
    const days = Math.floor(diff / 86_400_000);
    const hrs  = Math.floor((diff % 86_400_000) / 3_600_000);
    if (days > 0) return `${days}d left`;
    return `${hrs}h left`;
  };

  function handleDragEnd(_: unknown, info: PanInfo) {
    setIsDragging(false);
    const { offset } = info;
    if (offset.x > 120)       onSwipe("right");
    else if (offset.x < -120) onSwipe("left");
    else if (offset.y < -120) onSwipe("up");
    else if (offset.y > 120)  onSwipe("down");
  }

  function handleTap() {
    if (!isDragging) setShowDetail(true);
  }

  // Background cards (stack effect) — neat pile behind top card
  if (!isTop) {
    const scale     = 1 - index * 0.05;
    const translateY = index * 10;
    const rotate     = index % 2 === 0 ? index * 1.5 : -(index * 1.5);
    return (
      <div
        className="absolute inset-x-0 top-0 border-3 border-black"
        style={{
          backgroundColor: CARD_COLORS[(colorIndex + index) % CARD_COLORS.length].bg,
          transform: `scale(${scale}) translateY(${translateY}px) rotate(${rotate}deg)`,
          transformOrigin: "bottom center",
          zIndex: 10 - index,
          height: 520,
          boxShadow: "5px 5px 0px #0A0A0A",
        }}
      />
    );
  }

  return (
    <>
      {/* Draggable top card */}
      <motion.div
        className="absolute inset-x-0 top-0 border-3 border-black cursor-grab active:cursor-grabbing select-none transition-shadow"
        style={{
          x, y, rotate,
          zIndex: 20,
          backgroundColor: colors.bg,
          boxShadow: isDragging ? "12px 12px 0px #0A0A0A" : "8px 8px 0px #0A0A0A",
        }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.85}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* YES overlay */}
        <motion.div
          className="overlay-yes absolute inset-0 pointer-events-none flex items-start justify-end p-5"
          style={{ opacity: yesOpacity }}
        >
          <div className="border-4 border-black bg-brutal-green px-4 py-2 -rotate-12 shadow-brutal relative overflow-hidden">
            <span className="font-mono font-bold text-2xl text-black relative z-10">YES ✓</span>
            {/* Animated glow */}
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
          </div>
        </motion.div>

        {/* NO overlay */}
        <motion.div
          className="overlay-no absolute inset-0 pointer-events-none flex items-start justify-start p-5"
          style={{ opacity: noOpacity }}
        >
          <div className="border-4 border-black bg-brutal-red px-4 py-2 rotate-12 shadow-brutal relative overflow-hidden">
            <span className="font-mono font-bold text-2xl text-white relative z-10">NO ✗</span>
            {/* Animated glow */}
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
          </div>
        </motion.div>

        {/* SKIP overlay */}
        <motion.div
          className="overlay-skip absolute inset-0 pointer-events-none flex items-end justify-center pb-6"
          style={{ opacity: skipOpacity }}
        >
          <div className="border-4 border-black bg-brutal-orange px-4 py-2 shadow-brutal relative overflow-hidden">
            <span className="font-mono font-bold text-xl text-black relative z-10">SKIP ↓</span>
            {/* Animated glow */}
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
          </div>
        </motion.div>

        {/* Card body */}
        <div className="p-5 flex flex-col gap-4" style={{ minHeight: 520, color: colors.text }}>
          {/* Top row */}
          <div className="flex items-center justify-between">
            <span
              className="brutal-tag animate-float relative overflow-hidden group/tag"
              style={{ backgroundColor: colors.accent, color: "#0A0A0A" }}
            >
              <span className="relative z-10">{CATEGORY_EMOJI[event.category]} {event.category.toUpperCase()}</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover/tag:opacity-20 animate-pulse" />
            </span>
            <span className="font-mono text-xs border-2 border-black bg-white text-black px-2 py-0.5 animate-pulse-glow relative overflow-hidden group/time">
              <span className="relative z-10">⏱ {timeLeft()}</span>
              <div className="absolute inset-0 bg-brutal-orange opacity-0 group-hover/time:opacity-20 transition-opacity" />
            </span>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center py-2">
            <h2 className="font-mono font-bold text-[1.6rem] leading-tight hover:scale-[1.02] transition-transform cursor-pointer" style={{ color: colors.text }}>
              {event.question}
            </h2>
          </div>

          {/* Sentiment bar */}
          <div>
            <div className="flex justify-between font-mono text-xs mb-1 font-bold">
              <span style={{ color: "#00AA55" }} className="animate-pulse-scale inline-block">YES {yesPct}%</span>
              <span style={{ color: "#CC0033" }} className="animate-pulse-scale inline-block">NO {100 - yesPct}%</span>
            </div>
            <div className="h-4 border-3 border-black bg-white overflow-hidden relative group">
              <div
                className="h-full transition-all duration-500 ease-out relative"
                style={{ width: `${yesPct}%`, backgroundColor: "#00FF87" }}
              >
                <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100" />
                {/* Pulse effect */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between font-mono text-xs mt-1 opacity-60">
              <span className="hover:text-brutal-green transition-colors">{event.yesCount} players</span>
              <span className="hover:text-brutal-red transition-colors">{event.noCount} players</span>
            </div>
          </div>

          {/* Stake row */}
          <div
            className="border-t-3 border-black pt-4 flex items-center justify-between"
          >
            <div className="group/stake">
              <p className="font-mono text-xs opacity-60 uppercase">Your Stake</p>
              <p className="font-mono font-bold text-2xl group-hover/stake:scale-110 transition-transform inline-block">{stakeAmount} OCT</p>
            </div>
            <div className="text-right group/win">
              <p className="font-mono text-xs opacity-60 uppercase">Potential Win</p>
              <p className="font-mono font-bold text-2xl text-brutal-green group-hover/win:scale-110 transition-transform inline-block animate-pulse-scale">~{(stakeAmount * 1.9).toFixed(1)} OCT</p>
            </div>
          </div>

          {/* Tap hint */}
          <p className="font-mono text-xs text-center opacity-40 border-t-2 border-black pt-2 relative group/hint">
            <span className="relative z-10 group-hover/hint:opacity-100 transition-opacity">TAP FOR DETAILS · DRAG TO PREDICT</span>
            {/* Animated dots */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
              <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </span>
          </p>
        </div>

        {/* Swipe hint bar */}
        <div className="border-t-3 border-black grid grid-cols-4 divide-x-3 divide-black">
          {[
            { label: "← NO",   color: "#FF2D55" },
            { label: "↑ 3×",   color: "#FF6B00" },
            { label: "↓ SKIP", color: "#888888" },
            { label: "YES →",  color: "#00AA55" },
          ].map((h, i) => (
            <div key={h.label} className="py-2 text-center group cursor-pointer hover:bg-black/5 transition-colors relative overflow-hidden" style={{ animationDelay: `${i * 0.05}s` }}>
              <span className="font-mono text-xs font-bold group-hover:scale-110 inline-block transition-transform relative z-10" style={{ color: h.color }}>
                {h.label}
              </span>
              {/* Hover bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: h.color }} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {showDetail && (
          <EventDetailModal
            event={event}
            colors={colors}
            stakeAmount={stakeAmount}
            yesPct={yesPct}
            timeLeft={timeLeft()}
            onClose={() => setShowDetail(false)}
            onBet={(pos) => {
              setShowDetail(false);
              onSwipe(pos ? "right" : "left");
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

interface ModalProps {
  event: PredictionEvent;
  colors: { bg: string; text: string; accent: string };
  stakeAmount: number;
  yesPct: number;
  timeLeft: string;
  onClose: () => void;
  onBet: (position: boolean) => void;
}

function EventDetailModal({ event, colors, stakeAmount, yesPct, timeLeft, onClose, onBet }: ModalProps) {
  const totalVotes = event.yesCount + event.noCount;
  const { news, loading } = useMarketNews(event.newsKeywords, event.category);
  const [activeTab, setActiveTab] = useState<"info" | "news">("info");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10,10,10,0.75)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md border-3 border-black overflow-hidden"
        style={{
          backgroundColor: colors.bg,
          boxShadow: "8px 8px 0px #0A0A0A",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="border-b-3 border-black p-4 flex items-center justify-between flex-shrink-0 relative overflow-hidden"
          style={{ backgroundColor: colors.accent }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          
          <span className="brutal-tag bg-black text-white relative z-10">
            {CATEGORY_EMOJI[event.category]} {event.category.toUpperCase()}
          </span>
          <div className="flex items-center gap-2 relative z-10">
            <span className="font-mono text-xs border border-black bg-white text-black px-2 py-0.5 animate-pulse-glow">
              ⏱ {timeLeft}
            </span>
            <button
              onClick={onClose}
              className="border-2 border-black bg-white w-8 h-8 font-mono font-bold text-black hover:bg-brutal-red hover:text-white transition-all flex items-center justify-center hover:rotate-90 duration-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Question ── */}
        <div className="p-4 border-b-3 border-black flex-shrink-0" style={{ color: colors.text }}>
          <h2 className="font-mono font-bold text-lg leading-tight">{event.question}</h2>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b-3 border-black grid grid-cols-2 divide-x-3 divide-black flex-shrink-0">
          {(["info", "news"] as const).map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 font-mono text-xs font-bold uppercase transition-all relative overflow-hidden group/tab
                ${activeTab === tab
                  ? "bg-black text-brutal-yellow"
                  : "bg-white text-black hover:bg-brutal-yellow hover:text-black"
                }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="relative z-10">{tab === "info" ? "📊 MARKET INFO" : "📰 RELATED NEWS"}</span>
              {activeTab !== tab && (
                <span className="absolute inset-0 bg-brutal-yellow transform -translate-x-full group-hover/tab:translate-x-0 transition-transform duration-300" />
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brutal-yellow animate-shimmer" />
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1">
          {activeTab === "info" ? (
            <div className="p-4 space-y-4">
              {/* Context blurb */}
              <div className="border-2 border-black bg-white p-3 shadow-brutal hover:shadow-brutal-lg transition-all animate-fade-in-up relative overflow-hidden group/context">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-brutal-cyan/0 to-brutal-pink/0 group-hover/context:from-brutal-cyan/10 group-hover/context:to-brutal-pink/10 transition-all duration-500" />
                
                <p className="font-mono text-xs text-black/40 uppercase mb-1 font-bold flex items-center gap-1 relative z-10">
                  <span className="inline-block animate-bounce-subtle">📌</span>
                  Context
                </p>
                <p className="text-sm text-black leading-relaxed relative z-10">{event.context}</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "ENDS",     value: timeLeft, icon: "⏱" },
                  { label: "PLAYERS",  value: totalVotes.toString(), icon: "👥" },
                  { label: "AVG STAKE",value: "42 OCT", icon: "💰" },
                ].map((s, i) => (
                  <div key={s.label} className={`border-2 border-black bg-white p-2 text-center shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all cursor-pointer animate-pop-in relative overflow-hidden group/stat`} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="absolute top-1 right-1 opacity-30 group-hover/stat:scale-125 transition-transform">
                      <span className="text-xs">{s.icon}</span>
                    </div>
                    <p className="font-mono text-xs text-black/40 uppercase relative z-10">{s.label}</p>
                    <p className="font-mono font-bold text-sm text-black relative z-10 group-hover/stat:scale-110 transition-transform inline-block">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Sentiment bar */}
              <div>
                <div className="flex justify-between font-mono text-xs font-bold mb-1">
                  <span style={{ color: "#00AA55" }} className="animate-pulse-scale inline-block">YES {yesPct}%</span>
                  <span style={{ color: "#CC0033" }} className="animate-pulse-scale inline-block">NO {100 - yesPct}%</span>
                </div>
                <div className="h-5 border-3 border-black bg-white overflow-hidden relative group">
                  <div className="h-full bg-brutal-green transition-all duration-500 relative" style={{ width: `${yesPct}%` }}>
                    <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between font-mono text-xs mt-1 text-black/40">
                  <span className="hover:text-brutal-green transition-colors cursor-pointer">{event.yesCount} YES</span>
                  <span className="hover:text-brutal-red transition-colors cursor-pointer">{event.noCount} NO</span>
                </div>
              </div>

              {/* Pot info */}
              <div className="border-2 border-black bg-white p-3 shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden group/pot">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-brutal-yellow/0 via-brutal-yellow/20 to-brutal-yellow/0 -translate-x-full group-hover/pot:translate-x-full transition-transform duration-1000" />
                
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <p className="font-mono text-xs text-black/40 uppercase">Your Stake</p>
                    <p className="font-mono font-bold text-2xl text-black hover:scale-110 transition-transform inline-block">{stakeAmount} OCT</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-black/40 uppercase">If You Win</p>
                    <p className="font-mono font-bold text-2xl text-black animate-pulse hover:scale-110 transition-transform inline-block">
                      ~{(stakeAmount * 1.9).toFixed(1)} OCT
                    </p>
                  </div>
                </div>
              </div>

              <p className="font-mono text-xs text-black/40 border-t-2 border-black pt-3 flex items-center gap-1 animate-fade-in-up">
                <span className="inline-block animate-pulse-scale">⚡</span>
                P2P duel on OneChain Testnet — funds locked in Move smart contract escrow.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`border-2 border-black bg-white p-3 animate-pulse relative overflow-hidden`} style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="h-3 bg-black/10 rounded mb-2 w-3/4 animate-shimmer" />
                      <div className="h-2 bg-black/10 rounded w-full mb-1" />
                      <div className="h-2 bg-black/10 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : news.length === 0 ? (
                <div className="border-2 border-black bg-white p-4 text-center hover:shadow-brutal transition-all animate-fade-in-up">
                  <div className="text-4xl mb-2 animate-bounce-subtle">📰</div>
                  <p className="font-mono text-sm text-black/40">No news found for this market.</p>
                </div>
              ) : (
                news.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border-2 border-black bg-white p-3 shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all group/news animate-slide-in-left relative overflow-hidden"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {/* Hover background */}
                    <div className="absolute inset-0 bg-brutal-yellow opacity-0 group-hover/news:opacity-10 transition-opacity" />
                    
                    <div className="flex items-center justify-between mb-1 relative z-10">
                      <span className="brutal-tag bg-black text-white text-[10px]">
                        {item.source}
                      </span>
                      <span className="font-mono text-[10px] text-black/30">{item.publishedAt}</span>
                    </div>
                    <p className="font-mono font-bold text-sm text-black leading-snug mb-1 group-hover/news:text-brutal-purple transition-colors relative z-10">
                      {item.title}
                    </p>
                    <p className="text-xs text-black/60 leading-relaxed line-clamp-2 relative z-10">
                      {item.description}
                    </p>
                    <p className="font-mono text-[10px] text-brutal-purple mt-1 group-hover/news:translate-x-1 transition-transform inline-block relative z-10">READ MORE ↗</p>
                  </a>
                ))
              )}

              <p className="font-mono text-[10px] text-black/30 text-center pt-1">
                News sourced via GNews API · Not financial advice
              </p>
            </div>
          )}
        </div>

        {/* ── Action buttons ── */}
        <div className="border-t-3 border-black grid grid-cols-2 divide-x-3 divide-black flex-shrink-0">
          <button
            onClick={() => onBet(false)}
            className="py-4 font-mono font-bold text-lg bg-brutal-red text-white hover:opacity-90 transition-all hover:scale-105 active:scale-95 relative overflow-hidden group/no"
          >
            <span className="relative z-10">✗ BET NO</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover/no:opacity-20 animate-pulse" />
          </button>
          <button
            onClick={() => onBet(true)}
            className="py-4 font-mono font-bold text-lg bg-brutal-green text-black hover:opacity-90 transition-all hover:scale-105 active:scale-95 relative overflow-hidden group/yes"
          >
            <span className="relative z-10">✓ BET YES</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover/yes:opacity-20 animate-pulse" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
