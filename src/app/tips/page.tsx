import type { Metadata } from "next";
import Link from "next/link";
import { FeatureSplit } from "@/components/FeatureSplit";
import { Reveal } from "@/components/Reveal";
import { TipsGrid, type TipCard } from "@/components/TipsGrid";
import { YouTubeEmbed, youtubeEmbedUrl } from "@/components/YouTubeEmbed";
import { siteConfig, tips } from "@/lib/content";
import { formatDate } from "@/lib/format-date";
import { getPublishedNovedades, type Novedad } from "@/lib/novedades";
import { refreshNovedades } from "@/lib/sync-novedades";
import { cleanVideoTitle, youtubeThumbnailUrl } from "@/lib/video-novedad";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: tips.name,
  description:
    "Tips y herramientas para PyMEs y emprendedores: videos cortos de Fabián Canoni sobre finanzas, precios, margen y decisiones.",
  alternates: { canonical: `${siteConfig.url}/tips` },
  openGraph: {
    title: `${tips.name} | ${siteConfig.name}`,
    description: tips.description,
    url: `${siteConfig.url}/tips`,
  },
};

function toTipCard(item: Novedad): TipCard {
  const frameUrl = item.youtubeId
    ? youtubeThumbnailUrl(item.youtubeId, "oar2")
    : "";
  const coverUrl =
    item.imageUrl ||
    (item.youtubeId ? youtubeThumbnailUrl(item.youtubeId, "maxresdefault") : "");

  return {
    id: item.id,
    title: cleanVideoTitle(item.title),
    href: item.href,
    date: item.date,
    imageUrl: coverUrl,
    fallbackImageUrl: frameUrl || coverUrl,
  };
}

export default async function TipsPage() {
  // Trae solo lo nuevo de la playlist y lo guarda; la UI lee el store acumulado.
  await refreshNovedades("tips");
  const items = await getPublishedNovedades("tip");
  const latest = items[0] ?? null;
  const cards = items.map(toTipCard).filter((card) => card.imageUrl);

  return (
    <>
      <FeatureSplit
        eyebrow="Tips y herramientas"
        title={tips.name}
        accent="PyMEs"
        lead={tips.tagline}
        mediaShape="vertical"
        media={
          latest?.youtubeId ? (
            <YouTubeEmbed
              src={youtubeEmbedUrl(latest.youtubeId)}
              title={`${cleanVideoTitle(latest.title)} — ${tips.name}`}
              shape="vertical"
            />
          ) : null
        }
      >
        <p className="eyebrow">{latest ? "Último tip" : tips.name}</p>
        {latest ? (
          <>
            <h2 className="episode-featured-title">
              {cleanVideoTitle(latest.title)}
            </h2>
            <p className="form-note">{formatDate(latest.date)}</p>
          </>
        ) : null}
        <div className="btn-group">
          <a
            href={tips.playlistUrl}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver todos en YouTube
          </a>
          <Link href="/en-clave-pyme" className="btn btn-secondary">
            Leer la newsletter
          </Link>
        </div>
      </FeatureSplit>
      {cards.length > 0 ? (
        <section className="section section-warm">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <p className="eyebrow">Biblioteca</p>
                <h2>Todos los tips</h2>
              </div>
              <TipsGrid tips={cards} />
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="cta-final">
        <div className="container">
          <Reveal>
            <h2>¿Querés aplicar esto en tu empresa?</h2>
            <p className="lead">
              Los tips ordenan la idea. Con tus números, la decisión se vuelve
              concreta.
            </p>
            <div className="btn-group">
              <Link href="/contacto" className="btn btn-primary">
                Hablar conmigo
              </Link>
              <Link href="/off-the-record" className="btn btn-ghost-dark">
                Escuchar el podcast
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
