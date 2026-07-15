import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getNovedades,
  saveNovedades,
  validateNovedadInput,
  type Novedad,
} from "@/lib/novedades";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const validated = validateNovedadInput(body);
  if (typeof validated === "string") {
    return NextResponse.json({ error: validated }, { status: 400 });
  }

  const items = await getNovedades();
  const index = items.findIndex((n) => n.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Novedad no encontrada." }, { status: 404 });
  }

  const updated: Novedad = {
    id,
    type: validated.type,
    title: validated.title,
    summary: validated.summary,
    date: validated.date,
    href: validated.href,
    youtubeId: validated.youtubeId,
    published: validated.published !== false,
  };
  items[index] = updated;
  await saveNovedades(items);
  return NextResponse.json({ item: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const items = await getNovedades();
  const next = items.filter((n) => n.id !== id);
  if (next.length === items.length) {
    return NextResponse.json({ error: "Novedad no encontrada." }, { status: 404 });
  }

  await saveNovedades(next);
  return NextResponse.json({ ok: true });
}
