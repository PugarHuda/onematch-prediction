import { SuiClient, getFullnodeUrl } from "@onelabs/sui/client";
import { Transaction } from "@onelabs/sui/transactions";
import { PACKAGE_ID, RPC_URL, EVENT_REGISTRY_ID, PROFILE_REGISTRY_ID, MATCHMAKER_ADDRESS } from "./constants";

export const suiClient = new SuiClient({ url: RPC_URL });

// ── Event transactions ──────────────────────────────────────────

export function buildCreateEventTx(
  question: string,
  category: string,
  endTimeMs: number
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_event::create_event`,
    arguments: [
      tx.object(EVENT_REGISTRY_ID),
      tx.pure.string(question),
      tx.pure.string(category),
      tx.pure.u64(endTimeMs),
    ],
  });
  return tx;
}

// ── Bet transactions ────────────────────────────────────────────

export function buildPlaceBetTx(
  eventId: string,
  position: boolean,
  stakeAmountMist: bigint
): Transaction {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(stakeAmountMist)]);
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_escrow::place_bet`,
    arguments: [
      tx.object(eventId),
      tx.pure.bool(position),
      coin,
      tx.pure.address(MATCHMAKER_ADDRESS),
    ],
  });
  return tx;
}

// ── Profile transactions ────────────────────────────────────────

export function buildCreateProfileTx(
  username: string,
  avatarUrl: string,
  favoriteCategory: string
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::user_profile::create_profile`,
    arguments: [
      tx.object(PROFILE_REGISTRY_ID),
      tx.pure.string(username),
      tx.pure.string(avatarUrl),
      tx.pure.string(favoriteCategory),
    ],
  });
  return tx;
}

// ── Query helpers ───────────────────────────────────────────────

export async function getOCTBalance(address: string): Promise<bigint> {
  const coins = await suiClient.getCoins({ owner: address, coinType: "0x2::oct::OCT" });
  return coins.data.reduce((sum, c) => sum + BigInt(c.balance), 0n);
}

export async function getEvents() {
  const events = await suiClient.queryEvents({
    query: { MoveModule: { package: PACKAGE_ID, module: "prediction_event" } },
    limit: 50,
    order: "descending",
  });
  return events.data;
}

export function formatOCT(mist: bigint): string {
  const oct = Number(mist) / 1_000_000_000;
  return oct.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function octToMist(oct: number): bigint {
  return BigInt(Math.floor(oct * 1_000_000_000));
}

export function explorerTxUrl(digest: string): string {
  return `https://onescan.cc/testnet/transactionBlocksDetail?digest=${digest}`;
}
