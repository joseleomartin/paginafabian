/**
 * Lógica pura de los listados del admin (búsqueda, visibilidad y paginación).
 * Sin I/O ni alias de paths para poder testearla con `node --test`.
 */

export type VisibilityFilter = "all" | "visible" | "hidden";

export const ADMIN_PAGE_SIZE = 10;

export type VisibilityCounts = Record<VisibilityFilter, number>;

export type ListAccessors<T> = {
  /** Texto sobre el que busca el campo de búsqueda. */
  searchText: (item: T) => string;
  isPublished: (item: T) => boolean;
};

/** Minúsculas y sin acentos, para que "edicion" encuentre "edición". */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesQuery(haystack: string, query: string): boolean {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const normalized = normalizeSearch(haystack);
  return terms.every((term) => normalized.includes(term));
}

function matchesVisibility(published: boolean, visibility: VisibilityFilter) {
  if (visibility === "all") return true;
  return visibility === "visible" ? published : !published;
}

export function filterAdminItems<T>(
  items: readonly T[],
  criteria: { query: string; visibility: VisibilityFilter },
  accessors: ListAccessors<T>
): T[] {
  return items.filter(
    (item) =>
      matchesVisibility(accessors.isPublished(item), criteria.visibility) &&
      matchesQuery(accessors.searchText(item), criteria.query)
  );
}

export function countByVisibility<T>(
  items: readonly T[],
  isPublished: (item: T) => boolean
): VisibilityCounts {
  let visible = 0;
  for (const item of items) {
    if (isPublished(item)) visible += 1;
  }
  return { all: items.length, visible, hidden: items.length - visible };
}

export function takePage<T>(
  items: readonly T[],
  limit: number
): { shown: T[]; remaining: number } {
  const safeLimit = Math.max(0, Math.floor(limit));
  return {
    shown: items.slice(0, safeLimit),
    remaining: Math.max(0, items.length - safeLimit),
  };
}

/** Dominio legible de un enlace; si no es una URL válida devuelve el texto tal cual. */
export function hostLabel(href: string): string {
  if (!URL.canParse(href)) return href;
  return new URL(href).hostname.replace(/^www\./, "");
}
