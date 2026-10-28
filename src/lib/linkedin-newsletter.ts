import {
  extractArticleImageUrl,
  extractArticlePublishedDate,
} from "@/lib/linkedin-article";

export type NewsletterEdition = {
  id: string;
  title: string;
  url: string;
  published: string;
  summary: string;
  imageUrl?: string;
};

const DEFAULT_FEED =
  "https://linkedinrss.cns.me/en-clave-pyme-7462332384512782336";

const NEWSLETTER_PAGE =
  "https://www.linkedin.com/newsletters/en-clave-pyme-7462332384512782336/";

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) =>
      String.fromCharCode(Number.parseInt(n, 10))
    );
}

function stripHtml(value: string) {
  return decodeXml(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function itemTag(block: string, tag: string) {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i")
  );
  return match?.[1]?.trim() ?? "";
}

function toIsoDate(pubDate: string) {
  const parsed = new Date(pubDate);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

function slugId(url: string, index: number) {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, "");
    const last = path.split("/").filter(Boolean).pop();
    if (last) return `li-${decodeURIComponent(last).slice(0, 80)}`;
  } catch {
    /* ignore */
  }
  return `li-edition-${index}`;
}

function editionNumber(title: string) {
  const match = title.match(/#\s*(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function normalizePulseKey(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    const pulse = path.match(/\/pulse\/([^/]+)/);
    if (!pulse) return path;
    // LinkedIn truncates/varies slugs; keep leading number when present
    const num = pulse[1].match(/^(\d+)/);
    return num ? `n:${num[1]}` : pulse[1].slice(0, 48);
  } catch {
    return url;
  }
}

function sortEditions(editions: NewsletterEdition[]) {
  return [...editions].sort((a, b) => {
    const na = editionNumber(a.title);
    const nb = editionNumber(b.title);
    if (na !== null && nb !== null && na !== nb) return nb - na;
    return new Date(b.published).getTime() - new Date(a.published).getTime();
  });
}

async function fetchFromRss(): Promise<NewsletterEdition[]> {
  const feedUrl =
    process.env.LINKEDIN_NEWSLETTER_RSS_URL?.trim() || DEFAULT_FEED;

  const response = await fetch(feedUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "FabianCanoniSite/1.0",
    },
  });

  if (!response.ok) {
    console.error(`[linkedin-newsletter] feed ${response.status}`);
    return [];
  }

  const xml = await response.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const editions: NewsletterEdition[] = [];

  for (const [index, item] of items.entries()) {
    const title = decodeXml(stripHtml(itemTag(item, "title")));
    const link = decodeXml(itemTag(item, "link") || itemTag(item, "guid"));
    if (!title || !link) continue;

    const description = stripHtml(itemTag(item, "description"));
    const pubDate = itemTag(item, "pubDate");
    const enclosureMatch = item.match(
      /<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i
    );

    editions.push({
      id: slugId(link, index),
      title,
      url: link,
      published: toIsoDate(pubDate),
      summary:
        description.slice(0, 220) || "Edición de En Clave PyME en LinkedIn.",
      imageUrl: enclosureMatch?.[1]
        ? decodeXml(enclosureMatch[1])
        : undefined,
    });
  }

  return editions;
}

const ARTICLE_FETCH_TIMEOUT_MS = 8000;

type ArticleMeta = { published: string | null; imageUrl: string | null };

/** Fecha real y portada de una edición leyendo su página; null en lo que LinkedIn no entregue. */
async function fetchArticleMeta(url: string): Promise<ArticleMeta> {
  const unavailable: ArticleMeta = { published: null, imageUrl: null };
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(ARTICLE_FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FabianCanoniSite/1.0; +https://fabiancanoni.com)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-AR,es;q=0.9",
      },
    });
    if (!response.ok) return unavailable;

    const html = await response.text();
    return {
      published: extractArticlePublishedDate(html),
      imageUrl: extractArticleImageUrl(html),
    };
  } catch (error) {
    console.warn(`[linkedin-newsletter] no se pudo leer ${url}`, error);
    return unavailable;
  }
}

