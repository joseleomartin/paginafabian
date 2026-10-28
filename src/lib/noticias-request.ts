import type { NextResponse } from "next/server";
import {
  errorResponse,
  readImageFromForm,
  type FormImage,
} from "@/lib/api-response";
import {
  validateNoticiaInput,
  type NoticiaInput,
} from "@/lib/noticias-model";

export type ParsedNoticiaRequest = {
  input: NoticiaInput;
  image: FormImage | null;
  removeImage: boolean;
};

type ParseOutcome =
  | { ok: true; value: ParsedNoticiaRequest }
  | { ok: false; response: NextResponse };

/** Lee el formulario multipart del admin (campos + imagen opcional) y lo valida. */
export async function parseNoticiaRequest(request: Request): Promise<ParseOutcome> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return { ok: false, response: errorResponse("Formulario inválido.", 400) };
  }

  const fields = Object.fromEntries(
    ["title", "body", "date", "href", "published"].map((name) => [
      name,
      form.get(name),
    ])
  );
  const validated = validateNoticiaInput(fields);
  if (!validated.ok) {
    return { ok: false, response: errorResponse(validated.error, 400) };
  }

  const imageOutcome = await readImageFromForm(form);
  if (!imageOutcome.ok) return imageOutcome;

  return {
    ok: true,
    value: {
      input: validated.value,
      image: imageOutcome.image,
      removeImage: form.get("removeImage") === "1",
    },
  };
}
