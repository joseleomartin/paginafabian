import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { podcast, siteConfig } from "@/lib/content";
import { images } from "@/lib/images";

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

export default function PodcastPage() {
  return (
    <>
      <PageHero
        eyebrow="Podcast"
        title={podcast.name}
        lead={podcast.tagline}
        image={images.podcastHero}
        frame="portrait"
      />

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
                href={podcast.playlistUrl}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir en YouTube
              </a>
              <Link href="/en-clave-pyme" className="btn btn-secondary">
                Ir a la newsletter
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-warm">
        <div className="container">
          <Reveal>
            <div className="video-embed">
              <iframe
                src={podcast.embedUrl}
                title={`${podcast.name} — playlist de YouTube`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </Reveal>
        </div>
      </section>

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
