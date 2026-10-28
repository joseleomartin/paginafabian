import type { NextResponse } from "next/server";
import {
  errorResponse,
  readImageFromForm,
  type FormImage,
} from "@/lib/api-response";
import { validateNovedadInput, type NovedadInput } from "@/lib/novedades";

export type ParsedNovedadRequest = {
  input: NovedadInput;
  image: FormImage | null;
};

type ParseOutcome =
  | { ok: true; value: ParsedNovedadRequest }
  | { ok: false; response: NextResponse };

/**
 * Lee el formulario multipart de newsletter/podcast (campos + imagen opcional).
 * Una imagen subida reemplaza a la actual; no hay "quitar" porque el sync
 * volvería a completarla desde la fuente.
 */
export async function parseNovedadRequest(request: Request): Promise<ParseOutcome> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return { ok: false, response: errorResponse("Formulario inválido.", 400) };
  }

  const fields: Record<string, unknown> = Object.fromEntries(
    ["type", "title", "summary", "date", "href", "youtubeId"].map((name) => [
      name,
      form.get(name),
    ])
  );
  fields.published = form.get("published") !== "false";

  const validated = validateNovedadInput(fields);
  if (typeof validated === "string") {
    return { ok: false, response: errorResponse(validated, 400) };
  }

  const imageOutcome = await readImageFromForm(form);
  if (!imageOutcome.ok) return imageOutcome;

  return { ok: true, value: { input: validated, image: imageOutcome.image } };
}
