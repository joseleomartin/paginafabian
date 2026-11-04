import { promises as fs } from "node:fs";
import path from "node:path";
import { readBlobJson, writeBlobJson } from "@/lib/blob-json";
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
    super("Nota no encontrada.");
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
  const raw = await readBlobJson(BLOB_PATHNAME);
  if (raw === null) return null;
  return normalizeNoticias(raw);
}

async function writeList(items: Noticia[]): Promise<void> {
  const sorted = sortNoticias(items);
  if (hasBlobStorage()) {
    await writeBlobJson(BLOB_PATHNAME, sorted);
    return;
  }
  assertWritable();
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(
    DATA_PATH,
    `${JSON.stringify(sorted, null, 2)}\n`,
    "utf8"
  );
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