/** Completa con lo que LinkedIn muestra en la landing pública (a veces más que el RSS). */
async function fetchFromNewsletterPage(): Promise<NewsletterEdition[]> {
  try {
    const response = await fetch(NEWSLETTER_PAGE, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FabianCanoniSite/1.0; +https://fabiancanoni.com)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-AR,es;q=0.9",
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const candidates: Array<{ title: string; url: string }> = [];
    const seen = new Set<string>();

    // Títulos tipo "#30. ..." cerca de links /pulse/
    const titleMatches = [
      ...html.matchAll(/#(2[0-9]|[3-9]\d|\d{1,2})\.\s+([^<"\n]{8,160})/g),
    ];

    const pulseLinks = [
      ...html.matchAll(
        /https?:\/\/(?:[a-z]+\.)?linkedin\.com\/pulse\/([a-z0-9%\-]+)/gi
      ),
    ];

    for (const match of titleMatches) {
      const num = match[1];
      const rest = match[2].replace(/\s+/g, " ").trim();
      const title = `#${num}. ${rest}`.replace(/\s+$/g, "");
      const key = `n:${num}`;
      if (seen.has(key)) continue;

      const linkMatch = pulseLinks.find((link) =>
        decodeURIComponent(link[1]).startsWith(`${num}-`)
      );
      if (!linkMatch) continue;

      const url = linkMatch[0].split("&")[0].replace(/\\u002[fF]/g, "/");
      seen.add(key);
      candidates.push({ title, url });
    }

    // La landing no trae fechas ni portadas: se leen de cada edición. Si no hay
    // fecha, se omite (se reintenta en el próximo sync) en vez de inventar "hoy".
    const resolved = await Promise.all(
      candidates.map(async (candidate) => ({
        ...candidate,
        ...(await fetchArticleMeta(candidate.url)),
      }))
    );

    return resolved.flatMap(({ published, imageUrl, title, url }, index) =>
      published
        ? [
            {
              id: slugId(url, index),
              title,
              url,
              published,
              summary: "Edición de En Clave PyME en LinkedIn.",
              ...(imageUrl ? { imageUrl } : {}),
            },
          ]
        : []
    );
  } catch (error) {
    console.error("[linkedin-newsletter] page scrape failed", error);
    return [];
  }
}

function mergeEditions(
  primary: NewsletterEdition[],
  extra: NewsletterEdition[]
) {
  const byKey = new Map<string, NewsletterEdition>();

  for (const edition of [...primary, ...extra]) {
    const num = editionNumber(edition.title);
    const key = num !== null ? `n:${num}` : normalizePulseKey(edition.url);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, edition);
      continue;
    }
    // Prefer RSS entry (mejor summary / imagen / fecha)
    byKey.set(key, {
      ...edition,
      ...existing,
      imageUrl: existing.imageUrl || edition.imageUrl,
      summary:
        existing.summary !== "Edición de En Clave PyME en LinkedIn."
          ? existing.summary
          : edition.summary,
      published: existing.published || edition.published,
    });
  }

  return sortEditions([...byKey.values()]);
}

/**
 * Todas las ediciones que LinkedIn expone en público.
 * Nota: LinkedIn no publica el archivo completo (#1–#N) sin login/API;
 * el feed + landing suelen traer solo las más recientes.
 */
export async function getNewsletterEditions(
  limit = 100
): Promise<NewsletterEdition[]> {
  try {
    const [rss, page] = await Promise.all([
      fetchFromRss(),
      fetchFromNewsletterPage(),
    ]);
    const merged = mergeEditions(rss, page);
    return merged.slice(0, Math.max(limit, 1));
  } catch (error) {
    console.error("[linkedin-newsletter] fetch failed", error);
    return [];
  }
}
