import { put, list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { assertWritable } from "@/lib/uploads";

export type NovedadType = "newsletter" | "podcast";

export type Novedad = {
  id: string;
  type: NovedadType;
  title: string;
  summary: string;
  date: string;
  href: string;
  youtubeId?: string;
  imageUrl?: string;
  badge?: string;
  published: boolean;
};

const DATA_PATH = path.join(process.cwd(), "data", "novedades.json");
const BLOB_PATHNAME = "novedades.json";

function editionNumber(title: string): number | null {
  const match = title.match(/#\s*(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

/** Newsletters by edition # (desc); otherwise by date (desc). */
function sortNovedades(items: Novedad[]): Novedad[] {
  return [...items].sort((a, b) => {
    if (a.type === "newsletter" && b.type === "newsletter") {
      const na = editionNumber(a.title);
      const nb = editionNumber(b.title);
      if (na !== null && nb !== null && na !== nb) return nb - na;
    }
    const byDate =
      new Date(b.date).getTime() - new Date(a.date).getTime();
    if (byDate !== 0) return byDate;
    return a.title.localeCompare(b.title, "es");
  });
}

function normalize(items: unknown): Novedad[] {
  if (!Array.isArray(items)) return [];
  return sortNovedades(
    items.filter((item): item is Novedad => {
      if (!item || typeof item !== "object") return false;
      const n = item as Partial<Novedad>;
      return (
        typeof n.id === "string" &&
        (n.type === "newsletter" || n.type === "podcast") &&
        typeof n.title === "string" &&
        typeof n.summary === "string" &&
        typeof n.date === "string" &&
        typeof n.href === "string" &&
        typeof n.published === "boolean"
      );
    })
  );
}

/** Valida y ordena novedades de una fuente externa (JSON del archivo, Blob). */
export const normalizeNovedades = normalize;

async function readFromFile(): Promise<Novedad[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return normalize(JSON.parse(raw));
  } catch (error) {
    const isMissing =
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT";
    if (!isMissing) {
      console.error("[novedades] no se pudo leer data/novedades.json", error);
    }
    return [];
  }
}

async function writeToFile(items: Novedad[]): Promise<void> {
  await fs.writeFile(
    DATA_PATH,
    `${JSON.stringify(sortNovedades(items), null, 2)}\n`,
    "utf8"
  );
}

async function readFromBlob(): Promise<Novedad[] | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    const blob = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!blob) return null;
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return null;
    return normalize(await res.json());
  } catch (error) {
    console.error("[novedades] no se pudo leer desde Vercel Blob", error);
    return null;
  }
}

async function writeToBlob(items: Novedad[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(sortNovedades(items), null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getNovedades(): Promise<Novedad[]> {
  const fromBlob = await readFromBlob();
  if (fromBlob) return fromBlob;
  return readFromFile();
}

export async function getPublishedNovedades(
  type?: NovedadType
): Promise<Novedad[]> {
  const all = await getNovedades();
  return all.filter(
    (n) => n.published && (type === undefined || n.type === type)
  );
}

export async function saveNovedades(items: Novedad[]): Promise<Novedad[]> {
  const normalized = sortNovedades(normalize(items));
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeToBlob(normalized);
  } else {
    assertWritable();
    await writeToFile(normalized);
  }
  return normalized;
}

export function createId(type: NovedadType): string {
  const stamp = Date.now().toString(36);
  const prefix = type === "newsletter" ? "nl" : "pod";
  return `${prefix}-${stamp}`;
}

export type NovedadInput = {
  type: NovedadType;
  title: string;
  summary: string;
  date: string;
  href: string;
  youtubeId?: string;
  published?: boolean;
};

export function validateNovedadInput(body: unknown): NovedadInput | string {
  if (!body || typeof body !== "object") return "Datos inválidos.";
  const data = body as Record<string, unknown>;
  const type = data.type;
  if (type !== "newsletter" && type !== "podcast") {
    return "El tipo debe ser newsletter o podcast.";
  }
  const title = String(data.title ?? "").trim();
  const summary = String(data.summary ?? "").trim();
  const date = String(data.date ?? "").trim();
  const href = String(data.href ?? "").trim();
  const youtubeId = String(data.youtubeId ?? "").trim();

  if (!title) return "El título es obligatorio.";
  if (!summary) return "El resumen es obligatorio.";
  if (!date || Number.isNaN(Date.parse(date))) return "La fecha no es válida.";
  if (!href) return "El enlace es obligatorio.";

  if (!URL.canParse(href)) {
    return "El enlace debe ser una URL válida.";
  }

  return {
    type,
    title,
    summary,
    date,
    href,
    youtubeId: youtubeId || undefined,
    published: data.published !== false,
  };
}
