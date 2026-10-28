export type PlaylistVideo = {
  id: string;
  title: string;
  url: string;
  published: string;
  embedUrl: string;
};

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Lee el feed Atom público de una playlist de YouTube (sin API key).
 * El primer entry es el video más reciente de la lista.
 */
export async function getPlaylistVideos(
  playlistId: string,
  limit = 8
): Promise<PlaylistVideo[]> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`;

  try {
    const response = await fetch(feedUrl, {
      cache: "no-store",
      headers: { Accept: "application/atom+xml, application/xml, text/xml" },
    });

    if (!response.ok) {
      console.error(
        `[youtube-playlist] feed ${response.status} for ${playlistId}`
      );
      return [];
    }

    const xml = await response.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
    const videos: PlaylistVideo[] = [];

    for (const entry of entries) {
      if (videos.length >= limit) break;

      const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]*)<\/title>/);
      const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
      const linkMatch = entry.match(
        /<link[^>]*rel="alternate"[^>]*href="([^"]+)"/
      );

      const id = idMatch?.[1]?.trim();
      if (!id) continue;

      videos.push({
        id,
        title: decodeXml(titleMatch?.[1]?.trim() || `Video ${id}`),
        url:
          linkMatch?.[1]?.trim() || `https://www.youtube.com/watch?v=${id}`,
        published: publishedMatch?.[1]?.trim() || new Date().toISOString(),
        embedUrl: `https://www.youtube.com/embed/${id}`,
      });
    }

    return videos;
  } catch (error) {
    console.error("[youtube-playlist] fetch failed", error);
    return [];
  }
}

export async function getLatestPlaylistVideo(
  playlistId: string
): Promise<PlaylistVideo | null> {
  const videos = await getPlaylistVideos(playlistId, 1);
  return videos[0] ?? null;
}
