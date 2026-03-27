"use client";

/**
 * useOneChainTx — Sign via OneWallet, execute via our RPC.
 * No demo fallback — real transactions only.
 */

import { useSignTransaction, useSuiClient } from "@onelabs/dapp-kit";
import { useCallback, useState } from "react";
import type { Transaction } from "@onelabs/sui/transactions";

type TxResult = { digest: string; [key: string]: unknown };
type Callbacks = {
  onSuccess?: (data: TxResult) => void;
  onError?: (error: Error) => void;
};

export function useOneChainTx() {
  const client = useSuiClient();
  const { mutateAsync: signTx } = useSignTransaction();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    (args: { transaction: Transaction }, cb?: Callbacks) => {
      setIsPending(true);

      signTx({ transaction: args.transaction })
        .then(async ({ bytes, signature }) => {
          const r = await client.executeTransactionBlock({
            transactionBlock: bytes,
            signature,
            options: { showEffects: true },
          });
          setIsPending(false);
          cb?.onSuccess?.({ ...r });
        })
        .catch((err: Error) => {
          setIsPending(false);
          cb?.onError?.(err);
        });
    },
    [signTx, client]
  );

  return { mutate, isPending };
}
