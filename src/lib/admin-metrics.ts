/**
 * Métricas de contenido del panel de administración.
 * Módulo puro (sin I/O ni alias de paths) para poder testearlo con `node --test`.
 * Todas las fechas son strings YYYY-MM-DD; el "hoy" lo decide quien llama.
 */

export type MetricSource = "noticia" | "newsletter" | "podcast" | "tip";

export type MetricNoticia = {
  id: string;
  title: string;
  date: string;
  published: boolean;
};

export type MetricNovedad = {
  id: string;
  type: "newsletter" | "podcast" | "tip";
  title: string;
  date: string;
  href: string;
  published: boolean;
};

export type ActivityMonth = {
  /** YYYY-MM */
  key: string;
  /** Abreviatura en español (ene, feb…). */
  label: string;
  noticia: number;
  newsletter: number;
  podcast: number;
  tip: number;
  total: number;
};

export type RecentItem = {
  id: string;
  source: MetricSource;
  title: string;
  date: string;
  /** Ruta interna (novedades) o enlace externo (newsletter / podcast). */
  href: string;
};

export type AdminMetrics = {
  noticias: { published: number; drafts: number };
  newsletter: {
    published: number;
    latestDate: string | null;
    /** Promedio de días entre las últimas ediciones; null si hay menos de dos. */
    cadenceDays: number | null;
  };
  podcast: { published: number; latestDate: string | null };
  tips: { published: number; latestDate: string | null };
  lastPublication: { date: string; source: MetricSource; daysAgo: number } | null;
  activity: ActivityMonth[];
  recent: RecentItem[];
};

export type BuildMetricsInput = {
  noticias: readonly MetricNoticia[];
  novedades: readonly MetricNovedad[];
  /** YYYY-MM-DD */
  today: string;
  /** Cantidad de meses del gráfico de actividad (incluye el actual). */
  months?: number;
  recentLimit?: number;
};

const DEFAULT_MONTHS = 6;
const DEFAULT_RECENT_LIMIT = 6;
/** Cuántos intervalos entre ediciones se promedian para la cadencia. */
const CADENCE_GAPS = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTH_LABELS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type DatedEntry = {
  id: string;
  source: MetricSource;
  title: string;
  /** Siempre YYYY-MM-DD válida. */
  date: string;
  href: string;
};

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria indicada. */
export function todayIsoDate(
  timeZone = "America/Argentina/Buenos_Aires",
  now: Date = new Date()
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toIsoDay(value: string): string | null {
  const day = value.slice(0, 10);
  if (!ISO_DATE.test(day)) return null;
  const parsed = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === day ? day : null;
}

/** Días enteros de `from` a `to` (negativo si `to` es anterior). */
export function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.round((end - start) / MS_PER_DAY);
}

function compareDesc(a: DatedEntry, b: DatedEntry): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.title.localeCompare(b.title, "es");
}

function collectPublished(
  input: BuildMetricsInput,
  today: string
): DatedEntry[] {
  const entries: DatedEntry[] = [];

  for (const noticia of input.noticias) {
    const date = toIsoDay(noticia.date);
    if (!noticia.published || !date || date > today) continue;
    entries.push({
      id: noticia.id,
      source: "noticia",
      title: noticia.title,
      date,
      href: `/novedades#${noticia.id}`,
    });
  }

  for (const novedad of input.novedades) {
    const date = toIsoDay(novedad.date);
    if (!novedad.published || !date || date > today) continue;
    entries.push({
      id: novedad.id,
      source: novedad.type,
      title: novedad.title,
      date,
      href: novedad.href,
    });
  }

  return entries.sort(compareDesc);
}

function buildMonthWindow(today: string, months: number): ActivityMonth[] {
  const year = Number.parseInt(today.slice(0, 4), 10);
  const monthIndex = Number.parseInt(today.slice(5, 7), 10) - 1;
  const window: ActivityMonth[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(Date.UTC(year, monthIndex - offset, 1));
    const key = cursor.toISOString().slice(0, 7);
    window.push({
      key,
      label: MONTH_LABELS[cursor.getUTCMonth()],
      noticia: 0,
      newsletter: 0,
      podcast: 0,
      tip: 0,
      total: 0,
    });
  }
  return window;
}

function newsletterCadence(newsletterDates: readonly string[]): number | null {
  const unique = [...new Set(newsletterDates)].sort();
  if (unique.length < 2) return null;

  const recent = unique.slice(-(CADENCE_GAPS + 1));
  let totalDays = 0;
  for (let index = 1; index < recent.length; index += 1) {
    totalDays += daysBetween(recent[index - 1], recent[index]);
  }
  return Math.round(totalDays / (recent.length - 1));
}

function latestDateOf(
  entries: readonly DatedEntry[],
  source: MetricSource
): string | null {
  return entries.find((entry) => entry.source === source)?.date ?? null;
}

/** Calcula las métricas del panel a partir del contenido guardado. */
export function buildAdminMetrics(input: BuildMetricsInput): AdminMetrics {
  const today = toIsoDay(input.today);
  if (!today) {
    throw new RangeError(`"today" debe ser YYYY-MM-DD: ${input.today}`);
  }
  const months = Math.max(1, input.months ?? DEFAULT_MONTHS);
  const recentLimit = Math.max(0, input.recentLimit ?? DEFAULT_RECENT_LIMIT);

  const published = collectPublished(input, today);
  const activity = buildMonthWindow(today, months);
  const monthByKey = new Map(activity.map((month) => [month.key, month]));

  for (const entry of published) {
    const month = monthByKey.get(entry.date.slice(0, 7));
    if (!month) continue;
    month[entry.source] += 1;
    month.total += 1;
  }

  const newsletterDates = published
    .filter((entry) => entry.source === "newsletter")
    .map((entry) => entry.date);
  const last = published[0];

  return {
    noticias: {
      published: input.noticias.filter((item) => item.published).length,
      drafts: input.noticias.filter((item) => !item.published).length,
    },
    newsletter: {
      published: input.novedades.filter(
        (item) => item.published && item.type === "newsletter"
      ).length,
      latestDate: latestDateOf(published, "newsletter"),
      cadenceDays: newsletterCadence(newsletterDates),
    },
    podcast: {
      published: input.novedades.filter(
        (item) => item.published && item.type === "podcast"
      ).length,
      latestDate: latestDateOf(published, "podcast"),
    },
    tips: {
      published: input.novedades.filter(
        (item) => item.published && item.type === "tip"
      ).length,
      latestDate: latestDateOf(published, "tip"),
    },
    lastPublication: last
      ? {
          date: last.date,
          source: last.source,
          daysAgo: daysBetween(last.date, today),
        }
      : null,
    activity,
    recent: published.slice(0, recentLimit).map((entry) => ({
      id: entry.id,
      source: entry.source,
      title: entry.title,
      date: entry.date,
      href: entry.href,
    })),
  };
}
