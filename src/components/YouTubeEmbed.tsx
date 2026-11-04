"use client";

import Image from "next/image";
import { useId, useState } from "react";

type Props = {
  /** URL de embed completa (https://www.youtube.com/embed/...). */
  src: string;
  title: string;
  /** "vertical" para Shorts (9:16); "wide" para videos 16:9. */
  shape: "vertical" | "wide";
  /** Prioriza el poster si el embed está above-the-fold (evita LCP lazy). */
  priority?: boolean;
};

const FRAME_CLASS: Record<Props["shape"], string> = {
  vertical: "tip-embed",
  wide: "video-embed",
};

function extractVideoId(src: string): string | null {
  try {
    const url = new URL(src);
    const parts = url.pathname.split("/").filter(Boolean);
    const embedIndex = parts.indexOf("embed");
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1];
    }
    return url.searchParams.get("v");
  } catch {
    return null;
  }
}

export function YouTubeEmbed({ src, title, shape, priority = false }: Props) {
  const [active, setActive] = useState(false);
  const labelId = useId();
  const videoId = extractVideoId(src);
  const frameClass = FRAME_CLASS[shape];

  if (active || !videoId) {
    const embedSrc = active
      ? `${src}${src.includes("?") ? "&" : "?"}autoplay=1`
      : src;

    return (
      <div className={frameClass}>
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading={priority ? "eager" : "lazy"}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <div className={`${frameClass} yt-facade`}>
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        fill
        sizes={shape === "wide" ? "(max-width: 900px) 92vw, 560px" : "220px"}
        className="yt-facade-poster"
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
      />
      <button
        type="button"
        className="yt-facade-play"
        aria-labelledby={labelId}
        onClick={() => setActive(true)}
      >
        <span id={labelId} className="sr-only">
          Reproducir video: {title}
        </span>
        <svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true">
          <path
            className="yt-facade-play-bg"
            d="M66.52 7.52c-.78-2.93-2.49-5.23-5.42-6.01C55.79.13 34 0 34 0S12.21.13 6.9 1.51C3.97 2.29 2.27 4.59 1.48 7.52.1 12.83 0 24 0 24s.1 11.17 1.48 16.48c.78 2.93 2.49 5.23 5.42 6.01C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.51c2.93-.78 4.64-3.08 5.42-6.01C67.9 35.17 68 24 68 24s-.1-11.17-1.48-16.48z"
          />
          <path className="yt-facade-play-icon" d="M45 24 27 14v20" />
        </svg>
      </button>
    </div>
  );
}
