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

/** Fetch all PredictionEvent objects — registry scan primary, known IDs as fallback */
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
  // Known on-chain event IDs (deployed on testnet) — always included
  const KNOWN_EVENT_IDS = [
    "0xa601d9cf67b276ce9a4602adf10acdcef637e991f29ab8502af8005bf2a9be99",
    "0xec6bd58afa70bb1a9a66d5b5d2fef9c7da7ad4ccb7fa96a69c2dd63acda7d7f7",
    "0xf943ca570297d7d91120394c0001d2f415b56dd70ceee1c25db3373f924f5fbb",
    "0x3bbb2b4de289bd462c1a4393ec581c61d2763ef161d22ae19952b30d39615671",
    "0x2bb75d7ebac435d8f5e1900772ee5aeabde88bf9adface53cacf1a9c62bf50ad",
  ];

  try {
    // PRIMARY: Scan registry transactions for ALL events (including new ones)
    const discoveredIds = new Set<string>(KNOWN_EVENT_IDS);
    try {
      // Add timeout to prevent hanging on Vercel
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const txs = await suiClient.queryTransactionBlocks({
        filter: { InputObject: EVENT_REGISTRY_ID },
        limit: 50,
        order: "descending",
        options: { showObjectChanges: true },
      });
      clearTimeout(timeout);
      for (const tx of txs.data) {
        for (const change of tx.objectChanges ?? []) {
          if (
            "objectType" in change &&
            typeof change.objectType === "string" &&
            change.objectType.includes("::prediction_event::PredictionEvent") &&
            "objectId" in change
          ) {
            discoveredIds.add(change.objectId);
          }
        }
      }
    } catch {
      // Registry scan failed — use known IDs only
    }

    const objects = await suiClient.multiGetObjects({
      ids: Array.from(discoveredIds),
      options: { showContent: true },
    });

    const parseStr = (v: unknown): string => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object" && "bytes" in v) return String((v as { bytes: string }).bytes);
      return "";
    };

    const results = objects
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
      .filter((e) => e.status === 0 && e.endTime > Date.now());

    // Always return at least the known IDs count
    return results.length > 0 ? results : [];
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
