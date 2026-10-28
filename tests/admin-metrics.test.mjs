import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAdminMetrics,
  daysBetween,
  todayIsoDate,
} from "../src/lib/admin-metrics.ts";

const TODAY = "2026-10-28";

const noticia = (id, date, published = true) => ({
  id,
  title: `Novedad ${id}`,
  date,
  published,
});

const novedad = (id, type, date, published = true) => ({
  id,
  type,
  title: `${type} ${id}`,
  date,
  href: `https://example.com/${id}`,
  published,
});

const build = (overrides = {}) =>
  buildAdminMetrics({ noticias: [], novedades: [], today: TODAY, ...overrides });

describe("daysBetween", () => {
  it("cuenta días enteros, también entre meses y años", () => {
    assert.equal(daysBetween("2026-10-21", "2026-10-28"), 7);
    assert.equal(daysBetween("2025-12-31", "2026-01-01"), 1);
    assert.equal(daysBetween("2026-10-28", "2026-10-28"), 0);
  });

  it("devuelve negativo si la segunda fecha es anterior", () => {
    assert.equal(daysBetween("2026-10-28", "2026-10-21"), -7);
  });
});

describe("todayIsoDate", () => {
  it("usa la zona horaria pedida, no la del servidor", () => {
    const instant = new Date("2026-10-28T01:30:00Z");
    assert.equal(todayIsoDate("America/Argentina/Buenos_Aires", instant), "2026-10-27");
    assert.equal(todayIsoDate("UTC", instant), "2026-10-28");
  });
});

describe("buildAdminMetrics: totales", () => {
  it("devuelve ceros y nulos sin contenido", () => {
    const metrics = build();
    assert.deepEqual(metrics.noticias, { published: 0, drafts: 0 });
    assert.equal(metrics.newsletter.published, 0);
    assert.equal(metrics.newsletter.latestDate, null);
    assert.equal(metrics.newsletter.cadenceDays, null);
    assert.equal(metrics.podcast.latestDate, null);
    assert.equal(metrics.lastPublication, null);
    assert.deepEqual(metrics.recent, []);
    assert.equal(metrics.activity.length, 6);
    assert.ok(metrics.activity.every((month) => month.total === 0));
  });

  it("separa novedades publicadas de borradores", () => {
    const metrics = build({
      noticias: [noticia("a", "2026-10-01"), noticia("b", "2026-10-02", false)],
    });
    assert.deepEqual(metrics.noticias, { published: 1, drafts: 1 });
  });

  it("cuenta newsletter y podcast publicados por separado", () => {
    const metrics = build({
      novedades: [
        novedad("n1", "newsletter", "2026-10-01"),
        novedad("n2", "newsletter", "2026-10-08", false),
        novedad("p1", "podcast", "2026-09-30"),
      ],
    });
    assert.equal(metrics.newsletter.published, 1);
    assert.equal(metrics.podcast.published, 1);
    assert.equal(metrics.newsletter.latestDate, "2026-10-01");
    assert.equal(metrics.podcast.latestDate, "2026-09-30");
  });
});

describe("buildAdminMetrics: última publicación", () => {
  it("toma la más reciente de cualquier tipo e informa los días transcurridos", () => {
    const metrics = build({
      noticias: [noticia("a", "2026-10-10")],
      novedades: [novedad("p1", "podcast", "2026-10-20")],
    });
    assert.deepEqual(metrics.lastPublication, {
      date: "2026-10-20",
      source: "podcast",
      daysAgo: 8,
    });
  });

  it("ignora borradores y fechas futuras", () => {
    const metrics = build({
      noticias: [noticia("draft", "2026-10-27", false), noticia("future", "2026-11-15")],
      novedades: [novedad("n1", "newsletter", "2026-10-01")],
    });
    assert.equal(metrics.lastPublication?.date, "2026-10-01");
    assert.equal(metrics.lastPublication?.daysAgo, 27);
  });

  it("publicar hoy da 0 días", () => {
    const metrics = build({ noticias: [noticia("a", TODAY)] });
    assert.equal(metrics.lastPublication?.daysAgo, 0);
  });
});

describe("buildAdminMetrics: cadencia de la newsletter", () => {
  it("promedia los días entre ediciones", () => {
    const metrics = build({
      novedades: ["2026-10-07", "2026-10-14", "2026-10-21", "2026-10-28"].map(
        (date, index) => novedad(`n${index}`, "newsletter", date)
      ),
    });
    assert.equal(metrics.newsletter.cadenceDays, 7);
  });

  it("es null con una sola edición", () => {
    const metrics = build({ novedades: [novedad("n1", "newsletter", "2026-10-07")] });
    assert.equal(metrics.newsletter.cadenceDays, null);
  });

  it("no se deja distorsionar por ediciones muy antiguas", () => {
    const recentWeekly = ["2026-09-23", "2026-09-30", "2026-10-07", "2026-10-14", "2026-10-21", "2026-10-28"];
    const metrics = build({
      novedades: ["2020-01-01", ...recentWeekly].map((date, index) =>
        novedad(`n${index}`, "newsletter", date)
      ),
    });
    assert.equal(metrics.newsletter.cadenceDays, 7);
  });
});

