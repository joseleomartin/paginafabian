import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { HeroMedia } from "@/components/hero/HeroMedia";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/content";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribile a Fabián Canoni para conversar sobre CFO Fractional, planificación financiera o charlas.",
  alternates: { canonical: `${siteConfig.url}/contacto` },
};

export default function ContactoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Empecemos por una conversación"
        accent="conversación"
        lead="Contame dónde está tu empresa hoy y qué decisión necesitás tomar con más claridad."
        actions={
          <a href="#formulario" className="btn btn-primary">
            Escribir por formulario
          </a>
        }
      >
        <HeroMedia image={images.portraitSpeakAlt} />
      </PageHero>

      <section id="formulario" className="section">
        <div className="container contact-grid">
          <Reveal>
            <h2>Escribime</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Completá el formulario o usá el canal que te resulte más cómodo.
            </p>
            <ContactForm />
          </Reveal>

          <Reveal delay={1}>
            <aside className="contact-aside">
              <div className="media-frame media-portrait contact-photo">
                <Image
                  src={images.portraitStage.src}
                  alt={images.portraitStage.alt}
                  width={images.portraitStage.width}
                  height={images.portraitStage.height}
                  sizes="(max-width: 900px) 92vw, 380px"
                  style={{
                    objectFit: "cover",
                    objectPosition: images.portraitStage.position,
                  }}
                />
              </div>
              <dl className="contact-detail">
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${siteConfig.email}`}>
                      {siteConfig.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>WhatsApp</dt>
                  <dd>
                    <a
                      href={siteConfig.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {siteConfig.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Ubicación</dt>
                  <dd>{siteConfig.address}</dd>
                </div>
                <div>
                  <dt>Contenido</dt>
                  <dd>
                    <Link href="/en-clave-pyme">En Clave PyME</Link>
                    {" · "}
                    <Link href="/off-the-record">Off the Record</Link>
                  </dd>
                </div>
              </dl>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
