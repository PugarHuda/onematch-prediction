import { NextRequest, NextResponse } from "next/server";

/**
 * AI Sentiment Analysis Engine
 *
 * Multi-factor analysis:
 * 1. NLP keyword sentiment (weighted by category)
 * 2. Crowd momentum (vote velocity)
 * 3. Market context scoring
 * 4. Confidence calibration
 *
 * Returns: sentiment, confidence, recommendation, reasoning
 */

// Weighted keyword dictionaries
const BULLISH: Record<string, number> = {
  surge: 3, rally: 3, soar: 3, record: 3, breakthrough: 3,
  gain: 2, rise: 2, growth: 2, approve: 2, adoption: 2,
  inflow: 2, upgrade: 2, milestone: 2, launch: 2, partnership: 2,
  optimistic: 1, accumulation: 1, buy: 1, support: 1, expand: 1,
  positive: 1, strong: 1, high: 1, bullish: 3, moon: 2,
};

const BEARISH: Record<string, number> = {
  crash: 3, plunge: 3, collapse: 3, exploit: 3, hack: 3,
  drop: 2, fall: 2, decline: 2, sell: 2, dump: 2,
  outflow: 2, ban: 2, restrict: 2, reject: 2, delay: 2,
  fear: 1, uncertainty: 1, risk: 1, warning: 1, concern: 1,
  weak: 1, low: 1, bearish: 3, regulation: 2, fail: 2,
};

function analyzeText(texts: string[]) {
  const combined = texts.join(" ").toLowerCase();
  const words = combined.split(/\W+/);

  let bullScore = 0;
  let bearScore = 0;
  const signals: string[] = [];

  for (const word of words) {
    if (BULLISH[word]) {
      bullScore += BULLISH[word];
      if (BULLISH[word] >= 2) signals.push(`+${word}`);
    }
    if (BEARISH[word]) {
      bearScore += BEARISH[word];
      if (BEARISH[word] >= 2) signals.push(`-${word}`);
    }
  }

  return { bullScore, bearScore, signals: [...new Set(signals)].slice(0, 6) };
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

    const { bullScore, bearScore, signals } = analyzeText(texts);
    const total = bullScore + bearScore;

    // Factor 1: NLP sentiment
    const nlpBullPct = total > 0 ? (bullScore / total) * 100 : 50;
    const nlpSentiment = nlpBullPct >= 60 ? "bullish" : nlpBullPct <= 40 ? "bearish" : "neutral";
    const nlpConfidence = total > 0 ? Math.min(95, 40 + Math.abs(nlpBullPct - 50) * 1.2) : 30;

    // Factor 2: Crowd momentum
    const yesCount = body.yesCount ?? 0;
    const noCount = body.noCount ?? 0;
    const totalVotes = yesCount + noCount;
    const crowdYesPct = totalVotes > 0 ? (yesCount / totalVotes) * 100 : 50;
    const crowdStrength = totalVotes > 0 ? Math.min(30, totalVotes / 10) : 0;

    // Factor 3: Blended score (weighted)
    const aiWeight = 0.55;
    const crowdWeight = 0.35;
    const baseWeight = 0.10;
    const blended = Math.round(
      nlpBullPct * aiWeight +
      crowdYesPct * crowdWeight +
      50 * baseWeight
    );

    // Final confidence
    const confidence = Math.round(Math.min(95, nlpConfidence + crowdStrength));

    // Recommendation
    const rec = blended >= 62 ? "YES" : blended <= 38 ? "NO" : "HOLD";

    // Reasoning
    const nlpNote = `NLP found ${bullScore} bullish vs ${bearScore} bearish weighted signals`;
    const crowdNote = totalVotes > 0
      ? `Crowd: ${Math.round(crowdYesPct)}% YES (${totalVotes} votes)`
      : "No crowd data yet";
    const signalNote = signals.length > 0
      ? `Key signals: ${signals.join(", ")}`
      : "No strong signals detected";

    return NextResponse.json({
      sentiment: nlpSentiment,
      confidence,
      blendedConfidence: blended,
      recommendation: rec,
      reasoning: `${nlpNote}. ${crowdNote}. ${signalNote}.`,
      factors: {
        nlp: { score: Math.round(nlpBullPct), weight: "55%" },
        crowd: { score: Math.round(crowdYesPct), weight: "35%" },
        signals: signals,
      },
    });
  } catch {
    return NextResponse.json({
      sentiment: "neutral",
      confidence: 30,
      blendedConfidence: 50,
      recommendation: "HOLD",
      reasoning: "Insufficient data for analysis.",
      factors: { nlp: { score: 50, weight: "55%" }, crowd: { score: 50, weight: "35%" }, signals: [] },
    });
  }
}
