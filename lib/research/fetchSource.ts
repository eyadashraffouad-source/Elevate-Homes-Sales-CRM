import * as cheerio from "cheerio";

export interface FetchedSource {
  type: "website" | "google_maps" | "linkedin" | "instagram" | "facebook" | "other";
  url: string;
  title: string | null;
  text: string | null;
  fetchError: string | null;
}

/**
 * Fetches a URL and reduces it to readable text for an LLM to read.
 * Note: LinkedIn/Instagram/Facebook generally block unauthenticated scraping —
 * for those we still attempt a fetch (public pages sometimes render enough
 * server-side markup to be useful) but expect frequent fetchError results.
 * In that case the extraction agent should be told to rely on the URL itself
 * and any other available sources instead of hallucinating page content.
 */
export async function fetchSource(
  url: string,
  type: FetchedSource["type"]
): Promise<FetchedSource> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ClientIntelCRM-Research/0.1; +https://example.com/bot)",
      },
      // Research fetches shouldn't hang the job indefinitely
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return {
        type,
        url,
        title: null,
        text: null,
        fetchError: `HTTP ${res.status}`,
      };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $("script, style, noscript, svg").remove();

    const title = $("title").first().text().trim() || null;
    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 15000);

    return { type, url, title, text: text || null, fetchError: null };
  } catch (err) {
    return {
      type,
      url,
      title: null,
      text: null,
      fetchError: err instanceof Error ? err.message : "Unknown fetch error",
    };
  }
}

export async function fetchAllSources(
  urls: { url: string; type: FetchedSource["type"] }[]
): Promise<FetchedSource[]> {
  return Promise.all(urls.map(({ url, type }) => fetchSource(url, type)));
}
