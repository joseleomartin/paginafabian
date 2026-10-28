import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { errorResponse, handleApiError } from "@/lib/api-response";
import { getNovedades, saveNovedades, type Novedad } from "@/lib/novedades";
import { parseNovedadRequest } from "@/lib/novedades-request";
import { deleteImage, saveImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return errorResponse("No autorizado.", 401);
  }

  const { id } = await params;
  const parsed = await parseNovedadRequest(request);
  if (!parsed.ok) return parsed.response;
  const { input, image } = parsed.value;

  let newImageUrl: string | undefined;
  try {
    const items = await getNovedades();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return errorResponse("Contenido no encontrado.", 404);
    const existing = items[index];

    newImageUrl = image ? await saveImage(image.bytes, image.kind) : undefined;

    // Se parte de lo existente: editar no debe perder imagen ni badge.
    const updated: Novedad = {
      ...existing,
      type: input.type,
      title: input.title,
      summary: input.summary,
      date: input.date,
      href: input.href,
      youtubeId: input.youtubeId,
      imageUrl: newImageUrl ?? existing.imageUrl,
      published: input.published !== false,
    };
    items[index] = updated;
    await saveNovedades(items);

    // Recién con el contenido guardado se descarta la imagen reemplazada.
    // deleteImage ignora covers del repo e imágenes externas.
    if (newImageUrl && existing.imageUrl) {
      await deleteImage(existing.imageUrl);
    }
    return NextResponse.json({ item: updated });
  } catch (error) {
    await deleteImage(newImageUrl);
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return errorResponse("No autorizado.", 401);
  }

  const { id } = await params;
  try {
    const items = await getNovedades();
    const removed = items.find((item) => item.id === id);
    if (!removed) return errorResponse("Contenido no encontrado.", 404);

    await saveNovedades(items.filter((item) => item.id !== id));
    await deleteImage(removed.imageUrl);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
