import { podcast } from "@/lib/content";
import { getNewsletterEditions } from "@/lib/linkedin-newsletter";
import { mergeNew } from "@/lib/novedades-merge";
import {
  getNovedades,
  saveNovedades,
  type Novedad,
} from "@/lib/novedades";
import { getPlaylistVideos } from "@/lib/youtube-playlist";

export type SyncResult = {
  newsletterAdded: number;
  podcastAdded: number;
  total: number;
};

export type SyncScope = "newsletter" | "podcast";

/** Mínimo entre sincronizaciones automáticas por instancia (evita golpear las fuentes en cada visita). */
const MIN_SYNC_INTERVAL_MS = 10 * 60 * 1000;

function editionToNovedad(edition: {
  id: string;
  title: string;
  url: string;
  published: string;
  summary: string;
  imageUrl?: string;
}): Novedad {
  return {
    id: edition.id,
    type: "newsletter",
    title: edition.title,
    summary: edition.summary,
    date: edition.published.slice(0, 10),
    href: edition.url,
    imageUrl: edition.imageUrl,
    badge: "En Clave PyME",
    published: true,
  };
}

function videoToNovedad(video: {
  id: string;
  title: string;
  url: string;
  published: string;
}): Novedad {
  return {
    id: `yt-${video.id}`,
    type: "podcast",
    title: video.title,
    summary: podcast.tagline,
    date: video.published.slice(0, 10),
    href: video.url,
    youtubeId: video.id,
    imageUrl: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    badge: "Off the Record",
    published: true,
  };
}

/**
 * Serializa todas las escrituras: sync de newsletter y podcast leen→mergean→guardan
 * sobre el mismo store y, en paralelo, una pisaría a la otra.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

function runExclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

async function persistIfChanged(
  merged: ReturnType<typeof mergeNew>
): Promise<number> {
  if (merged.changed) {
    await saveNovedades(merged.items);
  }
  return merged.added;
}

/** Trae ediciones de LinkedIn y guarda solo lo nuevo. */
export function syncNewsletterNovedades(): Promise<number> {
  return runExclusive(async () => {
    const existing = await getNovedades();
    const incoming = (await getNewsletterEditions()).map(editionToNovedad);
    if (incoming.length === 0) return 0;
    return persistIfChanged(mergeNew(existing, incoming));
  });
}

/** Trae episodios de YouTube y guarda solo lo nuevo. */
export function syncPodcastNovedades(): Promise<number> {
  return runExclusive(async () => {
    const existing = await getNovedades();
    const incoming = (await getPlaylistVideos(podcast.playlistId, 25)).map(
      videoToNovedad
    );
    if (incoming.length === 0) return 0;
    return persistIfChanged(mergeNew(existing, incoming));
  });
}

/** Sync completo (cron / endpoint protegido). Lanza si falla. */
export function syncAllNovedades(): Promise<SyncResult> {
  return runExclusive(async () => {
    const existing = await getNovedades();
    const [editions, videos] = await Promise.all([
      getNewsletterEditions(),
      getPlaylistVideos(podcast.playlistId, 25),
    ]);

    const afterNewsletter = mergeNew(
      existing,
      editions.map(editionToNovedad)
    );
    const afterPodcast = mergeNew(
      afterNewsletter.items,
      videos.map(videoToNovedad)
    );

    if (afterNewsletter.changed || afterPodcast.changed) {
      await saveNovedades(afterPodcast.items);
    }

    return {
      newsletterAdded: afterNewsletter.added,
      podcastAdded: afterPodcast.added,
      total: afterPodcast.items.length,
    };
  });
}

const lastAttemptAt: Record<SyncScope, number> = {
  newsletter: 0,
  podcast: 0,
};

const syncers: Record<SyncScope, () => Promise<number>> = {
  newsletter: syncNewsletterNovedades,
  podcast: syncPodcastNovedades,
};

/**
 * Sync "best effort" para páginas públicas: nunca lanza y está limitado en
 * frecuencia. Si la fuente o el almacenamiento fallan, la página sigue
 * mostrando lo ya guardado.
 */
export async function refreshNovedades(
  ...scopes: SyncScope[]
): Promise<void> {
  const now = Date.now();

  for (const scope of scopes) {
    if (now - lastAttemptAt[scope] < MIN_SYNC_INTERVAL_MS) continue;
    lastAttemptAt[scope] = now;

    try {
      await syncers[scope]();
    } catch (error) {
      console.error(`[sync-novedades] ${scope} falló; se usa lo guardado`, error);
    }
  }
}
