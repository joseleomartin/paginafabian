import { del, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ImageKind } from "@/lib/image-upload";

/**
 * Almacenamiento de imágenes subidas desde el admin (compartido por todas las secciones).
 * Con BLOB_READ_WRITE_TOKEN usa Vercel Blob; sin él, el disco local (solo desarrollo).
 */

const LOCAL_URL_PREFIX = "/uploads/images/";
const LOCAL_DIR = path.join(process.cwd(), "public", "uploads", "images");
const BLOB_PREFIX = "uploads/";

/** El storage no permite escribir (p. ej. Vercel sin Blob configurado). */
export class StorageUnavailableError extends Error {
  constructor() {
    super(
      "No hay almacenamiento configurado. Definí BLOB_READ_WRITE_TOKEN en Vercel para poder guardar cambios e imágenes."
    );
    this.name = "StorageUnavailableError";
  }
}

export function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Falla temprano y con un error claro si no se puede persistir nada. */
export function assertWritable(): void {
  if (!hasBlobStorage() && process.env.VERCEL) {
    throw new StorageUnavailableError();
  }
}

export function isMissingFile(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

/** ¿La URL corresponde a una imagen que subió el admin (y por lo tanto podemos borrar)? */
export function isUploadedImageUrl(imageUrl: string): boolean {
  return (
    imageUrl.startsWith(LOCAL_URL_PREFIX) ||
    (hasBlobStorage() && imageUrl.includes(`/${BLOB_PREFIX}`))
  );
}

/** Guarda la imagen y devuelve su URL pública. */
export async function saveImage(
  bytes: Uint8Array,
  kind: ImageKind
): Promise<string> {
  const fileName = `${randomUUID()}.${kind.extension}`;

  if (hasBlobStorage()) {
    const blob = await put(`${BLOB_PREFIX}${fileName}`, Buffer.from(bytes), {
      access: "public",
      contentType: kind.mime,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  assertWritable();
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, fileName), bytes);
  return `${LOCAL_URL_PREFIX}${fileName}`;
}

/**
 * Borra una imagen subida por el admin. Ignora cualquier otra URL (covers del
 * repo, imágenes de LinkedIn/YouTube), así que es seguro llamarla siempre.
 * Best-effort: nunca lanza.
 */
export async function deleteImage(imageUrl: string | undefined): Promise<void> {
  if (!imageUrl || !isUploadedImageUrl(imageUrl)) return;
  try {
    if (imageUrl.startsWith(LOCAL_URL_PREFIX)) {
      // basename evita salirse del directorio de uploads.
      await fs.unlink(path.join(LOCAL_DIR, path.basename(imageUrl)));
      return;
    }
    await del(imageUrl);
  } catch (error) {
    if (!isMissingFile(error)) {
      console.error("[uploads] no se pudo borrar la imagen", imageUrl, error);
    }
  }
}
