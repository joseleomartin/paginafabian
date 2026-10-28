import { ADMIN_PAGE_SIZE, type VisibilityFilter } from "@/lib/admin-list";
import type { AdminListView } from "@/components/useAdminListView";

const VISIBILITY_OPTIONS: ReadonlyArray<{
  value: VisibilityFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "visible", label: "Visibles" },
  { value: "hidden", label: "Ocultos" },
];

type ToolbarProps = {
  view: Pick<
    AdminListView<unknown>,
    "query" | "setQuery" | "visibility" | "setVisibility" | "counts"
  >;
  searchLabel: string;
  searchId: string;
};

/** Búsqueda y filtro de visibilidad (con contadores) de un listado del admin. */
export function AdminListToolbar({ view, searchLabel, searchId }: ToolbarProps) {
  return (
    <div className="admin-toolbar">
      <div className="admin-search">
        <label htmlFor={searchId} className="sr-only">
          {searchLabel}
        </label>
        <input
          id={searchId}
          type="search"
          placeholder={searchLabel}
          value={view.query}
          onChange={(event) => view.setQuery(event.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="admin-segment" role="group" aria-label="Visibilidad">
        {VISIBILITY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={
              view.visibility === value
                ? "admin-segment-btn is-active"
                : "admin-segment-btn"
            }
            aria-pressed={view.visibility === value}
            onClick={() => view.setVisibility(value)}
          >
            {label}
            <span className="admin-segment-count">{view.counts[value]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

type FooterProps = {
  shownCount: number;
  matchCount: number;
  remaining: number;
  onShowMore: () => void;
};

/** Resumen "Mostrando X de Y" y botón para ver más resultados. */
export function AdminListFooter({
  shownCount,
  matchCount,
  remaining,
  onShowMore,
}: FooterProps) {
  if (matchCount === 0) return null;
  return (
    <div className="admin-list-footer">
      <p className="form-note">
        Mostrando {shownCount} de {matchCount}
      </p>
      {remaining > 0 ? (
        <button type="button" className="btn btn-secondary" onClick={onShowMore}>
          Mostrar {Math.min(ADMIN_PAGE_SIZE, remaining)} más
        </button>
      ) : null}
    </div>
  );
}
