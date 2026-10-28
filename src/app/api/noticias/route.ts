import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { errorResponse, handleApiError } from "@/lib/api-response";
import {
  getNoticias,
  getPublishedNoticias,
  updateNoticias,
} from "@/lib/noticias";
import { createNoticiaId, type Noticia } from "@/lib/noticias-model";
import { parseNoticiaRequest } from "@/lib/noticias-request";
import { deleteImage, saveImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const wantsAll = new URL(request.url).searchParams.get("all") === "1";

  if (wantsAll) {
    if (!(await isAdminAuthenticated())) {
      return errorResponse("No autorizado.", 401);
    }
    return NextResponse.json({ items: await getNoticias() });
  }
  return NextResponse.json({ items: await getPublishedNoticias() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return errorResponse("No autorizado.", 401);
  }

  const parsed = await parseNoticiaRequest(request);
  if (!parsed.ok) return parsed.response;
  const { input, image } = parsed.value;

  let imageUrl: string | undefined;
  try {
    imageUrl = image ? await saveImage(image.bytes, image.kind) : undefined;

    const noticia: Noticia = {
      id: createNoticiaId(),
      ...input,
      imageUrl,
    };
    await updateNoticias((current) => ({
      items: [noticia, ...current],
      result: noticia,
    }));
    return NextResponse.json({ item: noticia }, { status: 201 });
  } catch (error) {
    // Evita dejar una imagen huérfana si no se pudo guardar la novedad.
    await deleteImage(imageUrl);
    return handleApiError(error);
  }
}
