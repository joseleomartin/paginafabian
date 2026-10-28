import Image from "next/image";
import { ArrowUpRightIcon } from "@/components/ArrowUpRightIcon";
import { Reveal } from "@/components/Reveal";
import { formatDate } from "@/lib/format-date";
import type { Novedad } from "@/lib/novedades";

type Props = {
  items: Novedad[];
  eyebrow: string;
  title: string;
  emptyHint?: string;
  variant?: "list" | "cards";
};

export function NovedadesList({
  items,
  eyebrow,
  title,
  emptyHint,
  variant = "list",
}: Props) {
  if (items.length === 0) {
    return null;
  }

  const isCards = variant === "cards";

  return (
    <section
      className={
        isCards ? "section section-tight" : "section section-warm"
      }
    >
      <div className="container">
        <Reveal>
          <div className="section-head">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            {emptyHint ? <p className="lead">{emptyHint}</p> : null}
          </div>
        </Reveal>

        {isCards ? (
          <div className="content-cards">
            {items.map((item, index) => {
              const cta =
                item.type === "newsletter" ? "Leer edición" : "Ver episodio";
              const badge =
                item.badge ||
                (item.type === "newsletter" ? "Newsletter" : "Podcast");
              const imageSrc =
                item.imageUrl ||
                (item.youtubeId
                  ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`
                  : null);

              return (
                <Reveal
                  key={item.id}
                  delay={
                    index === 0
                      ? undefined
                      : (Math.min(index, 3) as 1 | 2 | 3)
                  }
                >
                  <article className="content-card">
                    <a
                      href={item.href}
                      className="content-card-media"
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt=""
                          fill
                          sizes="(max-width: 700px) 100vw, 33vw"
                          className="content-card-img"
                        />
                      ) : (
                        <span className="content-card-fallback" />
                      )}
                    </a>
                    <div className="content-card-body">
                      <span className="content-card-badge">{badge}</span>
                      <h3>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.title}
                        </a>
                      </h3>
                      <p>{item.summary}</p>
                      <time dateTime={item.date}>{formatDate(item.date)}</time>
                      <a
                        href={item.href}
                        className="btn btn-primary content-card-cta"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {cta}
                        <ArrowUpRightIcon />
                      </a>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="novedades-list">
            {items.map((item, index) => (
              <Reveal
                key={item.id}
                delay={
                  index === 0 ? undefined : (Math.min(index, 3) as 1 | 2 | 3)
                }
              >
                <article className="novedad-item">
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                  <h3>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
                    {item.type === "newsletter"
                      ? "Leer edición"
                      : "Ver episodio"}
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
