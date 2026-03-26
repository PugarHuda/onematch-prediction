"use client";

import { ConnectButton, useCurrentAccount } from "@onelabs/dapp-kit";
import { useEffect, useState } from "react";
import { suiClient, formatOCT } from "@/lib/onechain";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { href: "/feed",    label: "FEED",    emoji: "🃏" },
  { href: "/duels",   label: "DUELS",   emoji: "⚔️" },
  { href: "/profile", label: "PROFILE", emoji: "👤" },
];

export function Header() {
  const account  = useCurrentAccount();
  const pathname = usePathname();
  const [balance, setBalance] = useState<bigint>(0n);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevBalance, setPrevBalance] = useState<bigint>(0n);
  const [balanceChanged, setBalanceChanged] = useState(false);

  useEffect(() => {
    if (!account) return;
    suiClient
      .getCoins({ owner: account.address, coinType: "0x2::oct::OCT" })
      .then((r) => setBalance(r.data.reduce((s, c) => s + BigInt(c.balance), 0n)))
      .catch(() => {});
  }, [account]);

  useEffect(() => {
    if (balance !== prevBalance && prevBalance !== 0n) {
      setBalanceChanged(true);
      setTimeout(() => setBalanceChanged(false), 1000);
    }
    setPrevBalance(balance);
  }, [balance, prevBalance]);

  return (
    <header className="border-b-3 border-black bg-brutal-yellow sticky top-0 z-50 shadow-brutal hover:shadow-brutal-lg transition-all relative overflow-hidden">
      {/* Animated background shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '3s' }} />
      
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono font-bold text-xl text-black tracking-tight group-hover:scale-105 transition-transform inline-block relative">
            ONE<span className="text-brutal-pink">MATCH</span>
            {/* Underline animation */}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brutal-pink group-hover:w-full transition-all duration-300" />
          </span>
          <span className="brutal-tag bg-black text-brutal-yellow hidden sm:inline animate-pulse-glow relative overflow-hidden">
            <span className="relative z-10">BETA</span>
            <div className="absolute inset-0 bg-brutal-yellow opacity-0 animate-shimmer" />
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "btn-brutal px-3 py-1 text-sm hover:scale-105 active:scale-95 relative overflow-hidden group/nav",
                pathname === n.href
                  ? "bg-black text-brutal-yellow shadow-brutal"
                  : "bg-white text-black hover:bg-brutal-pink"
              )}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="relative z-10">
                <span className="inline-block group-hover/nav:scale-125 transition-transform">{n.emoji}</span> {n.label}
              </span>
              {pathname === n.href && (
                <div className="absolute inset-0 bg-brutal-yellow opacity-20 animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* Balance + wallet */}
        <div className="flex items-center gap-2">
          {account && (
            <div className={`border-2 border-black bg-white px-2 py-1 shadow-brutal hidden sm:block hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all animate-pulse-glow relative overflow-hidden group/balance ${
              balanceChanged ? 'animate-bounce-in' : ''
            }`}>
              <span className="font-mono text-xs font-bold relative z-10">{formatOCT(balance)} OCT</span>
              {balanceChanged && (
                <div className="absolute inset-0 bg-brutal-green opacity-30 animate-pulse" />
              )}
              {/* Hover shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/balance:translate-x-full transition-transform duration-500" />
            </div>
          )}
          <ConnectButton connectText="CONNECT" className="btn-brutal bg-black text-brutal-yellow px-3 py-1 text-sm hover:scale-105 active:scale-95 animate-glow-pulse relative overflow-hidden group/connect" />
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden border-2 border-black bg-white w-8 h-8 flex items-center justify-center hover:bg-brutal-pink transition-all"
          >
            <span className="font-mono font-bold text-sm">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-3 border-black bg-white animate-slide-in-left">
          <nav className="flex flex-col">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "px-4 py-3 font-mono text-sm font-bold border-b-2 border-black transition-all hover:bg-brutal-yellow",
                  pathname === n.href
                    ? "bg-black text-brutal-yellow"
                    : "bg-white text-black"
                )}
              >
                {n.emoji} {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
