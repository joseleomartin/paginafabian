import Image from "next/image";

type HeroImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  position?: string;
};

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  image?: HeroImage;
  /** Embed de YouTube (reemplaza la imagen) */
  videoEmbedUrl?: string;
  videoTitle?: string;
  /** object-fit contain — para piezas gráficas */
  contain?: boolean;
  /** Fondo oscuro en el panel de imagen */
  darkVisual?: boolean;
  /**
   * portrait: foto vertical, foco arriba.
   * graphic: pieza 16:9 (newsletter/YT) — el panel iguala el ratio y no corta texto.
   */
  frame?: "default" | "portrait" | "graphic";
};

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  videoEmbedUrl,
  videoTitle,
  contain = false,
  darkVisual = false,
  frame = "default",
}: Props) {
  const isPortrait = frame === "portrait";
  const isGraphic = frame === "graphic" || Boolean(videoEmbedUrl);
  const showVideo = Boolean(videoEmbedUrl);

  return (
    <header
      className={[
        "page-hero",
        "page-hero-split",
        isPortrait ? "page-hero--portrait" : "",
        isGraphic ? "page-hero--graphic" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={eyebrow}
    >
      <div className="page-hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
      </div>
      <div
        className={[
          "page-hero-visual",
          darkVisual || showVideo ? "page-hero-visual--dark" : "",
          contain ? "page-hero-visual--contain" : "",
          isPortrait ? "page-hero-visual--portrait" : "",
          isGraphic ? "page-hero-visual--graphic" : "",
          showVideo ? "page-hero-visual--video" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showVideo ? (
          <iframe
            src={videoEmbedUrl}
            title={videoTitle ?? title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
            className={contain ? "img-contain" : "img-cover"}
            style={{
              objectFit: contain ? "contain" : "cover",
              objectPosition:
                image.position ??
                (isPortrait ? "55% 12%" : isGraphic ? "50% 50%" : "50% 28%"),
            }}
          />
        ) : null}
      </div>
    </header>
  );
}
