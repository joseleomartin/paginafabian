import type { Metadata } from "next";
import Link from "next/link";
import { FeatureSplit } from "@/components/FeatureSplit";
import { NovedadesList } from "@/components/NovedadesList";
import { Reveal } from "@/components/Reveal";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { newsletter, siteConfig } from "@/lib/content";
import { getPublishedNovedades } from "@/lib/novedades";
import { refreshNovedades } from "@/lib/sync-novedades";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "En Clave PyME",
  description:
    "Newsletter de Fabián Canoni: una idea semanal sobre finanzas, decisiones y negocios para empresarios PyME.",
  alternates: { canonical: `${siteConfig.url}/en-clave-pyme` },
};

export default async function NewsletterPage() {
  // Trae solo lo nuevo del feed y lo guarda; la UI lee el archivo/Blob acumulado.
  await refreshNovedades("newsletter");
  const items = await getPublishedNovedades("newsletter");
  const latest = items[0] ?? null;

  return (
    <>
      <FeatureSplit
        eyebrow="Newsletter"
        title={newsletter.name}
        accent="PyME"
        lead={newsletter.tagline}
        mediaShape="wide"
        media={
          <YouTubeEmbed
            src={newsletter.youtubeEmbedUrl}
            title={newsletter.youtubeTitle}
            shape="wide"
          />
        }
      >
        <p>{newsletter.description}</p>
        <div className="btn-group">
          <a
            href={siteConfig.social.newsletter}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Suscribirme en LinkedIn
          </a>
          {latest ? (
            <a
              href={latest.href}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leer última edición
            </a>
          ) : null}
        </div>
      </FeatureSplit>
      <NovedadesList
        items={items}
        eyebrow="Novedades"
        title="Últimas ediciones"
        variant="cards"
      />

      <section className="section-ink quote-band">
        <div className="container">
          <Reveal>
            <p className="eyebrow">En Clave PyME</p>
            <blockquote>“{newsletter.quote}”</blockquote>
            <cite>Idea central · Newsletter</cite>
            <div className="quote-messages">
              {newsletter.messages.map((item) => (
                <article key={item.title} className="quote-message">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="cta-final">
        <div className="container">
          <Reveal>
            <h2>¿Esta conversación te resuena?</h2>
            <p className="lead">
              Si querés ir más allá de la lectura, podemos trabajar juntos.
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
