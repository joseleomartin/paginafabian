import Image from "next/image";
import Link from "next/link";
import { MediaCarousels } from "@/components/MediaCarousels";
import { Reveal } from "@/components/Reveal";
import { SocialLinks } from "@/components/SocialLinks";
import {
  highlights,
  newsletter,
  podcast,
  services,
  siteConfig,
} from "@/lib/content";
import { images } from "@/lib/images";
import { getPublishedNovedades } from "@/lib/novedades";
import { refreshNovedades } from "@/lib/sync-novedades";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await refreshNovedades("newsletter", "podcast");

  const [newsletterItems, podcastItems] = await Promise.all([
    getPublishedNovedades("newsletter"),
    getPublishedNovedades("podcast"),
  ]);

  return (
    <>
      <section className="hero" aria-label="Presentación">
        <div className="hero-photo">
          <Image
            src={images.hero.src}
            alt={images.hero.alt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 58vw"
            style={{
              objectFit: "cover",
              objectPosition: images.hero.position,
            }}
          />
          <div className="hero-fade" aria-hidden="true" />
        </div>

        <div className="hero-copy">
          <p className="eyebrow">
            CFO Fractional · Speaker · Coach ejecutivo
          </p>
          <h1>
            Empezá a decidir
            <br />
            con más <span className="text-accent">claridad</span>
          </h1>
          <SocialLinks variant="hero" />
          <div className="hero-stats" aria-label="Trayectoria">
            {highlights.slice(0, 3).map((item) => (
              <div key={item.label} className="hero-stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="btn-group hero-actions">
            <Link href="/sobre" className="btn btn-primary">
              Sobre mí
            </Link>
            <Link href="/contacto" className="btn btn-secondary">
              Contacto
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container intro-grid">
          <Reveal>
            <div className="media-frame media-portrait intro-photo">
              <Image
                src={images.portraitWarm.src}
                alt={images.portraitWarm.alt}
                width={images.portraitWarm.width}
                height={images.portraitWarm.height}
                sizes="(max-width: 900px) 92vw, 420px"
                style={{
                  objectFit: "cover",
                  objectPosition: images.portraitWarm.position,
                }}
              />
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="intro-copy">
              <p className="eyebrow">Hola</p>
              <h2>
                Soy Fabián.
                <br />
                <span className="text-accent">Trabajo con dueños.</span>
              </h2>
              <p className="lead">{siteConfig.mission}</p>
              <p>
                No sumo trámites. Traduzco información financiera para que
                puedas decidir con menos ruido y más certeza.
              </p>
              <div className="btn-group">
                <Link href="/sobre" className="btn btn-secondary">
                  Conocerme
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
              <p className="eyebrow">Cómo trabajo</p>
              <h2>Acompañamiento concreto para decidir mejor</h2>
              <p className="lead">
                Claridad en caja, costos y estrategia, sin sumar estructura
                innecesaria.
              </p>
            </div>
          </Reveal>
          <div className="work-grid">
            {services.map((service, i) => (
              <Reveal
                key={service.slug}
                delay={(Math.min((i % 3) + 1, 3) as 1 | 2 | 3)}
              >
                <Link href={`/servicios#${service.slug}`} className="work-card">
                  <span className="work-num">0{i + 1}</span>
                  <h3>{service.title}</h3>
                  <p>{service.summary}</p>
                  <span className="work-cta">Ver más</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="speaker-band">
        <div className="speaker-media">
          <Image
            src={images.speakerBand.src}
            alt={images.speakerBand.alt}
            fill
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: images.speakerBand.position,
            }}
          />
          <div className="speaker-overlay" aria-hidden="true" />
        </div>
        <div className="container speaker-content">
          <Reveal>
            <p className="eyebrow">Charlas</p>
            <h2>Cuando el número necesita una voz</h2>
            <p className="lead">
              Charlas claras sobre finanzas, decisiones y el día a día de una
              PyME. Sin tecnicismos de más: para equipos, eventos y comunidades
              que quieren pensar el negocio con más lucidez.
            </p>
            <div className="btn-group">
              <Link href="/contacto" className="btn btn-primary">
                Consultar fechas
              </Link>
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

      <section className="section section-marquees" aria-label="Newsletter y podcast">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Newsletter y podcast</p>
              <h2>Seguí la conversación</h2>
              <p className="lead">
                Una idea por semana y charlas honestas sobre lo que pasa detrás
                de los números.
              </p>
            </div>
          </Reveal>
        </div>

        <MediaCarousels
          newsletters={newsletterItems}
          podcasts={podcastItems}
          newsletterHref="/en-clave-pyme"
          podcastHref="/off-the-record"
          subscribeHref={siteConfig.social.newsletter}
          youtubeHref={podcast.playlistUrl}
        />
      </section>

      <section className="section section-warm social-follow" aria-label="Redes sociales">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Redes</p>
              <h2>Seguime donde ya estoy publicando</h2>
              <p className="lead">
                LinkedIn, Instagram y YouTube: contenido sobre finanzas,
                decisiones y lo que pasa detrás de los números.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <SocialLinks variant="cards" />
          </Reveal>
        </div>
      </section>

      <section className="cta-final">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Siguiente paso</p>
            <h2>Si los números no te hablan con claridad, escribime.</h2>
            <p className="lead">
              Una conversación alcanza para ver si tiene sentido trabajar juntos.
            </p>
            <div className="btn-group">
              <Link href="/contacto" className="btn btn-primary">
                Contactar
              </Link>
              <a
                href={siteConfig.whatsapp}
                className="btn btn-ghost-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
