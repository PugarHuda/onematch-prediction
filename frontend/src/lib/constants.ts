export const NETWORK = "testnet";
export const RPC_URL = "https://rpc-testnet.onelabs.cc:443";
export const FAUCET_URL = "https://faucet-testnet.onelabs.cc/v1/gas";
export const EXPLORER_URL = "https://onescan.cc/testnet";

// Replace after deploying contracts
export const PACKAGE_ID = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const EVENT_REGISTRY_ID = "0x0000000000000000000000000000000000000000000000000000000000000001";
export const PROFILE_REGISTRY_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";

// Matchmaking service address (backend wallet)
export const MATCHMAKER_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000003";

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
