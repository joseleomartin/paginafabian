/**
 * Lectura consistente de JSON guardados en Vercel Blob.
 *
 * Los blobs se sirven por CDN. Aunque el archivo se sobrescriba, la URL pública
 * puede devolver la versión anterior hasta que expire el cache, y `cache: "no-store"`
 * de `fetch` solo evita el cache de Next, no el de la CDN. Eso hacía que, tras
 * guardar o borrar, el panel mostrara datos viejos y hasta se pudiera reescribir
 * un contenido ya eliminado.
 *
 * Solución: versionar la URL con la fecha de subida. `list()` consulta la API
 * (no la CDN), así que `uploadedAt` es siempre el de la última escritura y la
 * URL cambia exactamente cuando cambia el contenido.
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
