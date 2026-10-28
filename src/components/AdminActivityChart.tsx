import type { CSSProperties } from "react";
import type { ActivityMonth, MetricSource } from "@/lib/admin-metrics";

type Props = {
  months: readonly ActivityMonth[];
};

const SOURCES: ReadonlyArray<{ id: MetricSource; label: string }> = [
  { id: "noticia", label: "Novedades" },
  { id: "newsletter", label: "Newsletter" },
  { id: "podcast", label: "Podcast" },
  { id: "tip", label: "Tips" },
];

/** La barra más alta ocupa este porcentaje del área, para dejar lugar al número. */
const MAX_BAR_PERCENT = 82;

/** Publicaciones por mes, apiladas por tipo. Las barras son decorativas; los datos van en una tabla accesible. */
export function AdminActivityChart({ months }: Props) {
  const peak = Math.max(1, ...months.map((month) => month.total));
  const hasActivity = months.some((month) => month.total > 0);

  if (!hasActivity) {
    return (
      <p className="adm-empty">
        Todavía no hay publicaciones en los últimos {months.length} meses.
      </p>
    );
  }

  return (
    <div>
      <ul className="adm-legend" aria-hidden="true">
        {SOURCES.map(({ id, label }) => (
          <li key={id}>
            <span className={`adm-seg adm-seg--${id}`} />
            {label}
          </li>
        ))}
      </ul>

      <ol className="adm-chart" aria-hidden="true">
        {months.map((month) => {
          const barStyle = {
            "--bar": `${(month.total / peak) * MAX_BAR_PERCENT}%`,
          } as CSSProperties;

          return (
            <li key={month.key} className="adm-col">
              <div className="adm-plot">
                {month.total > 0 ? (
                  <span className="adm-col-total">{month.total}</span>
                ) : null}
                <div
                  className={month.total > 0 ? "adm-stack" : "adm-stack adm-stack--empty"}
                  style={barStyle}
                >
                  {SOURCES.map(({ id }) =>
                    month[id] > 0 ? (
                      <span
                        key={id}
                        className={`adm-seg adm-seg--${id}`}
                        style={{ flexGrow: month[id] }}
                      />
                    ) : null
                  )}
                </div>
              </div>
              <span className="adm-col-label">{month.label}</span>
            </li>
          );
        })}
      </ol>

      <table className="sr-only">
        <caption>Publicaciones por mes y tipo</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            {SOURCES.map(({ id, label }) => (
              <th key={id} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.key}>
              <th scope="row">{month.key}</th>
              {SOURCES.map(({ id }) => (
                <td key={id}>{month[id]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
