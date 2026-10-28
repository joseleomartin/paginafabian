"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Novedad } from "@/lib/novedades";

type Props = {
  newsletters: Novedad[];
  podcasts: Novedad[];
  newsletterHref: string;
  podcastHref: string;
  subscribeHref: string;
  youtubeHref: string;
};

function MarqueeCard({ item }: { item: Novedad }) {
  const imageSrc = item.imageUrl?.trim() || null;
  const isPodcast = item.type === "podcast";
  const cta = isPodcast ? "Escuchar" : "Leer";

  return (
    <a
      href={item.href}
      className={`marquee-card${isPodcast ? " marquee-card--dark" : ""}`}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
    >
      <span className="marquee-card-media">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="280px"
            className="marquee-card-img"
          />
        ) : (
          <span className="marquee-card-fallback" aria-hidden="true" />
        )}
      </span>
      <span className="marquee-card-body">
        <span className="marquee-card-badge">
          {item.badge || (isPodcast ? "Podcast" : "Newsletter")}
        </span>
        <span className="marquee-card-title">{item.title}</span>
        <span className="marquee-card-cta">{cta}</span>
      </span>
    </a>
  );
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      {dir === "prev" ? (
        <path
          fill="currentColor"
          d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
        />
      )}
    </svg>
  );
}

function MarqueeRow({
  items,
  direction,
  label,
}: {
  items: Novedad[];
  direction: "left" | "right";
  label: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  let unit = [...items];
  while (unit.length > 0 && unit.length < 8) unit = [...unit, ...items];
  const loop = unit.length ? [...unit, ...unit] : [];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || reduceMotion || items.length === 0) return;

    const half = () => el.scrollWidth / 2;
    el.scrollLeft = direction === "right" ? half() : 0;

    // Un poco más rápido que el ultra-lento anterior
    const pxPerFrame = 0.55;
    let raf = 0;

    const tick = () => {
      if (!pausedRef.current) {
        const mid = half();
        if (direction === "left") {
          el.scrollLeft += pxPerFrame;
          if (el.scrollLeft >= mid) el.scrollLeft -= mid;
        } else {
          el.scrollLeft -= pxPerFrame;
          if (el.scrollLeft <= 0) el.scrollLeft += mid;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction, reduceMotion, items.length]);

  if (items.length === 0) return null;

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };
  const resume = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    pausedRef.current = false;
  };
  const pauseBriefly = () => {
    pause();
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 900);
  };

  const step = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    pauseBriefly();
    const card = el.querySelector(".marquee-card");
    const amount =
      (card instanceof HTMLElement ? card.offsetWidth : 280) + 16;
    el.scrollBy({
      left: dir === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="media-marquee-block">
      <div
        className={`media-marquee media-marquee--${direction}`}
        role="region"
        aria-label={label}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) resume();
        }}
      >
        <div className="media-marquee-track" ref={scrollerRef} tabIndex={0}>
          {loop.map((item, index) => (
            <MarqueeCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>

      <div className="marquee-controls">
        <button
          type="button"
          className="marquee-arrow"
          aria-label="Anterior"
          onClick={() => step("prev")}
        >
          <Chevron dir="prev" />
        </button>
        <button
          type="button"
          className="marquee-arrow"
          aria-label="Siguiente"
          onClick={() => step("next")}
        >
          <Chevron dir="next" />
        </button>
      </div>
    </div>
  );
}

export function MediaCarousels({
  newsletters,
  podcasts,
  newsletterHref,
  podcastHref,
  subscribeHref,
  youtubeHref,
}: Props) {
  return (
    <div className="media-marquees">
      <div className="container media-marquee-label">
        <p className="eyebrow">Newsletter · En Clave PyME</p>
        <div className="btn-group">
          <a
            href={subscribeHref}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Suscribirme
          </a>
          <Link href={newsletterHref} className="btn btn-secondary">
            Ver todas
          </Link>
        </div>
      </div>
      <div className="media-marquees-bleed">
        <MarqueeRow
          items={newsletters}
          direction="left"
          label="Carrusel de ediciones de la newsletter"
        />
      </div>

      <div className="container media-marquee-label media-marquee-label--podcast">
        <p className="eyebrow">Podcast · Off the Record</p>
        <div className="btn-group">
          <Link href={podcastHref} className="btn btn-primary">
            Escuchar
          </Link>
          <a
            href={youtubeHref}
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
        </div>
      </div>
      <div className="media-marquees-bleed">
        <MarqueeRow
          items={podcasts}
          direction="right"
          label="Carrusel de episodios del podcast"
        />
      </div>
    </div>
  );
}
