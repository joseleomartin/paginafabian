"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminActivityChart } from "@/components/AdminActivityChart";
import type { AdminMetrics, MetricSource } from "@/lib/admin-metrics";
import { formatDate } from "@/lib/format-date";

type Destination = "noticias" | "contenido";

type Props = {
  onUnauthorized: () => void;
  onNavigate: (destination: Destination) => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; metrics: AdminMetrics };

const SOURCE_LABEL: Record<MetricSource, string> = {
  noticia: "Novedad",
  newsletter: "Newsletter",
  podcast: "Podcast",
};

/** Pasados estos días sin publicar, el panel sugiere retomar el ritmo. */
const STALE_AFTER_DAYS = 14;

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function describeAge(daysAgo: number): string {
  if (daysAgo <= 0) return "Hoy";
  if (daysAgo === 1) return "Ayer";
  return `Hace ${daysAgo} días`;
}

function MetricCard({
  label,
  value,
  detail,
  chip,
}: {
  label: string;
  value: string;
  detail: string;
  chip?: { tone: "ok" | "warn"; text: string };
}) {
  return (
    <article className="adm-metric">
      <p className="adm-metric-label">{label}</p>
      <p className="adm-metric-value">{value}</p>
      <p className="adm-metric-detail">{detail}</p>
      {chip ? <span className={`adm-chip adm-chip--${chip.tone}`}>{chip.text}</span> : null}
    </article>
  );
}

function newsletterDetail(metrics: AdminMetrics["newsletter"]): string {
  if (metrics.cadenceDays) {
    return `Una edición cada ${pluralize(metrics.cadenceDays, "día", "días")}`;
  }
  return metrics.latestDate
    ? `Última: ${formatDate(metrics.latestDate)}`
    : "Todavía sin ediciones";
}

function MetricsGrid({ metrics }: { metrics: AdminMetrics }) {
  const { lastPublication } = metrics;
  const isStale = lastPublication ? lastPublication.daysAgo > STALE_AFTER_DAYS : false;

  return (
    <div className="adm-metrics">
      <MetricCard
        label="Novedades"
        value={String(metrics.noticias.published)}
        detail={
          metrics.noticias.drafts > 0
            ? pluralize(metrics.noticias.drafts, "borrador sin publicar", "borradores sin publicar")
            : "Sin borradores pendientes"
        }
      />
      <MetricCard
        label="Newsletter"
        value={String(metrics.newsletter.published)}
        detail={newsletterDetail(metrics.newsletter)}
      />
      <MetricCard
        label="Podcast"
        value={String(metrics.podcast.published)}
        detail={
          metrics.podcast.latestDate
            ? `Último: ${formatDate(metrics.podcast.latestDate)}`
            : "Todavía sin episodios"
        }
      />
      <MetricCard
        label="Última publicación"
        value={lastPublication ? describeAge(lastPublication.daysAgo) : "—"}
        detail={
          lastPublication
            ? `${SOURCE_LABEL[lastPublication.source]} · ${formatDate(lastPublication.date)}`
            : "Todavía no hay publicaciones"
        }
        chip={
          lastPublication
            ? isStale
              ? { tone: "warn", text: "Conviene publicar algo" }
              : { tone: "ok", text: "Al día" }
            : undefined
        }
      />
    </div>
  );
}

function RecentList({ items }: { items: AdminMetrics["recent"] }) {
  if (items.length === 0) {
    return <p className="adm-empty">Cuando publiques algo va a aparecer acá.</p>;
  }

  return (
    <ol className="adm-recent">
      {items.map((item) => (
        <li key={`${item.source}-${item.id}`}>
          <span className={`adm-source adm-source--${item.source}`}>
            {SOURCE_LABEL[item.source]}
          </span>
          <div>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
            <time dateTime={item.date}>{formatDate(item.date)}</time>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Resumen del panel: métricas de contenido, actividad mensual y últimas publicaciones. */
export function AdminDashboard({ onUnauthorized, onNavigate }: Props) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/admin/metrics", { cache: "no-store" });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({
          status: "error",
          message: data.error || "No se pudo cargar el resumen.",
        });
        return;
      }
      setState({ status: "ready", metrics: data.metrics as AdminMetrics });
    } catch {
      setState({ status: "error", message: "No se pudo cargar el resumen." });
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="adm-dashboard">
      <div className="adm-quick">
        <button type="button" className="btn btn-primary" onClick={() => onNavigate("noticias")}>
          Nueva novedad
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onNavigate("contenido")}>
          Newsletter y podcast
        </button>
      </div>

      {state.status === "loading" ? <p className="adm-empty">Cargando resumen…</p> : null}

      {state.status === "error" ? (
        <div className="adm-panel">
          <p className="admin-error">{state.message}</p>
          <button type="button" className="btn btn-secondary" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <>
          <MetricsGrid metrics={state.metrics} />
          <div className="adm-panels">
            <section className="adm-panel" aria-labelledby="adm-activity-title">
              <h2 id="adm-activity-title">Actividad de los últimos meses</h2>
              <p className="adm-panel-note">Publicaciones por mes, según su fecha.</p>
              <AdminActivityChart months={state.metrics.activity} />
            </section>
            <section className="adm-panel" aria-labelledby="adm-recent-title">
              <h2 id="adm-recent-title">Últimas publicaciones</h2>
              <p className="adm-panel-note">Lo más reciente que ve tu audiencia.</p>
              <RecentList items={state.metrics.recent} />
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
