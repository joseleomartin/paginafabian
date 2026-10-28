type Props = {
  /** URL de embed completa (https://www.youtube.com/embed/...). */
  src: string;
  title: string;
  /** "vertical" para Shorts (9:16); "wide" para videos 16:9. */
  shape: "vertical" | "wide";
};

const FRAME_CLASS: Record<Props["shape"], string> = {
  vertical: "tip-embed",
  wide: "video-embed",
};

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function YouTubeEmbed({ src, title, shape }: Props) {
  return (
    <div className={FRAME_CLASS[shape]}>
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
