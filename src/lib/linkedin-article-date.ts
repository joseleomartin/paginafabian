/**
 * Fecha de publicación de un artículo de LinkedIn (pulse).
 * Módulo puro (sin I/O ni alias de paths) para poder testearlo con `node --test`.
 */

const JSON_LD_DATE = /"datePublished"\s*:\s*"([^"]+)"/;
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
