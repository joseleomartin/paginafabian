import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BLOB_JSON_CACHE_SECONDS,
  versionedBlobUrl,
} from "../src/lib/blob-url.ts";

const URL_BASE = "https://abc123.public.blob.vercel-storage.com/novedades.json";

describe("versionedBlobUrl", () => {
  it("agrega la fecha de subida como versión", () => {
    const uploadedAt = new Date("2026-10-28T16:00:00.000Z");
    assert.equal(
      versionedBlobUrl(URL_BASE, uploadedAt),
      `${URL_BASE}?v=${uploadedAt.getTime()}`
    );
  });

  it("cambia la URL cuando el archivo se vuelve a subir", () => {
    const first = versionedBlobUrl(URL_BASE, new Date("2026-10-28T16:00:00Z"));
    const second = versionedBlobUrl(URL_BASE, new Date("2026-10-28T16:00:05Z"));
    assert.notEqual(first, second);
  });

  it("es estable mientras el archivo no cambia (aprovecha el cache)", () => {
    const uploadedAt = new Date("2026-10-28T16:00:00Z");
    assert.equal(
      versionedBlobUrl(URL_BASE, uploadedAt),
      versionedBlobUrl(URL_BASE, new Date(uploadedAt.getTime()))
    );
  });

  it("reemplaza una versión previa en vez de duplicarla", () => {
    const url = versionedBlobUrl(`${URL_BASE}?v=1`, new Date(5000));
    assert.equal(url, `${URL_BASE}?v=5000`);
  });

  it("conserva otros parámetros de la URL", () => {
    const url = versionedBlobUrl(`${URL_BASE}?foo=bar`, new Date(5000));
    assert.equal(new URL(url).searchParams.get("foo"), "bar");
    assert.equal(new URL(url).searchParams.get("v"), "5000");
  });

  it("devuelve la URL original si la fecha es inválida", () => {
    assert.equal(versionedBlobUrl(URL_BASE, new Date("no-es-fecha")), URL_BASE);
  });
});

describe("BLOB_JSON_CACHE_SECONDS", () => {
  it("respeta el mínimo de 60 segundos de Vercel Blob", () => {
    assert.ok(BLOB_JSON_CACHE_SECONDS >= 60);
  });
});
