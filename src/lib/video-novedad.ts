/**
 * Conversión de videos de una playlist de YouTube a novedades.
 * Módulo puro (sin I/O ni alias de paths) para poder testearlo con `node --test`.
 */
import type { Novedad } from "./novedades";

export type VideoNovedadType = Extract<Novedad["type"], "podcast" | "tip">;

/**
 * hqdefault: cuadro 4:3 (los videos horizontales).
 * oar2: fotograma con la proporción original (los Shorts verticales, 9:16).
 * maxresdefault: la portada que muestra YouTube (16:9, con la portada vertical del
 * Short centrada); recortada al centro a 9:16 es la portada del Short. No existe
 * para todos los videos, por eso la UI debe tener oar2 como respaldo.
 */
export type ThumbnailVariant = "hqdefault" | "oar2" | "maxresdefault";

export type PlaylistEntry = {
  id: string;
  title: string;
  url: string;
  published: string;
};

export type VideoSource = {
  type: VideoNovedadType;
  badge: string;
  summary: string;
  thumbnail: ThumbnailVariant;
};

export function youtubeThumbnailUrl(
  videoId: string,
  variant: ThumbnailVariant
): string {
  return `https://i.ytimg.com/vi/${videoId}/${variant}.jpg`;
}

export function videoToNovedad(
  video: PlaylistEntry,
  source: VideoSource
): Novedad {
  return {
    id: `yt-${video.id}`,
    type: source.type,
    title: video.title,
    summary: source.summary,
    date: video.published.slice(0, 10),
    href: video.url,
    youtubeId: video.id,
    imageUrl: youtubeThumbnailUrl(video.id, source.thumbnail),
    badge: source.badge,
    published: true,
  };
}

const HASHTAG = /#[\p{L}\p{N}_]+/gu;

/**
 * Título para mostrar: sin hashtags y con espacios normalizados.
 * Si al limpiarlo no queda texto, se devuelve el original.
 */
export function cleanVideoTitle(title: string): string {
  const cleaned = title.replace(HASHTAG, " ").replace(/\s+/g, " ").trim();
  return cleaned || title.trim();
}