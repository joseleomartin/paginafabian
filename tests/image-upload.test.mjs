import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_IMAGE_BYTES,
  detectImageKind,
  validateImageBytes,
} from "../src/lib/image-upload.ts";

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
const webp = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0x10, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);

describe("detectImageKind", () => {
  it("reconoce JPEG, PNG y WebP por su firma", () => {
    assert.equal(detectImageKind(jpeg)?.extension, "jpg");
    assert.equal(detectImageKind(png)?.extension, "png");
    assert.equal(detectImageKind(webp)?.extension, "webp");
  });

  it("rechaza RIFF que no es WebP (por ejemplo WAV)", () => {
    const wav = Uint8Array.from([
      0x52, 0x49, 0x46, 0x46, 0x10, 0, 0, 0, 0x57, 0x41, 0x56, 0x45,
    ]);
    assert.equal(detectImageKind(wav), null);
  });

  it("rechaza SVG, HTML y archivos truncados", () => {
    const encoder = new TextEncoder();
    assert.equal(detectImageKind(encoder.encode("<svg onload=alert(1)>")), null);
    assert.equal(detectImageKind(encoder.encode("<html></html>")), null);
    assert.equal(detectImageKind(Uint8Array.from([0xff, 0xd8])), null);
    assert.equal(detectImageKind(new Uint8Array(0)), null);
  });
});

describe("validateImageBytes", () => {
  it("acepta una imagen válida y devuelve su tipo", () => {
    const result = validateImageBytes(jpeg);
    assert.equal(result.ok, true);
    assert.equal(result.kind.mime, "image/jpeg");
  });

  it("rechaza archivos vacíos", () => {
    assert.equal(validateImageBytes(new Uint8Array(0)).ok, false);
  });

  it("rechaza imágenes que superan el máximo", () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(jpeg);
    assert.equal(validateImageBytes(big).ok, false);
  });

  it("acepta una imagen justo en el límite", () => {
    const atLimit = new Uint8Array(MAX_IMAGE_BYTES);
    atLimit.set(jpeg);
    assert.equal(validateImageBytes(atLimit).ok, true);
  });

  it("rechaza un contenido que no es imagen aunque se declare como tal", () => {
    const fake = new TextEncoder().encode("MZ-ejecutable.jpg");
    const result = validateImageBytes(fake);
    assert.equal(result.ok, false);
    assert.match(result.error, /JPG, PNG o WebP/);
  });
});
