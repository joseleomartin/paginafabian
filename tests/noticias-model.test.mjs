import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NOTICIA_BODY_MAX,
  NOTICIA_TITLE_MAX,
  createNoticiaId,
  normalizeNoticias,
  sortNoticias,
  splitParagraphs,
  validateNoticiaInput,
} from "../src/lib/noticias-model.ts";

const valid = {
  title: "  Nuevo taller  ",
  body: "Texto de la novedad.",
  date: "2026-10-28",
  href: "",
  published: true,
};

describe("validateNoticiaInput", () => {
  it("acepta datos válidos y recorta espacios", () => {
    const result = validateNoticiaInput(valid);
    assert.equal(result.ok, true);
    assert.equal(result.value.title, "Nuevo taller");
    assert.equal(result.value.href, undefined);
    assert.equal(result.value.published, true);
  });

  it("exige título y texto", () => {
    assert.equal(validateNoticiaInput({ ...valid, title: "  " }).ok, false);
    assert.equal(validateNoticiaInput({ ...valid, body: "" }).ok, false);
  });

  it("rechaza título y texto demasiado largos", () => {
    const longTitle = "a".repeat(NOTICIA_TITLE_MAX + 1);
    const longBody = "a".repeat(NOTICIA_BODY_MAX + 1);
    assert.equal(validateNoticiaInput({ ...valid, title: longTitle }).ok, false);
    assert.equal(validateNoticiaInput({ ...valid, body: longBody }).ok, false);
  });

  it("rechaza fechas inexistentes o con otro formato", () => {
    for (const date of ["", "28/10/2026", "2026-02-31", "2026-13-01"]) {
      assert.equal(validateNoticiaInput({ ...valid, date }).ok, false, date);
    }
  });

  it("solo acepta enlaces http(s)", () => {
    assert.equal(
      validateNoticiaInput({ ...valid, href: "https://example.com/x" }).ok,
      true
    );
    for (const href of ["javascript:alert(1)", "ftp://x.com", "no es url"]) {
      assert.equal(validateNoticiaInput({ ...valid, href }).ok, false, href);
    }
  });

  it("interpreta published=false (checkbox o texto) como borrador", () => {
    assert.equal(
      validateNoticiaInput({ ...valid, published: false }).value.published,
      false
    );
    assert.equal(
      validateNoticiaInput({ ...valid, published: "false" }).value.published,
      false
    );
  });

  it("ignora valores que no son texto sin romperse", () => {
    assert.equal(validateNoticiaInput({ ...valid, title: 42 }).ok, false);
    assert.equal(validateNoticiaInput({}).ok, false);
  });
});

describe("sortNoticias / normalizeNoticias", () => {
  const base = { body: "x", published: true };

  it("ordena por fecha descendente y desempata por título", () => {
    const sorted = sortNoticias([
      { ...base, id: "1", title: "B", date: "2026-01-01" },
      { ...base, id: "2", title: "A", date: "2026-03-01" },
      { ...base, id: "3", title: "A", date: "2026-01-01" },
    ]);
    assert.deepEqual(
      sorted.map((item) => item.id),
      ["2", "3", "1"]
    );
  });

  it("descarta entradas corruptas y tolera entradas que no son un array", () => {
    assert.deepEqual(normalizeNoticias(null), []);
    assert.deepEqual(normalizeNoticias({}), []);
    const items = normalizeNoticias([
      { ...base, id: "ok", title: "T", date: "2026-01-01" },
      { id: "sin-titulo" },
      "texto",
      null,
    ]);
    assert.deepEqual(
      items.map((item) => item.id),
      ["ok"]
    );
  });
});

describe("splitParagraphs / createNoticiaId", () => {
  it("separa párrafos por líneas en blanco y descarta vacíos", () => {
    assert.deepEqual(splitParagraphs("Uno\n\n\nDos\nsigue\n\n  \n"), [
      "Uno",
      "Dos\nsigue",
    ]);
  });

  it("entiende saltos CRLF (formularios multipart) y líneas con espacios", () => {
    assert.deepEqual(splitParagraphs("Uno\r\n\r\nDos\r\n \r\nTres"), [
      "Uno",
      "Dos",
      "Tres",
    ]);
  });

  it("guarda el texto con LF aunque llegue con CRLF", () => {
    const result = validateNoticiaInput({ ...valid, body: "A\r\n\r\nB" });
    assert.equal(result.value.body, "A\n\nB");
  });

  it("genera ids únicos con prefijo", () => {
    const ids = new Set(Array.from({ length: 50 }, createNoticiaId));
    assert.equal(ids.size, 50);
    assert.ok([...ids].every((id) => id.startsWith("nt-")));
  });
});
