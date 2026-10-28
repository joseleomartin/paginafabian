import type { Metadata } from "next";
import Link from "next/link";
import { HeroMedia } from "@/components/hero/HeroMedia";
import { NovedadesList } from "@/components/NovedadesList";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { podcast, siteConfig } from "@/lib/content";
import { images } from "@/lib/images";
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
  const thumbnailUrl =
    latest?.imageUrl ||
    (latest?.youtubeId
      ? `https://i.ytimg.com/vi/${latest.youtubeId}/hqdefault.jpg`
      : null);
  const embedTitle = latest
    ? `${latest.title} — ${podcast.name}`
    : `${podcast.name}, playlist de YouTube`;

  return (
    <>
      <PageHero
        eyebrow="Podcast"
        title={podcast.name}
        accent="Record"
        lead={podcast.tagline}
        actions={
          <>
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
          </>
        }
      >
        {latest && thumbnailUrl ? (
          <HeroMedia
            image={{ src: thumbnailUrl, alt: latest.title, position: "50% 50%" }}
            variant="card"
            aspectRatio="16 / 9"
            href={latest.href}
            play
            label="Último episodio"
            title={latest.title}
            date={latest.date}
          />
        ) : (
          <HeroMedia image={images.podcastHero} />
        )}
      </PageHero>

      <section className="section">
        <div className="container narrow-copy">
          <Reveal>
            <p>{podcast.description}</p>
            <p>
              Si En Clave PyME es la lectura semanal, Off the Record es la
              conversación: matices y preguntas que suelen quedarse fuera del
              escenario.
            </p>
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
              <Link href="/en-clave-pyme" className="btn btn-secondary">
                Ir a la newsletter
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <Reveal>
            {latest ? (
              <div className="episode-featured-head">
                <p className="eyebrow">Último episodio</p>
                <h2 className="episode-featured-title">{latest.title}</h2>
              </div>
            ) : null}
            <div className="video-embed">
              <iframe
                src={embedSrc}
                title={embedTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </Reveal>
        </div>
      </section>

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
