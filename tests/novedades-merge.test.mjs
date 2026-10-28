import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  editionNumber,
  fingerprint,
  mergeNew,
  PLACEHOLDER_SUMMARY,
} from "../src/lib/novedades-merge.ts";

function newsletter(overrides = {}) {
  return {
    id: "li-30-x",
    type: "newsletter",
    title: "#30. Título",
    summary: PLACEHOLDER_SUMMARY,
    date: "2026-10-25",
    href: "https://www.linkedin.com/pulse/30-x",
    badge: "En Clave PyME",
    published: true,
    ...overrides,
  };
}

function episode(overrides = {}) {
  return {
    id: "yt-abc",
    type: "podcast",
    title: "Off the Record - Ep 7",
    summary: "Conversaciones",
    date: "2026-08-01",
    href: "https://www.youtube.com/watch?v=abc",
    youtubeId: "abc",
    imageUrl: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
    badge: "Off the Record",
    published: true,
    ...overrides,
  };
}

describe("editionNumber", () => {
  it("extrae el número de edición", () => {
    assert.equal(editionNumber("#12. Algo"), 12);
    assert.equal(editionNumber("# 7. Algo"), 7);
  });

  it("devuelve null sin número", () => {
    assert.equal(editionNumber("Sin número"), null);
  });
});

describe("fingerprint", () => {
  it("unifica la misma edición aunque cambie dominio o slug", () => {
    const a = newsletter({ href: "https://es.linkedin.com/pulse/30-uno" });
    const b = newsletter({ href: "https://www.linkedin.com/pulse/30-dos" });
    assert.equal(fingerprint(a), fingerprint(b));
  });

  it("usa el id de YouTube para podcasts", () => {
    assert.equal(fingerprint(episode()), "yt:abc");
  });
});

describe("mergeNew", () => {
  it("agrega una edición nueva", () => {
    const existing = [newsletter()];
    const incoming = [
      newsletter({
        id: "li-31-y",
        title: "#31. Nueva",
        href: "https://www.linkedin.com/pulse/31-y",
        date: "2026-11-01",
      }),
    ];
    const result = mergeNew(existing, incoming);
    assert.equal(result.added, 1);
    assert.equal(result.changed, true);
    assert.equal(result.items.length, 2);
  });

  it("no pisa fecha, título, link ni cover local ya guardados", () => {
    const existing = [
      newsletter({
        date: "2026-10-25",
        imageUrl: "/images/newsletter/ed-30.jpg",
      }),
    ];
    const incoming = [
      newsletter({
        title: "#30. Título distinto",
        date: "2026-10-28",
        href: "https://es.linkedin.com/pulse/30-otro",
        imageUrl: "https://linkedinrss.cns.me/img/abc",
      }),
    ];
    const result = mergeNew(existing, incoming);
    assert.equal(result.changed, false);
    assert.equal(result.added, 0);
    assert.equal(result.items, existing);
    assert.equal(result.items[0].date, "2026-10-25");
    assert.equal(result.items[0].imageUrl, "/images/newsletter/ed-30.jpg");
  });

  it("completa imagen y resumen faltantes", () => {
    const existing = [newsletter({ imageUrl: undefined })];
    const incoming = [
      newsletter({
        summary: "Resumen real de la edición",
        imageUrl: "https://linkedinrss.cns.me/img/abc",
      }),
    ];
    const result = mergeNew(existing, incoming);
    assert.equal(result.changed, true);
    assert.equal(result.added, 0);
    assert.equal(result.items[0].summary, "Resumen real de la edición");
    assert.equal(
      result.items[0].imageUrl,
      "https://linkedinrss.cns.me/img/abc"
    );
  });

  it("respeta published=false (despublicado desde el admin)", () => {
    const existing = [episode({ published: false })];
    const result = mergeNew(existing, [episode()]);
    assert.equal(result.items[0].published, false);
  });

  it("es idempotente con un feed vacío", () => {
    const existing = [newsletter(), episode()];
    const result = mergeNew(existing, []);
    assert.equal(result.changed, false);
    assert.equal(result.items, existing);
  });
});
