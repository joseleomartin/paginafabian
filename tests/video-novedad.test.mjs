import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeNew } from "../src/lib/novedades-merge.ts";
import {
  cleanVideoTitle,
  videoToNovedad,
  youtubeThumbnailUrl,
} from "../src/lib/video-novedad.ts";

const TIP_SOURCE = {
  type: "tip",
  badge: "Tips PyMEs",
  summary: "Tips y herramientas para PyMEs y emprendedores.",
  thumbnail: "maxresdefault",
};

const PODCAST_SOURCE = {
  type: "podcast",
  badge: "Off the Record",
  summary: "Conversaciones más allá del discurso oficial.",
  thumbnail: "hqdefault",
};

const video = {
  id: "FexO2-vDdms",
  title: "No me la contaron. Lo vivo todos los días.",
  url: "https://www.youtube.com/shorts/FexO2-vDdms",
  published: "2026-10-23T14:05:11+00:00",
};

describe("youtubeThumbnailUrl", () => {
  it("arma la URL de la miniatura según la variante", () => {
    assert.equal(
      youtubeThumbnailUrl("abc", "oar2"),
      "https://i.ytimg.com/vi/abc/oar2.jpg"
    );
    assert.equal(
      youtubeThumbnailUrl("abc", "maxresdefault"),
      "https://i.ytimg.com/vi/abc/maxresdefault.jpg"
    );
    assert.equal(
      youtubeThumbnailUrl("abc", "hqdefault"),
      "https://i.ytimg.com/vi/abc/hqdefault.jpg"
    );
  });
});

describe("videoToNovedad", () => {
  it("convierte un Short en un tip publicado con portada del Short", () => {
    assert.deepEqual(videoToNovedad(video, TIP_SOURCE), {
      id: "yt-FexO2-vDdms",
      type: "tip",
      title: "No me la contaron. Lo vivo todos los días.",
      summary: "Tips y herramientas para PyMEs y emprendedores.",
      date: "2026-10-23",
      href: "https://www.youtube.com/shorts/FexO2-vDdms",
      youtubeId: "FexO2-vDdms",
      imageUrl: "https://i.ytimg.com/vi/FexO2-vDdms/maxresdefault.jpg",
      badge: "Tips PyMEs",
      published: true,
    });
  });

  it("convierte un episodio de podcast con miniatura horizontal", () => {
    const item = videoToNovedad(video, PODCAST_SOURCE);
    assert.equal(item.type, "podcast");
    assert.equal(item.badge, "Off the Record");
    assert.equal(item.imageUrl, "https://i.ytimg.com/vi/FexO2-vDdms/hqdefault.jpg");
  });
});

describe("tips en el store de novedades", () => {
  it("agrega los tips nuevos sin tocar newsletters ni podcast", () => {
    const stored = [
      {
        id: "li-30-x",
        type: "newsletter",
        title: "#30. Título",
        summary: "Resumen",
        date: "2026-10-25",
        href: "https://www.linkedin.com/pulse/30-x",
        published: true,
      },
    ];
    const result = mergeNew(stored, [videoToNovedad(video, TIP_SOURCE)]);
    assert.equal(result.added, 1);
    assert.equal(result.items.length, 2);
  });

  it("no duplica un tip ya guardado ni pisa su visibilidad", () => {
    const hidden = { ...videoToNovedad(video, TIP_SOURCE), published: false };
    const result = mergeNew([hidden], [videoToNovedad(video, TIP_SOURCE)]);
    assert.equal(result.added, 0);
    assert.equal(result.items[0].published, false);
  });
});

describe("cleanVideoTitle", () => {
  it("quita hashtags y normaliza espacios", () => {
    assert.equal(cleanVideoTitle("Punto de Equlibrio  #cfofractional"), "Punto de Equlibrio");
    assert.equal(cleanVideoTitle("Margen vs  Mark Up #cfofractional #pymes"), "Margen vs Mark Up");
  });

  it("deja intactos los títulos sin hashtags", () => {
    assert.equal(cleanVideoTitle("¿Proceso mata innovación?"), "¿Proceso mata innovación?");
  });

  it("conserva el # que no es hashtag (p. ej. #1 como número)", () => {
    assert.equal(cleanVideoTitle("Tip # uno"), "Tip # uno");
  });

  it("si solo hay hashtags devuelve el título original", () => {
    assert.equal(cleanVideoTitle("#cfofractional"), "#cfofractional");
  });
});