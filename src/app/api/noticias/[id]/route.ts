import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { errorResponse, handleApiError } from "@/lib/api-response";
import { NoticiaNotFoundError, updateNoticias } from "@/lib/noticias";
import type { Noticia } from "@/lib/noticias-model";
import { parseNoticiaRequest } from "@/lib/noticias-request";
import { deleteImage, saveImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return errorResponse("No autorizado.", 401);
  }

  const { id } = await params;
  const parsed = await parseNoticiaRequest(request);
  if (!parsed.ok) return parsed.response;
  const { input, image, removeImage } = parsed.value;

  let newImageUrl: string | undefined;
  try {
    newImageUrl = image ? await saveImage(image.bytes, image.kind) : undefined;

    const { updated, previousImageUrl } = await updateNoticias((current) => {
      const existing = current.find((item) => item.id === id);
      if (!existing) throw new NoticiaNotFoundError();

      const imageUrl = newImageUrl ?? (removeImage ? undefined : existing.imageUrl);
      const next: Noticia = { id, ...input, imageUrl };
      return {
        items: current.map((item) => (item.id === id ? next : item)),
        result: { updated: next, previousImageUrl: existing.imageUrl },
      };
    });

    // Recién con la novedad guardada se descarta la imagen reemplazada o quitada.
    if (previousImageUrl && previousImageUrl !== updated.imageUrl) {
      await deleteImage(previousImageUrl);
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
    const removed = await updateNoticias((current) => {
      const existing = current.find((item) => item.id === id);
      if (!existing) throw new NoticiaNotFoundError();
      return {
        items: current.filter((item) => item.id !== id),
        result: existing,
      };
    });
    await deleteImage(removed.imageUrl);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
