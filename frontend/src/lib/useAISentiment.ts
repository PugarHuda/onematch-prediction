"use client";

import { useState, useEffect } from "react";

export interface AISentiment {
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  blendedConfidence: number;
  reasoning: string;
  recommendation: "YES" | "NO" | "HOLD";
}

export function useAISentiment(
  question: string,
  context: string,
  newsHeadlines: string[],
  yesCount: number,
  noCount: number
): { data: AISentiment | null; loading: boolean } {
  const [data, setData] = useState<AISentiment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!question) return;
    setLoading(true);

    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        context,
        newsHeadlines,
        yesCount,
        noCount,
      }),
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [question, context, newsHeadlines.length, yesCount, noCount]);

  return { data, loading };
}
