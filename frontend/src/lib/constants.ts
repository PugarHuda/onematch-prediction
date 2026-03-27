export const NETWORK = "testnet";
export const RPC_URL = "https://rpc-testnet.onelabs.cc:443";
export const FAUCET_URL = "https://faucet-testnet.onelabs.cc/v1/gas";
export const EXPLORER_URL = "https://onescan.cc/testnet";

// Deployed on OneChain Testnet (v2 — MIN_STAKE=0.1 OCT)
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID ?? "0xcf72b6d537ebef117b1b743fd06779a9a1e97ffcbbc24e288561799aed1bca39";
export const EVENT_REGISTRY_ID = process.env.NEXT_PUBLIC_EVENT_REGISTRY ?? "0x15f9cc02fc887eb9d6c1b09b903eeca02d7a9cc26e91a43447395d22664ac763";
export const PROFILE_REGISTRY_ID = process.env.NEXT_PUBLIC_PROFILE_REGISTRY ?? "0x4727b0f5b2361716589b0d4f207fc5c50ac40e2b4e33d382406ceb91aaf237b3";
export const TREASURY_CONFIG_ID = process.env.NEXT_PUBLIC_TREASURY_CONFIG ?? "0x79fec5a7bfb4fdba61ae26d13e0b587cd59c7d90fc3959e7dd00049c6e752c40";

// Matchmaking service = admin/deployer wallet
export const MATCHMAKER_ADDRESS = process.env.NEXT_PUBLIC_MATCHMAKER ?? "0xd498ca45353fc376a9c18a33cb491988cce310a2429947d3d54da479f1be7be7";

export const CATEGORIES = ["crypto", "sports", "politics", "tech", "entertainment"] as const;
export type Category = typeof CATEGORIES[number];

export const CATEGORY_EMOJI: Record<string, string> = {
  crypto: "₿",
  sports: "⚽",
  politics: "🏛️",
  tech: "💻",
  entertainment: "🎬",
};

export const CATEGORY_COLOR: Record<string, string> = {
  crypto: "bg-brutal-yellow",
  sports: "bg-brutal-green",
  politics: "bg-brutal-blue",
  tech: "bg-brutal-pink",
  entertainment: "bg-brutal-orange",
};
