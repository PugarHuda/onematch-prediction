"use client";

/**
 * useOneChainTx — Sign via OneWallet, execute via our RPC.
 */

import { useSignTransaction, useSuiClient, useCurrentWallet } from "@onelabs/dapp-kit";
import { useCallback, useState } from "react";
import type { Transaction } from "@onelabs/sui/transactions";

type TxResult = { digest: string; [key: string]: unknown };
type Callbacks = {
  onSuccess?: (data: TxResult) => void;
  onError?: (error: Error) => void;
};

export function useOneChainTx() {
  const client = useSuiClient();
  const { currentWallet, connectionStatus } = useCurrentWallet();
  const { mutateAsync: signTx } = useSignTransaction();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    (args: { transaction: Transaction }, cb?: Callbacks) => {
      // Guard: wallet must be connected
      if (connectionStatus !== "connected" || !currentWallet) {
        cb?.onError?.(new Error("Wallet not connected. Please connect OneWallet first."));
        return;
      }

      setIsPending(true);

      signTx({ transaction: args.transaction })
        .then(async ({ bytes, signature }) => {
          const r = await client.executeTransactionBlock({
            transactionBlock: bytes,
            signature,
            options: { showEffects: true, showObjectChanges: true },
          });
          setIsPending(false);
          cb?.onSuccess?.({ ...r });
        })
        .catch((err: Error) => {
          setIsPending(false);
          console.error("[useOneChainTx] Error:", err.message);
          cb?.onError?.(err);
        });
    },
    [signTx, client, currentWallet, connectionStatus]
  );

  return { mutate, isPending };
}
