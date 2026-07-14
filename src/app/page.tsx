import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import {
  highlights,
  newsletter,
  podcast,
  services,
  siteConfig,
} from "@/lib/content";
import { images } from "@/lib/images";

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-label="Presentación">
        <div className="hero-copy">
          <p className="hero-brand">
            Fabián Canoni<span>.</span>
          </p>
          <h1>
            Empezá a decidir
            <br />
            con más claridad
          </h1>
          <p className="lead">
            CFO Fractional para dueños de PyMEs. Finanzas y estrategia, en
            lenguaje de negocio.
          </p>
          <div className="btn-group">
            <Link href="/contacto" className="btn btn-primary">
              Conversemos
            </Link>
            <Link href="/servicios" className="btn btn-secondary">
              Cómo trabajo
            </Link>
          </div>
        </div>

        <div className="hero-photo">
          <Image
            src={images.hero.src}
            alt={images.hero.alt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
            style={{
              objectFit: "cover",
              objectPosition: "62% 20%",
            }}
          />
        </div>
      </section>

      <section className="proof-bar" aria-label="Trayectoria">
        <div className="container proof-grid">
          {highlights.map((item) => (
            <div key={item.label} className="proof-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
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
            <h2>Contratame como speaker</h2>
            <p className="lead">
              Conversaciones prácticas sobre finanzas, decisiones y PyMEs para
              equipos, eventos y comunidades.
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

      <section className="section">
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

          <div className="media-duo">
            <Reveal>
              <article className="media-panel">
                <div className="media-panel-visual media-panel-visual--landscape">
                  <Image
                    src={images.newsletter.src}
                    alt={images.newsletter.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    className="newsletter-shot"
                  />
                </div>
                <div className="media-panel-body">
                  <p className="eyebrow">Newsletter</p>
                  <h3>{newsletter.name}</h3>
                  <p>{newsletter.tagline}</p>
                  <div className="btn-group">
                    <a
                      href={siteConfig.social.newsletter}
                      className="btn btn-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Suscribirme
                    </a>
                    <Link href="/en-clave-pyme" className="btn btn-secondary">
                      Ver más
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={1}>
              <article className="media-panel media-panel-dark">
                <div className="media-panel-visual media-panel-visual--landscape podcast-visual">
                  <Image
                    src={images.otrFrameEp2.src}
                    alt={images.otrFrameEp2.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    className="img-cover"
                    style={{
                      objectFit: "cover",
                      objectPosition: images.otrFrameEp2.position,
                    }}
                  />
                  <div className="podcast-badge">{podcast.name}</div>
                </div>
                <div className="media-panel-body">
                  <p className="eyebrow">Podcast</p>
                  <h3>{podcast.name}</h3>
                  <p>{podcast.tagline}</p>
                  <div className="btn-group">
                    <Link href="/off-the-record" className="btn btn-primary">
                      Escuchar
                    </Link>
                    <a
                      href={podcast.playlistUrl}
                      className="btn btn-ghost-dark"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      YouTube
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
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
