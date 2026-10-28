import type { ReactNode } from "react";
import { splitAccent } from "@/lib/hero-title";

type Props = {
  eyebrow: string;
  title: string;
  /** Palabra o frase del título que se resalta en dorado. */
  accent?: string;
  lead: string;
  actions?: ReactNode;
  /** Imagen protagonista de la página. */
  children: ReactNode;
};

export function PageHero({ eyebrow, title, accent, lead, actions, children }: Props) {
  return (
    <header className="hx" aria-label={eyebrow}>
      <div className="container hx-inner">
        <div className="hx-copy">
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
          {actions ? <div className="hx-actions">{actions}</div> : null}
        </div>
        <div className="hx-visual">{children}</div>
      </div>
    </header>
  );
}
