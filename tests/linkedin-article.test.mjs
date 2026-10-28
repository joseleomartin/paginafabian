import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractArticleImageUrl,
  extractArticlePublishedDate,
} from "../src/lib/linkedin-article.ts";

const NOW = new Date("2026-10-28T12:00:00Z");

const page = (jsonLd) =>
  `<html><head><script type="application/ld+json">${jsonLd}</script></head></html>`;

describe("extractArticlePublishedDate", () => {
  it("lee datePublished del JSON-LD y lo normaliza a ISO", () => {
    const html = page('{"@type":"Article","datePublished":"2026-10-04T11:39:38.000+00:00"}');
    assert.equal(extractArticlePublishedDate(html, NOW), "2026-10-04T11:39:38.000Z");
  });

  it("tolera espacios alrededor de los dos puntos", () => {
    const html = page('{"datePublished" : "2026-09-27T12:06:58.000+00:00"}');
    assert.equal(extractArticlePublishedDate(html, NOW), "2026-09-27T12:06:58.000Z");
  });

  it("devuelve null si la pÃ¡gina no trae fecha", () => {
    assert.equal(extractArticlePublishedDate("<html></html>", NOW), null);
    assert.equal(extractArticlePublishedDate(page('{"@type":"Article"}'), NOW), null);
  });

  it("devuelve null si la fecha no es vÃ¡lida", () => {
    assert.equal(extractArticlePublishedDate(page('{"datePublished":"ayer"}'), NOW), null);
  });

  it("rechaza fechas futuras, pero acepta hasta un dÃ­a de diferencia horaria", () => {
    assert.equal(extractArticlePublishedDate(page('{"datePublished":"2026-12-01T00:00:00Z"}'), NOW), null);
    assert.equal(
      extractArticlePublishedDate(page('{"datePublished":"2026-10-29T06:00:00Z"}'), NOW),
      "2026-10-29T06:00:00.000Z"
    );
  });

  it("usa la primera fecha cuando hay varias", () => {
    const html = page('{"datePublished":"2026-10-04T00:00:00Z"}') + page('{"datePublished":"2026-10-05T00:00:00Z"}');
    assert.equal(extractArticlePublishedDate(html, NOW), "2026-10-04T00:00:00.000Z");
  });
});

describe("extractArticleImageUrl", () => {
  const COVER = "https://media.licdn.com/dms/image/v2/abc/article-cover_image-shrink_720_1280/0/1?e=2147483647&v=beta&t=xyz";

  it("lee og:image y decodifica &amp;", () => {
    const html = `<head><meta property="og:image" content="${COVER.replaceAll("&", "&amp;")}"></head>`;
    assert.equal(extractArticleImageUrl(html), COVER);
  });

  it("funciona si content aparece antes que property", () => {
    const html = `<meta content="${COVER}" property="og:image">`;
    assert.equal(extractArticleImageUrl(html), COVER);
  });

  it("ignora otros meta y devuelve null si no hay og:image", () => {
    const html = '<meta property="og:title" content="Hola"><meta name="description" content="x">';
    assert.equal(extractArticleImageUrl(html), null);
  });

  it("rechaza URLs que no son https o no son válidas", () => {
    assert.equal(extractArticleImageUrl('<meta property="og:image" content="http://a.com/x.png">'), null);
    assert.equal(extractArticleImageUrl('<meta property="og:image" content="javascript:alert(1)">'), null);
    assert.equal(extractArticleImageUrl('<meta property="og:image" content="">'), null);
  });
});