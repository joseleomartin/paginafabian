import type { Metadata } from "next";
import Link from "next/link";
import { NoticiasList } from "@/components/NoticiasList";
import { HeroMedia } from "@/components/hero/HeroMedia";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/content";
import { images } from "@/lib/images";
import { getPublishedNoticias } from "@/lib/noticias";

export const dynamic = "force-dynamic";

const description =
  "Prensa de Fabián Canoni: charlas, eventos, publicaciones y anuncios sobre finanzas para PyMEs.";

export const metadata: Metadata = {
  title: "Prensa",
  description,
  alternates: { canonical: `${siteConfig.url}/prensa` },
  openGraph: {
    title: `Prensa | ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/prensa`,
  },
};

export default async function PrensaPage() {
  const noticias = await getPublishedNoticias();

  return (
    <>
      <PageHero
        eyebrow="Prensa"
        title="Lo último, de primera mano"
        accent="primera mano"
        lead="Charlas, eventos, publicaciones y anuncios para seguir de cerca el trabajo con PyMEs."
        actions={
          <>
            <Link href="/en-clave-pyme" className="btn btn-primary">
              Newsletter
            </Link>
            <Link href="/off-the-record" className="btn btn-secondary">
              Podcast
            </Link>
          </>
        }
      >
        <HeroMedia image={images.speakerBand} />
      </PageHero>

      <section className="section">
        <div className="container">
          {noticias.length > 0 ? (
            <NoticiasList items={noticias} />
          ) : (
            <Reveal>
              <div className="noticias-empty">
                <h2>Pronto vas a encontrar contenido de prensa acá</h2>
                <p>
                  Mientras tanto, podés leer la newsletter semanal o escuchar el
                  podcast.
                </p>
                <div className="btn-group">
                  <Link href="/en-clave-pyme" className="btn btn-primary">
                    Ir a la newsletter
                  </Link>
                  <Link href="/off-the-record" className="btn btn-secondary">
                    Ir al podcast
                  </Link>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="cta-final">
        <div className="container">
          <Reveal>
            <h2>¿Querés conversar sobre tu empresa?</h2>
            <p className="lead">
              Contame dónde estás hoy y qué decisión necesitás tomar con más
              claridad.
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
