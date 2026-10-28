/**
 * Lógica pura de merge de novedades (sin I/O, sin alias de paths) para poder
 * testearla con `node --test`.
 *
 * Regla de oro: el contenido ya guardado es la fuente de verdad. Un sync
 * solo agrega ediciones/episodios nuevos y completa datos faltantes; nunca
 * pisa fecha, título, link ni imagen ya curados (p. ej. covers locales).
 */
import type { Novedad } from "./novedades";

export const PLACEHOLDER_SUMMARY = "Edición de En Clave PyME en LinkedIn.";

export type MergeResult = {
  items: Novedad[];
  added: number;
  changed: boolean;
};

export function editionNumber(title: string): number | null {
  const match = title.match(/#\s*(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

/**
 * Números de edición ya guardados con portada. El sync no vuelve a consultar
 * LinkedIn por ellas: solo busca ediciones nuevas o con datos incompletos.
 */
export function completeEditionNumbers(
  items: ReadonlyArray<Pick<Novedad, "type" | "title" | "imageUrl">>
): Set<number> {
  const complete = new Set<number>();
  for (const item of items) {
    if (item.type !== "newsletter" || !item.imageUrl) continue;
    const edition = editionNumber(item.title);
    if (edition !== null) complete.add(edition);
  }
  return complete;
}

/** Clave estable para detectar duplicados entre fuentes. */
export function fingerprint(
  item: Pick<Novedad, "id" | "href" | "type" | "title" | "youtubeId">
): string {
  if (item.youtubeId) return `yt:${item.youtubeId}`;

  if (item.type === "newsletter") {
    const edition = editionNumber(item.title);
    if (edition !== null) return `nl:${edition}`;
  }

  try {
    const url = new URL(item.href);
    return `href:${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return `href:${item.href}`;
  }
}

function isMeaningfulSummary(summary: string | undefined): boolean {
  return Boolean(summary && summary.trim() && summary !== PLACEHOLDER_SUMMARY);
}

/** Completa solo lo que falta en `prev` usando `incoming`. */
function fillMissing(prev: Novedad, incoming: Novedad): Novedad {
  return {
    ...prev,
    summary: isMeaningfulSummary(prev.summary)
      ? prev.summary
      : isMeaningfulSummary(incoming.summary)
        ? incoming.summary
        : prev.summary,
    imageUrl: prev.imageUrl || incoming.imageUrl,
    youtubeId: prev.youtubeId || incoming.youtubeId,
    badge: prev.badge || incoming.badge,
  };
}

function sameContent(a: Novedad, b: Novedad): boolean {
  return (
    a.summary === b.summary &&
    a.imageUrl === b.imageUrl &&
    a.youtubeId === b.youtubeId &&
    a.badge === b.badge
  );
}

export function mergeNew(
  existing: Novedad[],
  incoming: Novedad[]
): MergeResult {
  const byKey = new Map<string, Novedad>();
  for (const item of existing) {
    byKey.set(fingerprint(item), item);
  }

  let added = 0;
  let changed = false;

  for (const item of incoming) {
    const key = fingerprint(item);
    const prev = byKey.get(key);

    if (!prev) {
      byKey.set(key, item);
      added += 1;
      changed = true;
      continue;
    }

    const next = fillMissing(prev, item);
    if (!sameContent(prev, next)) {
      byKey.set(key, next);
      changed = true;
    }
  }

  return {
    items: changed ? [...byKey.values()] : existing,
    added,
    changed,
  };
}
