import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { splitAccent } from "@/lib/hero-title";

type Props = {
  eyebrow: string;
  title: string;
  /** Palabra o frase del título que se resalta en dorado. */
  accent?: string;
  lead: string;
  /** Texto y acciones que van debajo del encabezado, en la columna de texto. */
  children?: ReactNode;
  /** Video o imagen de la columna derecha. */
  media: ReactNode;
  /** "vertical" para Shorts (9:16); "wide" para videos 16:9. */
  mediaShape: "vertical" | "wide";
};

/**
 * Primer bloque de una página sin hero: encabezado + contenido destacado
 * (último video o presentación) juntos, texto a la izquierda y media a la derecha.
 */
export function FeatureSplit({
  eyebrow,
  title,
  accent,
  lead,
  children,
  media,
  mediaShape,
}: Props) {
  return (
    <section className="section section-first">
      <div className="container">
        <Reveal>
          <div className={`feature-split feature-split--${mediaShape}`}>
            <div className="feature-split-copy">
              <header className="feature-intro">
                <p className="hx-eyebrow">{eyebrow}</p>
                <h1>
                  {splitAccent(title, accent).map((segment, position) =>
                    segment.accent ? (
                      <span key={position} className="hx-accent">
                        {segment.text}
                      </span>
                    ) : (
                      segment.text
                    )
                  )}
                </h1>
                <p className="hx-lead">{lead}</p>
              </header>
              {children}
            </div>
            {media}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
