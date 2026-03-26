"use client";

import { useState, useEffect } from "react";

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface State {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches related news via GNews public API (free, no key needed for basic use).
 * Falls back to curated static items if the fetch fails (e.g. CORS in dev).
 *
 * In production you'd proxy this through a Next.js API route to hide the key
 * and avoid CORS. For hackathon demo we use the route handler below.
 */
export function useMarketNews(keywords: string, category: string): State {
  const [state, setState] = useState<State>({ news: [], loading: true, error: null });

  useEffect(() => {
    if (!keywords) return;
    setState({ news: [], loading: true, error: null });

    fetch(`/api/news?q=${encodeURIComponent(keywords)}&category=${category}`)
      .then((r) => r.json())
      .then((data: { articles?: NewsItem[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setState({ news: data.articles ?? [], loading: false, error: null });
      })
      .catch((e: Error) => {
        setState({ news: FALLBACK[category] ?? FALLBACK.crypto, loading: false, error: e.message });
      });
  }, [keywords, category]);

  return state;
}

// ── Fallback static news (shown when API unavailable) ──────────────────────

const FALLBACK: Record<string, NewsItem[]> = {
  crypto: [
    {
      title: "Bitcoin Approaches $100K Resistance as ETF Inflows Surge",
      description:
        "Spot Bitcoin ETFs recorded over $500M in net inflows this week, pushing BTC back toward the key $100k psychological level.",
      url: "https://coindesk.com",
      source: "CoinDesk",
      publishedAt: "2026-03-25",
    },
    {
      title: "Analysts Divided on BTC Path to $120K",
      description:
        "While some on-chain metrics signal accumulation, macro uncertainty and potential Fed rate decisions could cap upside in Q2 2026.",
      url: "https://cointelegraph.com",
      source: "CoinTelegraph",
      publishedAt: "2026-03-24",
    },
    {
      title: "Move-Based Chains See Record DeFi Activity in Q1 2026",
      description:
        "Sui, Aptos, and OneChain collectively processed over $4B in DeFi volume in Q1 2026, challenging EVM dominance.",
      url: "https://theblock.co",
      source: "The Block",
      publishedAt: "2026-03-22",
    },
  ],
  tech: [
    {
      title: "AI Coding Tools Now Handle 40% of Pull Requests at Major Tech Firms",
      description:
        "A new survey shows AI-assisted coding tools are responsible for nearly 40% of merged PRs at Fortune 500 tech companies, raising questions about future hiring.",
      url: "https://techcrunch.com",
      source: "TechCrunch",
      publishedAt: "2026-03-23",
    },
    {
      title: "OneChain Developer Ecosystem Grows 300% YoY",
      description:
        "The number of active Move developers on OneChain tripled year-over-year, driven by hackathons and a growing grant program.",
      url: "https://onelabs.cc",
      source: "OneLabs",
      publishedAt: "2026-03-20",
    },
  ],
  politics: [
    {
      title: "SEC Chair Signals Openness to Crypto Staking in ETF Products",
      description:
        "The new SEC leadership has indicated it may allow staking yields to be included in spot crypto ETF structures, a major shift from previous policy.",
      url: "https://reuters.com",
      source: "Reuters",
      publishedAt: "2026-03-21",
    },
    {
      title: "EU MiCA Framework Fully Enforced — What It Means for DeFi",
      description:
        "With MiCA now fully in effect across the EU, decentralized protocols face new compliance questions around KYC and reporting.",
      url: "https://ft.com",
      source: "Financial Times",
      publishedAt: "2026-03-19",
    },
  ],
  sports: [
    {
      title: "NFT Ticketing Adoption Grows in Major Sports Leagues",
      description:
        "Several NBA and Premier League clubs have announced blockchain-based ticketing pilots, with fan tokens seeing renewed interest.",
      url: "https://espn.com",
      source: "ESPN",
      publishedAt: "2026-03-18",
    },
  ],
  entertainment: [
    {
      title: "Hollywood Studios Explore On-Chain IP Rights Management",
      description:
        "Major studios are piloting Move-based smart contracts to manage royalty distribution and IP licensing for digital content.",
      url: "https://variety.com",
      source: "Variety",
      publishedAt: "2026-03-17",
    },
  ],
};
