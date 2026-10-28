import Image from "next/image";
import type { CSSProperties } from "react";
import { formatDate } from "@/lib/format-date";

type MediaSource = {
  src: string;
  alt: string;
  position?: string;
};

type Props = {
  image: MediaSource;
  /**
   * photo: foto de persona a sangre en la mitad derecha del hero (en móvil, tarjeta).
   * card: pieza con texto propio (portada, miniatura) que no debe recortarse.
   */
  variant?: "photo" | "card";
  /** Proporción CSS de la variante card (p. ej. "16 / 9"). */
  aspectRatio?: string;
  /** Si se indica, la imagen es un enlace externo. */
  href?: string;
  /** Muestra un botón de reproducción sobre la imagen. */
  play?: boolean;
  /** Texto pequeño sobre el pie (p. ej. "Último episodio"). */
  label?: string;
  title?: string;
  /** Fecha ISO (YYYY-MM-DD) que se muestra bajo el título. */
  date?: string;
  priority?: boolean;
};

const DEFAULT_CARD_ASPECT = "3 / 2";

function PlayIcon() {
  return (
    <span className="hx-play" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path
          fill="currentColor"
          d="M8 5.5v13a1 1 0 001.5.86l11-6.5a1 1 0 000-1.72l-11-6.5A1 1 0 008 5.5z"
        />
      </svg>
    </span>
  );
}

/** Imagen protagonista del hero: foto a sangre o tarjeta enmarcada, con pie opcional. */
export function HeroMedia({
  image,
  variant = "photo",
  aspectRatio,
  href,
  play = false,
  label,
  title,
  date,
  priority = true,
}: Props) {
  const isFullPhoto = variant === "photo";
  const frameStyle: CSSProperties | undefined = !isFullPhoto
    ? { aspectRatio: aspectRatio ?? DEFAULT_CARD_ASPECT }
    : undefined;

  const picture = (
    <>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes={
          isFullPhoto ? "(max-width: 960px) 100vw, 50vw" : "(max-width: 960px) 90vw, 36rem"
        }
        style={{ objectFit: "cover", objectPosition: image.position ?? "50% 20%" }}
      />
      {play ? <PlayIcon /> : null}
    </>
  );

  const hasCaption = Boolean(label || title || date);

  return (
    <figure className={`hx-media hx-media--${variant}`}>
      <div className="hx-media-stage">
        {href ? (
          <a
            href={href}
            className="hx-media-frame hx-media-frame--link"
            style={frameStyle}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={title ?? image.alt}
          >
            {picture}
          </a>
        ) : (
          <div className="hx-media-frame" style={frameStyle}>
            {picture}
          </div>
        )}
      </div>
      {hasCaption ? (
        <figcaption className="hx-media-caption">
          {label ? <span className="hx-media-label">{label}</span> : null}
          {title ? <strong>{title}</strong> : null}
          {date ? <time dateTime={date}>{formatDate(date)}</time> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
