import { Reveal } from "@/components/Reveal";
import type { Novedad } from "@/lib/novedades";

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

type Props = {
  items: Novedad[];
  eyebrow: string;
  title: string;
  emptyHint?: string;
};

export function NovedadesList({ items, eyebrow, title, emptyHint }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="section section-warm">
      <div className="container">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {emptyHint ? <p className="lead">{emptyHint}</p> : null}
        </Reveal>
        <div className="novedades-list">
          {items.map((item, index) => (
            <Reveal
              key={item.id}
              delay={index === 0 ? undefined : ((Math.min(index, 3) as 1 | 2 | 3))}
            >
              <article className="novedad-item">
                <time dateTime={item.date}>{formatDate(item.date)}</time>
                <h3>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                <p>{item.summary}</p>
                <a
                  href={item.href}
                  className="text-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.type === "newsletter" ? "Leer edición" : "Ver episodio"}
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
