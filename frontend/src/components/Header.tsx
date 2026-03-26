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

  useEffect(() => {
    if (!account) return;
    suiClient
      .getCoins({ owner: account.address, coinType: "0x2::oct::OCT" })
      .then((r) => setBalance(r.data.reduce((s, c) => s + BigInt(c.balance), 0n)))
      .catch(() => {});
  }, [account]);

  return (
    <header className="border-b-3 border-black bg-brutal-yellow sticky top-0 z-50 shadow-brutal hover:shadow-brutal-lg transition-all">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono font-bold text-xl text-black tracking-tight group-hover:scale-105 transition-transform inline-block">
            ONE<span className="text-brutal-pink">MATCH</span>
          </span>
          <span className="brutal-tag bg-black text-brutal-yellow hidden sm:inline animate-pulse-glow">BETA</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "btn-brutal px-3 py-1 text-sm hover:scale-105 active:scale-95",
                pathname === n.href
                  ? "bg-black text-brutal-yellow shadow-brutal"
                  : "bg-white text-black hover:bg-brutal-pink"
              )}
            >
              {n.emoji} {n.label}
            </Link>
          ))}
        </nav>

        {/* Balance + wallet */}
        <div className="flex items-center gap-2">
          {account && (
            <div className="border-2 border-black bg-white px-2 py-1 shadow-brutal hidden sm:block hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all animate-pulse-glow">
              <span className="font-mono text-xs font-bold">{formatOCT(balance)} OCT</span>
            </div>
          )}
          <ConnectButton connectText="CONNECT" className="btn-brutal bg-black text-brutal-yellow px-3 py-1 text-sm hover:scale-105 active:scale-95 animate-glow-pulse" />
        </div>
      </div>
    </header>
  );
}
