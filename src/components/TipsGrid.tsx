"use client";

import Image from "next/image";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";

export type TipCard = {
  id: string;
  title: string;
  href: string;
  /** YYYY-MM-DD */
  date: string;
  /** Portada del Short (se recorta al centro en vertical). */
  imageUrl: string;
  /** Imagen alternativa si la portada no existe en YouTube. */
  fallbackImageUrl: string;
};

type Props = {
  tips: readonly TipCard[];
};

const PAGE_SIZE = 8;

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

function TipCover({ tip }: { tip: TipCard }) {
  const [useFallback, setUseFallback] = useState(false);
  const canFallBack = tip.fallbackImageUrl !== tip.imageUrl;

  return (
    <Image
      src={useFallback ? tip.fallbackImageUrl : tip.imageUrl}
      alt=""
      fill
      sizes="(max-width: 720px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="tip-card-img"
      onError={canFallBack && !useFallback ? () => setUseFallback(true) : undefined}
    />
  );
}

/** Grilla de Shorts verticales; abre cada video en YouTube y muestra de a 8. */
export function TipsGrid({ tips }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const shown = tips.slice(0, visibleCount);
  const remaining = tips.length - shown.length;

  return (
    <>
      <ul className="tips-grid">
        {shown.map((tip) => (
          <li key={tip.id}>
            <a
              className="tip-card"
              href={tip.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="tip-card-media">
                <TipCover tip={tip} />
                <span className="tip-card-play">
                  <PlayIcon />
                </span>
              </span>
              <span className="tip-card-caption">
                <time dateTime={tip.date}>{formatDate(tip.date)}</time>
                <strong>{tip.title}</strong>
              </span>
              <span className="sr-only"> (se abre en YouTube)</span>
            </a>
          </li>
        ))}
      </ul>

      {remaining > 0 ? (
        <div className="tips-more">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Ver {Math.min(PAGE_SIZE, remaining)} tips más
          </button>
        </div>
      ) : null}
    </>
  );
}
