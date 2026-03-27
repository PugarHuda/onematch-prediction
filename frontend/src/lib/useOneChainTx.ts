"use client";

/**
 * useOneChainTx — pakai useSignAndExecuteTransaction langsung
 * sesuai docs resmi OneChain dapp-kit
 */

import { useSignAndExecuteTransaction } from "@onelabs/dapp-kit";

export function useOneChainTx() {
  const { mutate, isPending, isError, error, isSuccess, data, reset } =
    useSignAndExecuteTransaction();

  return { mutate, isPending, isError, error, isSuccess, data, reset };
}
