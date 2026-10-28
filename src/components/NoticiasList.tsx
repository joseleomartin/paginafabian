import Image from "next/image";
import { ArrowUpRightIcon } from "@/components/ArrowUpRightIcon";
import { Reveal } from "@/components/Reveal";
import { formatDate } from "@/lib/format-date";
import { splitParagraphs, type Noticia } from "@/lib/noticias-model";

type Props = {
  items: readonly Noticia[];
};

export function NoticiasList({ items }: Props) {
  return (
    <div className="noticias-grid">
      {items.map((item, index) => (
        <Reveal
          key={item.id}
          delay={index === 0 ? undefined : (Math.min(index, 3) as 1 | 2 | 3)}
        >
          <article id={item.id} className="noticia-card">
            {item.imageUrl ? (
              <div className="noticia-media">
                {/* Sin dimensiones reales: el ancho/alto solo reservan espacio, el CSS respeta la proporción original. */}
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={1200}
                  height={800}
                  sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  className="noticia-img"
                />
              </div>
            ) : null}
            <div className="noticia-body">
              <time dateTime={item.date}>{formatDate(item.date)}</time>
              <h2>{item.title}</h2>
              {splitParagraphs(item.body).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
              {item.href ? (
                <a
                  href={item.href}
                  className="btn btn-primary content-card-cta noticia-cta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver más
                  <ArrowUpRightIcon />
                </a>
              ) : null}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
