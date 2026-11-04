/**
 * Helpers de URL para Blobs públicos.
 *
 * La lectura de JSON del sitio usa `get(pathname)` + cache en memoria
 * (`blob-json.ts`), no `list()` (Advanced Op). Este módulo sigue disponible
 * para versionar URLs cuando hace falta invalidar CDN a mano.
 *
 * Módulo puro (sin I/O) para poder testearlo con `node --test`.
 */

/** Mínimo permitido por Vercel Blob; acota la espera en cualquier caso. */
export const BLOB_JSON_CACHE_SECONDS = 60;

export function versionedBlobUrl(url: string, uploadedAt: Date): string {
  const version = uploadedAt.getTime();
  if (Number.isNaN(version)) return url;

  const parsed = new URL(url);
  parsed.searchParams.set("v", String(version));
  return parsed.toString();
}
