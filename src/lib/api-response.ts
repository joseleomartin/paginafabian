import { NextResponse } from "next/server";
import { NoticiaNotFoundError } from "@/lib/noticias";
import { StorageUnavailableError } from "@/lib/uploads";
import { validateImageBytes, type ImageKind } from "@/lib/image-upload";

export function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Traduce errores de dominio a respuestas HTTP; el resto se registra y es 500. */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof NoticiaNotFoundError) {
    return errorResponse(error.message, 404);
  }
  if (error instanceof StorageUnavailableError) {
    return errorResponse(error.message, 503);
  }
  console.error("[api] error inesperado", error);
  return errorResponse("No se pudo completar la operación.", 500);
}

export type FormImage = { bytes: Uint8Array; kind: ImageKind };

type ImageOutcome =
  | { ok: true; image: FormImage | null }
  | { ok: false; response: NextResponse };

/**
 * Lee la imagen opcional (campo `image`) de un formulario multipart y la valida
 * por su contenido real, no por lo que declara el cliente.
 */
export async function readImageFromForm(form: FormData): Promise<ImageOutcome> {
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: true, image: null };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const checked = validateImageBytes(bytes);
  if (!checked.ok) {
    return { ok: false, response: errorResponse(checked.error, 400) };
  }
  return { ok: true, image: { bytes, kind: checked.kind } };
}
