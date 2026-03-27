import { NextRequest, NextResponse } from "next/server";

/**
 * AI Sentiment Analysis API
 *
 * Analyzes news headlines + market data to produce:
 * - sentiment: bullish / bearish / neutral
 * - confidence: 0-100
 * - reasoning: short explanation
 *
 * Uses keyword-based NLP (no external AI API needed).
 * In production, this would call OpenAI/Claude for deeper analysis.
 */

const BULLISH_WORDS = [
  "surge", "rally", "soar", "gain", "rise", "bull", "record",
  "inflow", "adoption", "growth", "approve", "support", "upgrade",
  "milestone", "breakthrough", "optimistic", "accumulation", "buy",
  "launch", "partnership", "expand", "positive", "strong", "high",
];

const BEARISH_WORDS = [
  "crash", "drop", "fall", "decline", "bear", "sell", "dump",
  "outflow", "ban", "restrict", "hack", "exploit", "fear",
  "uncertainty", "risk", "warning", "concern", "weak", "low",
  "reject", "delay", "fail", "loss", "negative", "regulation",
];

function analyzeSentiment(texts: string[]) {
  const combined = texts.join(" ").toLowerCase();
  const words = combined.split(/\W+/);

  let bullScore = 0;
  let bearScore = 0;

  for (const word of words) {
    if (BULLISH_WORDS.includes(word)) bullScore++;
    if (BEARISH_WORDS.includes(word)) bearScore++;
  }

  const total = bullScore + bearScore;
  if (total === 0) {
    return { sentiment: "neutral" as const, confidence: 50, bullScore: 0, bearScore: 0 };
  }

  const bullPct = Math.round((bullScore / total) * 100);
  const sentiment = bullPct >= 60 ? "bullish" as const
    : bullPct <= 40 ? "bearish" as const
    : "neutral" as const;

  // Confidence = how strongly one side dominates
  const confidence = Math.min(95, 50 + Math.abs(bullPct - 50));

  return { sentiment, confidence, bullScore, bearScore };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      question?: string;
      context?: string;
      newsHeadlines?: string[];
      yesCount?: number;
      noCount?: number;
    };

    const texts = [
      body.question ?? "",
      body.context ?? "",
      ...(body.newsHeadlines ?? []),
    ].filter(Boolean);

    const { sentiment, confidence, bullScore, bearScore } = analyzeSentiment(texts);

    // Factor in crowd wisdom (yes/no counts)
    const yesCount = body.yesCount ?? 0;
    const noCount = body.noCount ?? 0;
    const totalVotes = yesCount + noCount;
    const crowdYesPct = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 50;

    // Blend AI sentiment with crowd data
    const aiYesPct = sentiment === "bullish" ? 50 + confidence / 2
      : sentiment === "bearish" ? 50 - confidence / 2
      : 50;

    const blendedConfidence = Math.round((aiYesPct * 0.6 + crowdYesPct * 0.4));

    const reasoning = sentiment === "bullish"
      ? `Found ${bullScore} bullish vs ${bearScore} bearish signals in market data. Crowd leans ${crowdYesPct}% YES.`
      : sentiment === "bearish"
      ? `Found ${bearScore} bearish vs ${bullScore} bullish signals. Crowd leans ${crowdYesPct}% YES.`
      : `Mixed signals: ${bullScore} bullish, ${bearScore} bearish. Crowd split ${crowdYesPct}/${100 - crowdYesPct}.`;

    return NextResponse.json({
      sentiment,
      confidence,
      blendedConfidence,
      reasoning,
      recommendation: blendedConfidence >= 60 ? "YES" : blendedConfidence <= 40 ? "NO" : "HOLD",
    });
  } catch {
    return NextResponse.json({
      sentiment: "neutral",
      confidence: 50,
      blendedConfidence: 50,
      reasoning: "Unable to analyze — insufficient data.",
      recommendation: "HOLD",
    });
  }
}
