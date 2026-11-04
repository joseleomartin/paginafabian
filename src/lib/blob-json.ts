/**
 * Lectura/escritura de JSON en Vercel Blob sin gastar Advanced Operations
 * (`list`/`put`) en cada request de página.
 *
 * - Lectura: `get(pathname)` (Simple Op / CDN) + cache en memoria con ETag.
 * - Escritura: `put` (Advanced) solo cuando hay que persistir; actualiza el cache.
 */
import { get, put } from "@vercel/blob";
import { BLOB_JSON_CACHE_SECONDS } from "@/lib/blob-url";
import { hasBlobStorage } from "@/lib/uploads";

type CacheEntry = {
  etag: string;
  data: unknown;
  cachedAt: number;
};

/** Tiempo en el que se sirve desde memoria sin tocar Blob (0 ops). */
const MEMORY_TTL_MS = 5 * 60 * 1000;

const memory = new Map<string, CacheEntry>();

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

/**
 * Lee un JSON público por pathname. Devuelve `null` si no hay Blob o no existe.
 * No usa `list()` (Advanced).
 */
export async function readBlobJson(pathname: string): Promise<unknown | null> {
  if (!hasBlobStorage()) return null;

  const cached = memory.get(pathname);
  if (cached && Date.now() - cached.cachedAt < MEMORY_TTL_MS) {
    return cached.data;
  }

  try {
    const result = await get(pathname, {
      access: "public",
      useCache: true,
      ifNoneMatch: cached?.etag,
    });

    if (!result) return null;

    if (result.statusCode === 304 && cached) {
      cached.cachedAt = Date.now();
      return cached.data;
    }

    if (result.statusCode !== 200 || !result.stream) return null;

    const data: unknown = JSON.parse(await streamToText(result.stream));
    memory.set(pathname, {
      etag: result.blob.etag,
      data,
      cachedAt: Date.now(),
    });
    return data;
  } catch (error) {
    console.error(`[blob-json] no se pudo leer ${pathname}`, error);
    return null;
  }
}

/** Persiste JSON y refresca el cache en memoria. Cuenta como Advanced Op (`put`). */
export async function writeBlobJson(
  pathname: string,
  data: unknown
): Promise<void> {
  const body = `${JSON.stringify(data, null, 2)}\n`;
  const result = await put(pathname, body, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: BLOB_JSON_CACHE_SECONDS,
  });

  memory.set(pathname, {
    etag: "etag" in result && typeof result.etag === "string" ? result.etag : "",
    data,
    cachedAt: Date.now(),
  });
}

/** Invalida el cache en memoria (p. ej. tras borrar desde admin). */
export function invalidateBlobJsonCache(pathname?: string): void {
  if (pathname) {
    memory.delete(pathname);
    return;
  }
  memory.clear();
}
