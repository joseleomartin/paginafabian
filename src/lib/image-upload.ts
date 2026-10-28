/**
 * Validación de imágenes subidas desde el admin.
 * Módulo puro: confía en el contenido real del archivo (firma de bytes),
 * no en el nombre ni en el Content-Type que declara el cliente.
 */

/** Vercel limita el cuerpo de una función a ~4,5 MB; dejamos margen. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type ImageKind = {
  mime: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

const JPEG: ImageKind = { mime: "image/jpeg", extension: "jpg" };
const PNG: ImageKind = { mime: "image/png", extension: "png" };
const WEBP: ImageKind = { mime: "image/webp", extension: "webp" };

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

/** Devuelve el tipo real de imagen soportado, o null si no lo es. */
export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return JPEG;
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return PNG;
  }
  // WebP: "RIFF" <tamaño> "WEBP"
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return WEBP;
  }
  return null;
}

export function validateImageBytes(
  bytes: Uint8Array
): { ok: true; kind: ImageKind } | { ok: false; error: string } {
  if (bytes.byteLength === 0) {
    return { ok: false, error: "La imagen está vacía." };
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    const limitMb = MAX_IMAGE_BYTES / (1024 * 1024);
    return {
      ok: false,
      error: `La imagen supera el máximo de ${limitMb} MB.`,
    };
  }
  const kind = detectImageKind(bytes);
  if (!kind) {
    return {
      ok: false,
      error: "Formato no soportado. Usá una imagen JPG, PNG o WebP.",
    };
  }
  return { ok: true, kind };
}
