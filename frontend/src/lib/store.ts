import { create } from "zustand";
import type { UserProfile, PredictionEvent } from "./types";

interface BetRecord {
  eventId: string;
  question: string;
  position: boolean;
  stakeOCT: number;
  timestamp: number;
  txDigest: string;
}

interface AppStore {
  // Profile
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;

  // Current stake amount
  stakeAmount: number;
  setStakeAmount: (n: number) => void;

  // Match animation
  matchData: { playerYes: string; playerNo: string; eventQuestion: string } | null;
  showMatch: (data: AppStore["matchData"]) => void;
  hideMatch: () => void;

  // Swipe history
  swipedIds: Set<string>;
  addSwiped: (id: string) => void;

  // Bet history (syncs to duels page)
  bets: BetRecord[];
  addBet: (bet: BetRecord) => void;
  
  // Toast notifications
  toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  profile: null,
  setProfile: (p) => set({ profile: p }),

  stakeAmount: 0.1,
  setStakeAmount: (n) => set({ stakeAmount: n }),

  matchData: null,
  showMatch: (data) => set({ matchData: data }),
  hideMatch: () => set({ matchData: null }),

  swipedIds: new Set(),
  addSwiped: (id) =>
    set((s) => ({ swipedIds: new Set([...s.swipedIds, id]) })),

  bets: [],
  addBet: (bet) =>
    set((s) => ({ bets: [...s.bets, bet] })),
  
  toasts: [],
  addToast: (message, type = "info") =>
    set((s) => ({
      toasts: [...s.toasts, { id: Date.now().toString(), message, type }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
