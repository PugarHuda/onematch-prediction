import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for GNews API — avoids CORS issues from the browser.
 * Free tier: 100 req/day, no key needed for basic queries.
 *
 * Docs: https://gnews.io/docs/v4
 * Fallback: if GNEWS_API_KEY env is not set, returns empty so the
 * client falls back to static curated news.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q        = searchParams.get("q") ?? "";
  const apiKey   = process.env.GNEWS_API_KEY ?? "";

  // If no API key configured, return empty — client will use fallback
  if (!apiKey) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const url = new URL("https://gnews.io/api/v4/search");
    url.searchParams.set("q",        q);
    url.searchParams.set("lang",     "en");
    url.searchParams.set("max",      "4");
    url.searchParams.set("sortby",   "publishedAt");
    url.searchParams.set("apikey",   apiKey);

    const res  = await fetch(url.toString(), { next: { revalidate: 300 } }); // cache 5 min
    const data = await res.json() as {
      articles?: Array<{
        title: string;
        description: string;
        url: string;
        source: { name: string };
        publishedAt: string;
      }>;
    };

    const articles = (data.articles ?? []).map((a) => ({
      title:       a.title,
      description: a.description,
      url:         a.url,
      source:      a.source?.name ?? "Unknown",
      publishedAt: a.publishedAt?.slice(0, 10) ?? "",
    }));

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
