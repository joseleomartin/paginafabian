/**
 * Reduce en el navegador las fotos pesadas (típicas de celular) antes de subirlas,
 * para respetar el límite de tamaño del servidor. Si algo falla, devuelve el
 * archivo original y la validación del servidor decide.
 */

const MAX_DIMENSION_PX = 1600;
const SKIP_RESIZE_BELOW_BYTES = 1.5 * 1024 * 1024;
const OUTPUT_QUALITY = 0.85;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function replaceExtension(name: string, extension: string): string {
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base || "imagen"}.${extension}`;
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (!SUPPORTED_TYPES.has(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longestSide = Math.max(bitmap.width, bitmap.height);
    const needsResize = longestSide > MAX_DIMENSION_PX;

    if (!needsResize && file.size <= SKIP_RESIZE_BELOW_BYTES) {
      bitmap.close();
      return file;
    }

    const scale = needsResize ? MAX_DIMENSION_PX / longestSide : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    // PNG se conserva con transparencia (WebP); el resto va a JPEG sobre blanco.
    const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";
    if (outputType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await canvasToBlob(canvas, outputType, OUTPUT_QUALITY);
    // Algunos navegadores ignoran WebP y devuelven PNG: en ese caso no vale la pena.
    if (!blob || blob.type !== outputType || blob.size >= file.size) return file;

    const extension = outputType === "image/webp" ? "webp" : "jpg";
    return new File([blob], replaceExtension(file.name, extension), {
      type: outputType,
    });
  } catch {
    return file;
  }
}
