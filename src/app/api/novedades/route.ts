import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { errorResponse, handleApiError } from "@/lib/api-response";
import {
  createId,
  getNovedades,
  getPublishedNovedades,
  isNovedadType,
  saveNovedades,
  type Novedad,
  type NovedadType,
} from "@/lib/novedades";
import { parseNovedadRequest } from "@/lib/novedades-request";
import { deleteImage, saveImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

function asKnownType(value: string | null): NovedadType | undefined {
  return isNovedadType(value) ? value : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = asKnownType(searchParams.get("type"));

  if (searchParams.get("all") === "1") {
    if (!(await isAdminAuthenticated())) {
      return errorResponse("No autorizado.", 401);
    }
    const items = await getNovedades();
    return NextResponse.json({
      items: type ? items.filter((item) => item.type === type) : items,
    });
  }

  return NextResponse.json({ items: await getPublishedNovedades(type) });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return errorResponse("No autorizado.", 401);
  }

  const parsed = await parseNovedadRequest(request);
  if (!parsed.ok) return parsed.response;
  const { input, image } = parsed.value;

  let imageUrl: string | undefined;
  try {
    imageUrl = image ? await saveImage(image.bytes, image.kind) : undefined;

    const next: Novedad = {
      id: createId(input.type),
      type: input.type,
      title: input.title,
      summary: input.summary,
      date: input.date,
      href: input.href,
      youtubeId: input.youtubeId,
      imageUrl,
      published: input.published !== false,
    };
    const items = await getNovedades();
    await saveNovedades([next, ...items]);
    return NextResponse.json({ item: next }, { status: 201 });
  } catch (error) {
    // Evita dejar una imagen huérfana si no se pudo guardar el contenido.
    await deleteImage(imageUrl);
    return handleApiError(error);
  }
}
