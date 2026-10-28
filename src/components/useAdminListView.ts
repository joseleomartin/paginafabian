"use client";

import { useMemo, useState } from "react";
import {
  ADMIN_PAGE_SIZE,
  countByVisibility,
  filterAdminItems,
  takePage,
  type ListAccessors,
  type VisibilityCounts,
  type VisibilityFilter,
} from "@/lib/admin-list";

type Options<T> = {
  accessors: ListAccessors<T>;
  /** Filtro adicional de la pantalla (p. ej. tipo de contenido). */
  scope?: { key: string; includes: (item: T) => boolean };
};

export type AdminListView<T> = {
  query: string;
  setQuery: (query: string) => void;
  visibility: VisibilityFilter;
  setVisibility: (visibility: VisibilityFilter) => void;
  /** Cantidades por visibilidad dentro del alcance actual (antes de buscar). */
  counts: VisibilityCounts;
  shown: T[];
  matchCount: number;
  remaining: number;
  showMore: () => void;
};

/**
 * Estado de un listado del admin: búsqueda, visibilidad y "mostrar más".
 * Al cambiar cualquier filtro la paginación vuelve a la primera página.
 */
export function useAdminListView<T>(
  items: readonly T[],
  { accessors, scope }: Options<T>
): AdminListView<T> {
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [expansion, setExpansion] = useState({ key: "", extraPages: 0 });

  const scopeKey = scope?.key ?? "";
  const filterKey = `${query}|${visibility}|${scopeKey}`;
  const extraPages = expansion.key === filterKey ? expansion.extraPages : 0;

  const inScope = useMemo(
    () => (scope ? items.filter(scope.includes) : items),
    // `scope.includes` cambia solo cuando cambia `scope.key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, scopeKey]
  );
  const counts = useMemo(
    () => countByVisibility(inScope, accessors.isPublished),
    [inScope, accessors.isPublished]
  );
  const matches = useMemo(
    () => filterAdminItems(inScope, { query, visibility }, accessors),
    [inScope, query, visibility, accessors]
  );

  const { shown, remaining } = takePage(
    matches,
    ADMIN_PAGE_SIZE * (1 + extraPages)
  );

  return {
    query,
    setQuery,
    visibility,
    setVisibility,
    counts,
    shown,
    matchCount: matches.length,
    remaining,
    showMore: () =>
      setExpansion({ key: filterKey, extraPages: extraPages + 1 }),
  };
}
