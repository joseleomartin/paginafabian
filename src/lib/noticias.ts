import { list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BLOB_JSON_CACHE_SECONDS, versionedBlobUrl } from "@/lib/blob-url";
import {
  normalizeNoticias,
  sortNoticias,
  type Noticia,
} from "@/lib/noticias-model";
import { assertWritable, hasBlobStorage, isMissingFile } from "@/lib/uploads";

export type { Noticia } from "@/lib/noticias-model";

const DATA_PATH = path.join(process.cwd(), "data", "noticias.json");
const BLOB_PATHNAME = "noticias.json";

export class NoticiaNotFoundError extends Error {
  constructor() {
    super("Novedad no encontrada.");
    this.name = "NoticiaNotFoundError";
  }
}

async function readFromFile(): Promise<Noticia[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return normalizeNoticias(JSON.parse(raw));
  } catch (error) {
    if (!isMissingFile(error)) {
      console.error("[noticias] no se pudo leer data/noticias.json", error);
    }
    return [];
  }
}

async function readFromBlob(): Promise<Noticia[] | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    const blob = blobs.find((entry) => entry.pathname === BLOB_PATHNAME);
    if (!blob) return null;
    // URL versionada: evita que la CDN devuelva el JSON anterior tras guardar o borrar.
    const response = await fetch(versionedBlobUrl(blob.url, blob.uploadedAt), {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return normalizeNoticias(await response.json());
  } catch (error) {
    console.error("[noticias] no se pudo leer el Blob", error);
    return null;
  }
}

async function writeList(items: Noticia[]): Promise<void> {
  const payload = `${JSON.stringify(sortNoticias(items), null, 2)}\n`;
  if (hasBlobStorage()) {
    await put(BLOB_PATHNAME, payload, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: BLOB_JSON_CACHE_SECONDS,
    });
    return;
  }
  assertWritable();
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, payload, "utf8");
}

export async function getNoticias(): Promise<Noticia[]> {
  if (hasBlobStorage()) {
    const fromBlob = await readFromBlob();
    if (fromBlob) return fromBlob;
  }
  return readFromFile();
}

export async function getPublishedNoticias(): Promise<Noticia[]> {
  const all = await getNoticias();
  return all.filter((item) => item.published);
}

/** Serializa los read-modify-write para que dos pedidos no se pisen. */
let writeQueue: Promise<unknown> = Promise.resolve();

export function updateNoticias<T>(
  mutate: (current: Noticia[]) => { items: Noticia[]; result: T }
): Promise<T> {
  const run = writeQueue.then(async () => {
    const { items, result } = mutate(await getNoticias());
    await writeList(items);
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}
