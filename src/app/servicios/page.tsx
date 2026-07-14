import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { services, siteConfig } from "@/lib/content";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Cómo trabajo",
  description:
    "CFO Fractional, planificación financiera, coaching y charlas para dueños de PyMEs.",
  alternates: { canonical: `${siteConfig.url}/servicios` },
};

export default function ServiciosPage() {
  return (
    <>
      <PageHero
        eyebrow="Cómo trabajo"
        title="Claridad financiera para dueños que deciden"
        lead="Acompañamiento en caja, costos, presupuesto y estrategia, con alguien que lee los números en clave de negocio."
        image={images.stageTalk}
      />

      <section className="section">
        <div className="container">
          {services.map((service, index) => (
            <Reveal
              key={service.slug}
              delay={(Math.min((index % 3) + 1, 3) as 1 | 2 | 3)}
            >
              <article id={service.slug} className="service-detail">
                <div className="split">
                  <div>
                    <p className="eyebrow">0{index + 1}</p>
                    <h2>{service.title}</h2>
                    <p className="lead">{service.summary}</p>
                  </div>
                  <div>
                    <p>{service.description}</p>
                    <ul className="credential-list">
                      {service.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cta-final">
        <div className="container">
          <Reveal>
            <h2>¿Empezamos por una conversación?</h2>
            <p className="lead">
              Contame tu contexto. Vemos si tiene sentido trabajar juntos.
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
