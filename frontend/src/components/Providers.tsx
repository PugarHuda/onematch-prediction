"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@onelabs/dapp-kit";
import { getFullnodeUrl } from "@onelabs/sui/client";
import { useState } from "react";
import "@onelabs/dapp-kit/dist/index.css";

const networks = {
  testnet: { url: "https://rpc-testnet.onelabs.cc:443" },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
