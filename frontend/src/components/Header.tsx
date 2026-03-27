"use client";

import { ConnectButton, useCurrentAccount } from "@onelabs/dapp-kit";
import { useEffect, useState } from "react";
import { suiClient, formatOCT } from "@/lib/onechain";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Layers, Swords, User, Settings, Coins, Menu, X } from "lucide-react";

const NAV = [
  { href: "/feed",    label: "FEED",    Icon: Layers },
  { href: "/duels",   label: "DUELS",   Icon: Swords },
  { href: "/profile", label: "PROFILE", Icon: User },
  { href: "/admin",   label: "ADMIN",   Icon: Settings },
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
      .catch(() => {
        suiClient.getAllCoins({ owner: account.address })
          .then((r) => {
            const oct = r.data.filter(c => c.coinType.includes("::oct::OCT") || c.coinType.includes("::OCT"));
            setBalance(oct.reduce((s, c) => s + BigInt(c.balance), 0n));
          })
          .catch(() => {});
      });
  }, [account]);

  useEffect(() => {
    if (balance !== prevBalance && prevBalance !== 0n) {
      setBalanceChanged(true);
      setTimeout(() => setBalanceChanged(false), 1000);
    }
    setPrevBalance(balance);
  }, [balance, prevBalance]);

  const visibleNav = NAV.filter(n => n.href !== "/admin" || !!account);

  return (
    <header className="border-b-3 border-black bg-brutal-yellow sticky top-0 z-50 shadow-brutal transition-all relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '3s' }} />

      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono font-bold text-xl text-black tracking-tight group-hover:scale-105 transition-transform inline-block relative">
            ONE<span className="text-brutal-pink">MATCH</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brutal-pink group-hover:w-full transition-all duration-300" />
          </span>
          <span className="brutal-tag bg-black text-brutal-yellow hidden sm:inline">
            <span className="flex items-center gap-1">
              <span className="live-dot" />
              BETA
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "btn-brutal px-3 py-1.5 text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 relative overflow-hidden",
                pathname === n.href
                  ? "bg-black text-brutal-yellow shadow-brutal"
                  : "bg-white text-black hover:bg-brutal-pink"
              )}
            >
              <n.Icon size={13} strokeWidth={2.5} />
              <span>{n.label}</span>
              {pathname === n.href && (
                <div className="absolute inset-0 bg-brutal-yellow opacity-20 animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* Balance + wallet */}
        <div className="flex items-center gap-2">
          {account && (
            <div className={clsx(
              "border-2 border-black bg-white px-2 py-1 shadow-brutal hidden sm:flex items-center gap-1 hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all relative overflow-hidden group/balance",
              balanceChanged && "animate-bounce-in"
            )}>
              <Coins size={12} className="text-brutal-orange flex-shrink-0" />
              <span className="font-mono text-xs font-bold">{formatOCT(balance)} OCT</span>
              {balanceChanged && <div className="absolute inset-0 bg-brutal-green opacity-30 animate-pulse" />}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/balance:translate-x-full transition-transform duration-500" />
            </div>
          )}
          <ConnectButton
            connectText="CONNECT"
            className="btn-brutal bg-black text-brutal-yellow px-3 py-1 text-xs hover:scale-105 active:scale-95 relative overflow-hidden"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden border-2 border-black bg-white w-8 h-8 flex items-center justify-center hover:bg-brutal-pink transition-all"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-3 border-black bg-white animate-slide-in-left">
          <nav className="flex flex-col">
            {visibleNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "px-4 py-3 font-mono text-sm font-bold border-b-2 border-black transition-all hover:bg-brutal-yellow flex items-center gap-2",
                  pathname === n.href ? "bg-black text-brutal-yellow" : "bg-white text-black"
                )}
              >
                <n.Icon size={16} />
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
