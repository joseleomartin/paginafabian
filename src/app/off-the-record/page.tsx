import type { Metadata } from "next";
import Link from "next/link";
import { FeatureSplit } from "@/components/FeatureSplit";
import { NovedadesList } from "@/components/NovedadesList";
import { Reveal } from "@/components/Reveal";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { podcast, siteConfig } from "@/lib/content";
import { formatDate } from "@/lib/format-date";
import { getPublishedNovedades } from "@/lib/novedades";
import { refreshNovedades } from "@/lib/sync-novedades";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Off the Record",
  description:
    "Off the Record, el podcast de Fabián Canoni. Conversaciones honestas sobre negocios, decisiones y lo que pasa detrás de los números.",
  alternates: { canonical: `${siteConfig.url}/off-the-record` },
  openGraph: {
    title: `${podcast.name} | ${siteConfig.name}`,
    description: podcast.description,
    url: `${siteConfig.url}/off-the-record`,
  },
};

export default async function PodcastPage() {
  await refreshNovedades("podcast");
  const episodios = await getPublishedNovedades("podcast");
  const latest = episodios[0] ?? null;
  const embedSrc = latest?.youtubeId
    ? `https://www.youtube.com/embed/${latest.youtubeId}`
    : podcast.embedUrl;
  const embedTitle = latest
    ? `${latest.title} — ${podcast.name}`
    : `${podcast.name}, playlist de YouTube`;

  return (
    <>
      <FeatureSplit
        eyebrow="Podcast"
        title={podcast.name}
        accent="Record"
        lead={podcast.tagline}
        mediaShape="wide"
        media={<YouTubeEmbed src={embedSrc} title={embedTitle} shape="wide" />}
      >
        {latest ? (
          <>
            <p className="eyebrow">Último episodio</p>
            <h2 className="episode-featured-title">{latest.title}</h2>
            <p className="form-note">{formatDate(latest.date)}</p>
          </>
        ) : null}
        <div className="btn-group">
          <a
            href={latest?.href ?? podcast.playlistUrl}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {latest ? "Ver último episodio" : "Abrir en YouTube"}
          </a>
          <a
            href={podcast.playlistUrl}
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver playlist
          </a>
        </div>
      </FeatureSplit>

      <NovedadesList
        items={episodios}
        eyebrow="Novedades"
        title="Últimos episodios"
        variant="cards"
      />

      <section className="cta-final">
        <div className="container">
          <Reveal>
            <h2>¿Querés llevar esta conversación a tu equipo?</h2>
            <p className="lead">
              Charlas y acompañamiento para dueños que necesitan más claridad
              financiera.
            </p>
            <div className="btn-group">
              <Link href="/contacto" className="btn btn-primary">
                Contactar
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
