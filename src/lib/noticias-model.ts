/**
 * Modelo de la sección "Novedades" (noticias cargadas desde el admin).
 * Módulo puro (sin I/O ni alias de paths) para poder testearlo con `node --test`.
 */

export const NOTICIA_TITLE_MAX = 140;
export const NOTICIA_BODY_MAX = 2000;

export type Noticia = {
  id: string;
  title: string;
  /** Texto de la novedad. Los párrafos se separan con una línea en blanco. */
  body: string;
  /** Fecha de la novedad, formato YYYY-MM-DD. */
  date: string;
  /** Enlace opcional ("Ver más"). Solo http(s). */
  href?: string;
  imageUrl?: string;
  published: boolean;
};

export type NoticiaInput = {
  title: string;
  body: string;
  date: string;
  href?: string;
  published: boolean;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function isHttpUrl(value: string): boolean {
  if (!URL.canParse(value)) return false;
  const { protocol } = new URL(value);
  return protocol === "http:" || protocol === "https:";
}

/** Más recientes primero; a igual fecha, por título para un orden estable. */
export function sortNoticias(items: readonly Noticia[]): Noticia[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.title.localeCompare(b.title, "es");
  });
}

function isNoticia(value: unknown): value is Noticia {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Noticia>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.body === "string" &&
    typeof item.date === "string" &&
    typeof item.published === "boolean" &&
    (item.href === undefined || typeof item.href === "string") &&
    (item.imageUrl === undefined || typeof item.imageUrl === "string")
  );
}

/** Descarta entradas corruptas en lugar de romper el sitio. */
export function normalizeNoticias(raw: unknown): Noticia[] {
  if (!Array.isArray(raw)) return [];
  return sortNoticias(raw.filter(isNoticia));
}

export function createNoticiaId(): string {
  return `nt-${globalThis.crypto.randomUUID().slice(0, 8)}`;
}

/** Los formularios multipart envían saltos de línea como CRLF: se guardan siempre como LF. */
function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function text(value: unknown): string {
  return typeof value === "string" ? normalizeNewlines(value).trim() : "";
}

export function validateNoticiaInput(
  raw: Record<string, unknown>
): ValidationResult<NoticiaInput> {
  const title = text(raw.title);
  const body = text(raw.body);
  const date = text(raw.date);
  const href = text(raw.href);

  if (!title) return { ok: false, error: "El título es obligatorio." };
  if (title.length > NOTICIA_TITLE_MAX) {
    return {
      ok: false,
      error: `El título no puede superar ${NOTICIA_TITLE_MAX} caracteres.`,
    };
  }
  if (!body) return { ok: false, error: "El texto es obligatorio." };
  if (body.length > NOTICIA_BODY_MAX) {
    return {
      ok: false,
      error: `El texto no puede superar ${NOTICIA_BODY_MAX} caracteres.`,
    };
  }
  if (!isValidIsoDate(date)) {
    return { ok: false, error: "La fecha no es válida." };
  }
  if (href && !isHttpUrl(href)) {
    return {
      ok: false,
      error: "El enlace debe ser una URL válida que empiece con http o https.",
    };
  }

  return {
    ok: true,
    value: {
      title,
      body,
      date,
      href: href || undefined,
      published: raw.published !== false && raw.published !== "false",
    },
  };
}

/** Divide el texto en párrafos (separados por líneas en blanco). */
export function splitParagraphs(body: string): string[] {
  return normalizeNewlines(body)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
