import { SuiClient } from "@onelabs/sui/client";
import { Transaction } from "@onelabs/sui/transactions";
import {
  PACKAGE_ID,
  RPC_URL,
  EVENT_REGISTRY_ID,
  PROFILE_REGISTRY_ID,
  MATCHMAKER_ADDRESS,
} from "./constants";

export const suiClient = new SuiClient({ url: RPC_URL });

// Shared system objects
const CLOCK_ID = "0x6";

// ── Event transactions ──────────────────────────────────────────────────────

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

export function buildSettleEventTx(
  adminCapId: string,
  eventId: string,
  result: boolean
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_event::settle`,
    arguments: [
      tx.object(adminCapId),
      tx.object(eventId),
      tx.object(CLOCK_ID),
      tx.pure.bool(result),
    ],
  });
  return tx;
}

export function buildCancelEventTx(
  adminCapId: string,
  eventId: string
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_event::cancel_event`,
    arguments: [tx.object(adminCapId), tx.object(eventId)],
  });
  return tx;
}

// ── Bet transactions ────────────────────────────────────────────────────────

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
      tx.object(CLOCK_ID),
    ],
  });
  return tx;
}

export function buildCancelBetTx(betId: string): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_escrow::cancel_bet`,
    arguments: [tx.object(betId), tx.object(CLOCK_ID)],
  });
  return tx;
}

export function buildSettleDuelTx(
  duelId: string,
  eventId: string,
  treasuryConfigId: string
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_escrow::settle_duel`,
    arguments: [
      tx.object(duelId),
      tx.object(eventId),
      tx.object(treasuryConfigId),
    ],
  });
  return tx;
}

// ── Profile transactions ────────────────────────────────────────────────────

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

// ── Query helpers ───────────────────────────────────────────────────────────

export async function getOCTBalance(address: string): Promise<bigint> {
  try {
    const coins = await suiClient.getCoins({
      owner: address,
      coinType: "0x2::oct::OCT",
    });
    return coins.data.reduce((sum, c) => sum + BigInt(c.balance), 0n);
  } catch {
    // fallback: scan all coins for OCT
    const all = await suiClient.getAllCoins({ owner: address });
    const oct = all.data.filter(
      (c) => c.coinType.includes("::oct::OCT") || c.coinType.includes("::OCT")
    );
    return oct.reduce((sum, c) => sum + BigInt(c.balance), 0n);
  }
}

/** Fetch on-chain events emitted by the prediction_event module */
export async function getOnChainEvents() {
  const events = await suiClient.queryEvents({
    query: {
      MoveModule: { package: PACKAGE_ID, module: "prediction_event" },
    },
    limit: 50,
    order: "descending",
  });
  return events.data;
}

/** Fetch all PredictionEvent objects from EventRegistry */
export async function fetchAllEvents(): Promise<Array<{
  id: string;
  question: string;
  category: string;
  endTime: number;
  creator: string;
  status: number;
  yesCount: number;
  noCount: number;
}>> {
  try {
    // Get EventRegistry to find event_count
    const registry = await suiClient.getObject({
      id: EVENT_REGISTRY_ID,
      options: { showContent: true },
    });
    const regFields = (registry.data?.content as { fields: Record<string, unknown> } | undefined)?.fields;
    const eventCount = Number(regFields?.event_count ?? 0);
    if (eventCount === 0) return [];

    // Query all objects of type PredictionEvent owned by the package
    // Use queryTransactionBlocks to find created PredictionEvent objects
    const txs = await suiClient.queryTransactionBlocks({
      filter: { InputObject: EVENT_REGISTRY_ID },
      limit: 50,
      order: "descending",
      options: { showObjectChanges: true },
    });

    // Collect PredictionEvent object IDs from tx results
    const eventIds = new Set<string>();
    for (const tx of txs.data) {
      for (const change of tx.objectChanges ?? []) {
        if (
          "objectType" in change &&
          typeof change.objectType === "string" &&
          change.objectType.includes("::prediction_event::PredictionEvent") &&
          "objectId" in change
        ) {
          eventIds.add(change.objectId);
        }
      }
    }

    if (eventIds.size === 0) return [];

    const objects = await suiClient.multiGetObjects({
      ids: Array.from(eventIds),
      options: { showContent: true },
    });

    const parseStr = (v: unknown): string => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object" && "bytes" in v) return String((v as { bytes: string }).bytes);
      return "";
    };

    return objects
      .filter((o) => o.data?.content?.dataType === "moveObject")
      .map((o) => {
        const f = (o.data!.content as { fields: Record<string, unknown> }).fields;
        return {
          id: o.data!.objectId,
          question: parseStr(f.question),
          category: parseStr(f.category),
          endTime: Number(f.end_time ?? 0),
          creator: String(f.creator ?? ""),
          status: Number(f.status ?? 0),
          yesCount: Number(f.yes_count ?? 0),
          noCount: Number(f.no_count ?? 0),
        };
      })
      .filter((e) => e.status === 0); // Only open events
  } catch {
    return [];
  }
}

/** Fetch duels (MatchedDuel events) for a given player address */
export async function fetchDuelsForPlayer(address: string) {
  const [matched, settled] = await Promise.all([
    suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::prediction_escrow::DuelMatched` },
      limit: 50,
      order: "descending",
    }),
    suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::prediction_escrow::DuelSettled` },
      limit: 50,
      order: "descending",
    }),
  ]);

  // Filter events where the player is participant
  const playerMatched = matched.data.filter((e) => {
    const p = e.parsedJson as { player_yes?: string; player_no?: string } | undefined;
    return p?.player_yes === address || p?.player_no === address;
  });
  const playerSettled = settled.data.filter((e) => {
    const p = e.parsedJson as { winner?: string } | undefined;
    return p?.winner === address;
  });

  return { matched: playerMatched, settled: playerSettled };
}

/** Fetch UserProfile object for a given address */
export async function fetchUserProfile(address: string) {
  const objects = await suiClient.getOwnedObjects({
    owner: address,
    filter: {
      StructType: `${PACKAGE_ID}::user_profile::UserProfile`,
    },
    options: { showContent: true },
  });
  return objects.data[0] ?? null;
}

// ── Formatting ──────────────────────────────────────────────────────────────

export function formatOCT(mist: bigint): string {
  const oct = Number(mist) / 1_000_000_000;
  return oct.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function octToMist(oct: number): bigint {
  return BigInt(Math.floor(oct * 1_000_000_000));
}

export function mistToOct(mist: bigint): number {
  return Number(mist) / 1_000_000_000;
}

export function explorerTxUrl(digest: string): string {
  return `https://onescan.cc/testnet/transactionBlocksDetail?digest=${digest}`;
}

export function explorerObjectUrl(objectId: string): string {
  return `https://onescan.cc/testnet/object/${objectId}`;
}
