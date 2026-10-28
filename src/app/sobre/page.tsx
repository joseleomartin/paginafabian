import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroMedia } from "@/components/hero/HeroMedia";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { about, siteConfig } from "@/lib/content";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Fabián Canoni es CFO Fractional. Más de 14 años acompañando a dueños de PyMEs a decidir con información clara.",
  alternates: { canonical: `${siteConfig.url}/sobre` },
};

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre mí"
        title="Hola, soy Fabián"
        accent="Fabián"
        lead={about.intro}
        actions={
          <>
            <Link href="/contacto" className="btn btn-primary">
              Conversemos
            </Link>
            <Link href="/servicios" className="btn btn-secondary">
              Cómo trabajo
            </Link>
          </>
        }
      >
        <HeroMedia image={images.portraitGesture} />
      </PageHero>

      <section className="section">
        <div className="container intro-grid intro-grid--story">
          <Reveal>
            <div className="media-frame media-portrait">
              <Image
                src={images.portraitSpeak.src}
                alt={images.portraitSpeak.alt}
                width={images.portraitSpeak.width}
                height={images.portraitSpeak.height}
                sizes="(max-width: 900px) 92vw, 420px"
                style={{
                  objectFit: "cover",
                  objectPosition: images.portraitSpeak.position,
                }}
              />
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="about-story">
              <p className="lead">{about.headline}</p>
              {about.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="btn-group">
                <Link href="/contacto" className="btn btn-primary">
                  Escribime
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-warm">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">En escena</p>
              <h2>Charlas, formación y conversaciones reales</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className="photo-strip" aria-label="Conferencias">
              {[images.stageClose, images.stageAudience, images.stageWideA].map(
                (shot) => (
                  <div key={shot.src} className="photo-strip-item">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{
                        objectFit: "cover",
                        objectPosition: shot.position,
                      }}
                    />
                  </div>
                )
              )}
            </div>
          </Reveal>
          <div className="intro-grid" style={{ marginTop: "1.25rem" }}>
            <Reveal>
              <div className="media-frame media-landscape">
                <Image
                  src={images.stageMid.src}
                  alt={images.stageMid.alt}
                  width={images.stageMid.width}
                  height={images.stageMid.height}
                  sizes="(max-width: 900px) 92vw, 540px"
                  style={{
                    objectFit: "cover",
                    objectPosition: images.stageMid.position,
                  }}
                />
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="intro-copy">
                <p className="lead">
                  Finanzas concretas. Conversaciones que importan.
                </p>
                <p>
                  El problema financiero de una empresa casi nunca es solo
                  técnico. Es de decisión. Por eso trabajo en la intersección
                  entre los números y la persona que los tiene que usar.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <Reveal>
            <p className="eyebrow">Trayectoria</p>
            <h2>Experiencia al servicio de la decisión</h2>
            <p>{about.trajectory}</p>
            <ul className="credential-list">
              {about.credentials.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={1}>
            <div className="cred-grid" aria-label="Momentos de trayectoria">
              {images.credentials.map((shot) => (
                <div
                  key={shot.src}
                  className={`cred-item cred-item--${shot.orient}`}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{
                      objectFit: "cover",
                      objectPosition: shot.position,
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="cred-note">
              Formación, actos institucionales y certificaciones a lo largo del
              recorrido profesional.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="cta-final">
        <div className="container">
          <Reveal>
            <h2>¿Conversamos sobre tu empresa?</h2>
            <p className="lead">
              Contame dónde estás hoy y qué decisión necesitás tomar con más
              claridad.
            </p>
            <div className="btn-group">
              <Link href="/contacto" className="btn btn-primary">
                Ir a contacto
              </Link>
              <Link href="/servicios" className="btn btn-ghost-dark">
                Cómo trabajo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