describe("buildAdminMetrics: actividad mensual", () => {
  it("devuelve la ventana de meses terminando en el actual, con etiquetas en español", () => {
    const metrics = build();
    assert.deepEqual(
      metrics.activity.map((month) => month.key),
      ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"]
    );
    assert.deepEqual(
      metrics.activity.map((month) => month.label),
      ["may", "jun", "jul", "ago", "sep", "oct"]
    );
  });

  it("cruza el cambio de año correctamente", () => {
    const metrics = build({ today: "2026-02-10", months: 4 });
    assert.deepEqual(
      metrics.activity.map((month) => month.key),
      ["2025-11", "2025-12", "2026-01", "2026-02"]
    );
  });

  it("acumula por tipo y total, y descarta lo que cae fuera de la ventana", () => {
    const metrics = build({
      noticias: [noticia("a", "2026-10-02"), noticia("old", "2025-01-01")],
      novedades: [
        novedad("n1", "newsletter", "2026-10-09"),
        novedad("n2", "newsletter", "2026-10-16"),
        novedad("p1", "podcast", "2026-09-01"),
      ],
    });
    const october = metrics.activity.at(-1);
    const september = metrics.activity.at(-2);
    assert.deepEqual(
      { noticia: october.noticia, newsletter: october.newsletter, podcast: october.podcast, total: october.total },
      { noticia: 1, newsletter: 2, podcast: 0, total: 3 }
    );
    assert.equal(september.podcast, 1);
    assert.equal(metrics.activity.reduce((sum, month) => sum + month.total, 0), 4);
  });
});

describe("buildAdminMetrics: tips", () => {
  it("cuenta los tips publicados y su última fecha, sin mezclarlos con el podcast", () => {
    const metrics = build({
      novedades: [
        novedad("t1", "tip", "2026-10-23"),
        novedad("t2", "tip", "2026-10-12"),
        novedad("t3", "tip", "2026-10-30"),
        novedad("t4", "tip", "2026-10-10", false),
        novedad("p1", "podcast", "2026-10-01"),
      ],
    });
    assert.deepEqual(metrics.tips, { published: 3, latestDate: "2026-10-23" });
    assert.equal(metrics.podcast.published, 1);
  });

  it("los tips cuentan en la actividad mensual y en la última publicación", () => {
    const metrics = build({
      novedades: [
        novedad("t1", "tip", "2026-10-23"),
        novedad("n1", "newsletter", "2026-10-20"),
      ],
    });
    assert.equal(metrics.activity.at(-1).tip, 1);
    assert.equal(metrics.activity.at(-1).total, 2);
    assert.equal(metrics.lastPublication.source, "tip");
  });

  it("sin tips devuelve ceros y fecha nula", () => {
    assert.deepEqual(build().tips, { published: 0, latestDate: null });
  });
});
describe("buildAdminMetrics: recientes", () => {
  it("mezcla tipos, ordena de más nuevo a más viejo y respeta el límite", () => {
    const metrics = build({
      recentLimit: 2,
      noticias: [noticia("a", "2026-10-10")],
      novedades: [
        novedad("n1", "newsletter", "2026-10-20"),
        novedad("p1", "podcast", "2026-10-15"),
      ],
    });
    assert.deepEqual(
      metrics.recent.map((item) => item.id),
      ["n1", "p1"]
    );
  });

  it("enlaza las novedades al sitio y el resto a su fuente", () => {
    const metrics = build({
      noticias: [noticia("nt-1", "2026-10-10")],
      novedades: [novedad("n1", "newsletter", "2026-10-05")],
    });
    const byId = Object.fromEntries(metrics.recent.map((item) => [item.id, item]));
    assert.equal(byId["nt-1"].href, "/novedades#nt-1");
    assert.equal(byId.n1.href, "https://example.com/n1");
  });

  it("desempata por título cuando coincide la fecha", () => {
    const metrics = build({
      noticias: [
        { id: "b", title: "Beta", date: "2026-10-10", published: true },
        { id: "a", title: "Alfa", date: "2026-10-10", published: true },
      ],
    });
    assert.deepEqual(
      metrics.recent.map((item) => item.id),
      ["a", "b"]
    );
  });
});

describe("buildAdminMetrics: datos inválidos", () => {
  it("cuenta los totales pero ignora fechas inválidas en las métricas de fecha", () => {
    const metrics = build({
      noticias: [noticia("bad", "no-es-fecha"), noticia("ok", "2026-10-10")],
      novedades: [novedad("n1", "newsletter", "2026-02-31")],
    });
    assert.equal(metrics.noticias.published, 2);
    assert.equal(metrics.newsletter.published, 1);
    assert.equal(metrics.newsletter.latestDate, null);
    assert.equal(metrics.recent.length, 1);
    assert.equal(metrics.lastPublication?.date, "2026-10-10");
  });

  it("acepta fechas con hora (ISO completo) usando solo el día", () => {
    const metrics = build({
      novedades: [novedad("n1", "newsletter", "2026-10-05T10:00:00.000Z")],
    });
    assert.equal(metrics.newsletter.latestDate, "2026-10-05");
  });

  it("rechaza un 'today' inválido", () => {
    assert.throws(() => build({ today: "28/10/2026" }), RangeError);
  });
});
