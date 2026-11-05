import { podcast, tips } from "@/lib/content";
import { getNewsletterEditions } from "@/lib/linkedin-newsletter";
import { archivedNovedades } from "@/lib/novedades-archive";
import {
  completeEditionNumbers,
  mergeNew,
  type MergeResult,
} from "@/lib/novedades-merge";
import {
  getNovedades,
  saveNovedades,
  type Novedad,
} from "@/lib/novedades";
import {
  videoToNovedad,
  type VideoNovedadType,
  type VideoSource,
} from "@/lib/video-novedad";
import { getPlaylistVideos } from "@/lib/youtube-playlist";

export type SyncResult = {
  newsletterAdded: number;
  podcastAdded: number;
  tipsAdded: number;
  total: number;
};

export type SyncScope = "newsletter" | "podcast" | "tips";

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

type VideoSyncSource = VideoSource & { playlistId: string };

/** Playlists de YouTube que se sincronizan, por tipo de novedad. */
const VIDEO_SOURCES: Record<VideoNovedadType, VideoSyncSource> = {
  podcast: {
    type: "podcast",
    playlistId: podcast.playlistId,
    badge: "Off the Record",
    summary: podcast.tagline,
    thumbnail: "hqdefault",
  },
  tip: {
    type: "tip",
    playlistId: tips.playlistId,
    badge: tips.name,
    summary: tips.tagline,
    thumbnail: "maxresdefault",
  },
};
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

/** Une dos resultados de merge consecutivos sobre el mismo store. */
function chainMerges(first: MergeResult, second: MergeResult): MergeResult {
  return {
    items: second.items,
    added: first.added + second.added,
    changed: first.changed || second.changed,
  };
}

/**
 * Completa el store con el archivo histórico y luego pide a LinkedIn solo lo
 * que no tenemos completo (ediciones nuevas o sin portada).
 */
async function mergeNewsletterSources(
  existing: Novedad[]
): Promise<MergeResult> {
  const seeded = mergeNew(existing, archivedNovedades("newsletter"));
  const editions = await getNewsletterEditions(
    undefined,
    completeEditionNumbers(seeded.items)
  );
  return chainMerges(
    seeded,
    mergeNew(seeded.items, editions.map(editionToNovedad))
  );
}

/** Completa el store con el archivo histórico y suma los videos más recientes de la playlist. */
async function mergeVideoSources(
  existing: Novedad[],
  type: VideoNovedadType
): Promise<MergeResult> {
  const source = VIDEO_SOURCES[type];
  const seeded = mergeNew(existing, archivedNovedades(type));
  const videos = await getPlaylistVideos(source.playlistId, 25);
  return chainMerges(
    seeded,
    mergeNew(
      seeded.items,
      videos.map((video) => videoToNovedad(video, source))
    )
  );
}
/** Trae ediciones de LinkedIn y guarda solo lo nuevo. */
export function syncNewsletterNovedades(): Promise<number> {
  return runExclusive(async () =>
    persistIfChanged(await mergeNewsletterSources(await getNovedades()))
  );
}

/** Trae episodios de YouTube y guarda solo lo nuevo. */
export function syncPodcastNovedades(): Promise<number> {
  return runExclusive(async () =>
    persistIfChanged(await mergeVideoSources(await getNovedades(), "podcast"))
  );
}

/** Trae los tips (Shorts) de la playlist de YouTube y guarda solo lo nuevo. */
export function syncTipsNovedades(): Promise<number> {
  return runExclusive(async () =>
    persistIfChanged(await mergeVideoSources(await getNovedades(), "tip"))
  );
}

/**
 * Sync completo (cron / endpoint protegido).
 * Cada fuente se guarda al terminar: si YouTube se cuelga, la newsletter
 * ya quedó persistida (antes un fallo al final descartaba todo).
 */
export function syncAllNovedades(): Promise<SyncResult> {
  return runExclusive(async () => {
    let newsletterAdded = 0;
    let podcastAdded = 0;
    let tipsAdded = 0;
    let items = await getNovedades();

    try {
      const merged = await mergeNewsletterSources(items);
      newsletterAdded = merged.added;
      if (merged.changed) {
        items = await saveNovedades(merged.items);
      } else {
        items = merged.items;
      }
    } catch (error) {
      console.error("[sync-novedades] newsletter falló", error);
    }

    try {
      const merged = await mergeVideoSources(items, "podcast");
      podcastAdded = merged.added;
      if (merged.changed) {
        items = await saveNovedades(merged.items);
      } else {
        items = merged.items;
      }
    } catch (error) {
      console.error("[sync-novedades] podcast falló", error);
    }

    try {
      const merged = await mergeVideoSources(items, "tip");
      tipsAdded = merged.added;
      if (merged.changed) {
        items = await saveNovedades(merged.items);
      } else {
        items = merged.items;
      }
    } catch (error) {
      console.error("[sync-novedades] tips falló", error);
    }

    return {
      newsletterAdded,
      podcastAdded,
      tipsAdded,
      total: items.length,
    };
  });
}

const lastAttemptAt: Record<SyncScope, number> = {
  newsletter: 0,
  podcast: 0,
  tips: 0,
};

const syncers: Record<SyncScope, () => Promise<number>> = {
  newsletter: syncNewsletterNovedades,
  podcast: syncPodcastNovedades,
  tips: syncTipsNovedades,
};

/**
 * Sync "best effort" acotado en frecuencia. Las páginas públicas ya no lo
 * llaman (quema Blob Advanced Ops); queda para admin/manual. El cron usa
 * `syncAllNovedades`.
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
