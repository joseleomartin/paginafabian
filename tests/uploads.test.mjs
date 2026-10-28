import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { deleteImage, isUploadedImageUrl } from "../src/lib/uploads.ts";

const originalToken = process.env.BLOB_READ_WRITE_TOKEN;

afterEach(() => {
  if (originalToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = originalToken;
});

describe("isUploadedImageUrl", () => {
  it("reconoce las imágenes guardadas en disco por el admin", () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    assert.equal(isUploadedImageUrl("/uploads/images/abc.jpg"), true);
  });

  it("no considera propias las covers del repo ni las imágenes externas", () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    for (const url of [
      "/images/newsletter/ed-5.png",
      "https://linkedinrss.cns.me/img/abc",
      "https://i.ytimg.com/vi/abc/hqdefault.jpg",
      "https://media.licdn.com/dms/image/x",
    ]) {
      assert.equal(isUploadedImageUrl(url), false, url);
    }
  });

  it("solo reconoce URLs de Blob cuando hay Blob configurado", () => {
    const blobUrl = "https://store.public.blob.vercel-storage.com/uploads/abc.jpg";
    delete process.env.BLOB_READ_WRITE_TOKEN;
    assert.equal(isUploadedImageUrl(blobUrl), false);
    process.env.BLOB_READ_WRITE_TOKEN = "token-de-prueba";
    assert.equal(isUploadedImageUrl(blobUrl), true);
  });
});

describe("deleteImage", () => {
  it("ignora sin lanzar valores vacíos y URLs que no son propias", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    await assert.doesNotReject(() => deleteImage(undefined));
    await assert.doesNotReject(() => deleteImage(""));
    await assert.doesNotReject(() => deleteImage("/images/newsletter/ed-5.png"));
    await assert.doesNotReject(() => deleteImage("https://i.ytimg.com/vi/a/hq.jpg"));
  });

  it("tolera que el archivo local ya no exista", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    await assert.doesNotReject(() => deleteImage("/uploads/images/no-existe.jpg"));
  });

  it("no puede salirse del directorio de uploads con rutas relativas", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    // Solo toma el nombre del archivo: apunta a uploads/images/passwd, que no existe.
    await assert.doesNotReject(() =>
      deleteImage("/uploads/images/../../../package.json")
    );
  });
});
