import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractArticlePublishedDate } from "../src/lib/linkedin-article-date.ts";

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

  it("devuelve null si la página no trae fecha", () => {
    assert.equal(extractArticlePublishedDate("<html></html>", NOW), null);
    assert.equal(extractArticlePublishedDate(page('{"@type":"Article"}'), NOW), null);
  });

  it("devuelve null si la fecha no es válida", () => {
    assert.equal(extractArticlePublishedDate(page('{"datePublished":"ayer"}'), NOW), null);
  });

  it("rechaza fechas futuras, pero acepta hasta un día de diferencia horaria", () => {
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
