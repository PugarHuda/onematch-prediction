"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@onelabs/dapp-kit";
import { getFullnodeUrl } from "@onelabs/sui/client";
import { useState } from "react";
import "@onelabs/dapp-kit/dist/index.css";

// Exactly as per OneChain docs
const queryClient = new QueryClient();
const suiClient = { url: getFullnodeUrl("testnet") };

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={{ testnet: suiClient }} defaultNetwork="testnet">
        <WalletProvider>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
