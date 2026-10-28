/**
 * Metadatos de un artículo de LinkedIn (pulse): fecha de publicación y portada.
 * Módulo puro (sin I/O ni alias de paths) para poder testearlo con `node --test`.
 */

const JSON_LD_DATE = /"datePublished"\s*:\s*"([^"]+)"/;
const META_TAG = /<meta\b[^>]*>/gi;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Lee `datePublished` del JSON-LD de la página y devuelve un ISO 8601,
 * o null si no está, no es una fecha válida o está en el futuro (más de un día,
 * para tolerar diferencias de zona horaria).
 */
export function extractArticlePublishedDate(
  html: string,
  now: Date = new Date()
): string | null {
  const raw = JSON_LD_DATE.exec(html)?.[1];
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.getTime() > now.getTime() + MS_PER_DAY) return null;

  return parsed.toISOString();
}

function readAttribute(tag: string, name: string): string | null {
  const match = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag);
  return match ? match[1] : null;
}

function decodeHtmlAttribute(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/");
}

/**
 * Devuelve la URL https de la portada (`og:image`), sin importar el orden de
 * los atributos del <meta>, o null si no hay una URL válida.
 */
export function extractArticleImageUrl(html: string): string | null {
  for (const tag of html.match(META_TAG) ?? []) {
    if (readAttribute(tag, "property")?.toLowerCase() !== "og:image") continue;

    const content = readAttribute(tag, "content");
    if (!content) continue;

    const url = decodeHtmlAttribute(content.trim());
    return URL.canParse(url) && new URL(url).protocol === "https:" ? url : null;
  }
  return null;
}
