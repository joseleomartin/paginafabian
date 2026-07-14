import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { newsletter, siteConfig } from "@/lib/content";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "En Clave PyME",
  description:
    "Newsletter de Fabián Canoni: una idea semanal sobre finanzas, decisiones y negocios para empresarios PyME.",
  alternates: { canonical: `${siteConfig.url}/en-clave-pyme` },
};

export default function NewsletterPage() {
  return (
    <>
      <PageHero
        eyebrow="Newsletter"
        title={newsletter.name}
        lead={newsletter.tagline}
        videoEmbedUrl={newsletter.youtubeEmbedUrl}
        videoTitle={newsletter.youtubeTitle}
        darkVisual
        frame="graphic"
      />

      <section className="section">
        <div className="container split">
          <Reveal>
            <p>{newsletter.description}</p>
            <p>
              Cada edición abre una conversación que los dueños suelen
              postergar: valuación, flujo de caja, eficiencia, competitividad y las
              decisiones que definen el valor de una empresa.
            </p>
            <div className="btn-group">
              <a
                href={siteConfig.social.newsletter}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Suscribirme en LinkedIn
              </a>
              <a
                href={siteConfig.social.youtube}
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en YouTube
              </a>
            </div>
            <p className="form-note mt-lg">
              Video destacado: “{newsletter.youtubeTitle}”
            </p>
          </Reveal>
          <Reveal delay={1}>
            <div className="media-frame media-landscape">
              <Image
                src={images.stageGesture.src}
                alt={images.stageGesture.alt}
                width={images.stageGesture.width}
                height={images.stageGesture.height}
                sizes="(max-width: 900px) 100vw, 540px"
                style={{
                  objectFit: "cover",
                  objectPosition: images.stageGesture.position,
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

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
