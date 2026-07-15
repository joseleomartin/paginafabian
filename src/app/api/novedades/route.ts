import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createId,
  getNovedades,
  getPublishedNovedades,
  saveNovedades,
  validateNovedadInput,
  type Novedad,
  type NovedadType,
} from "@/lib/novedades";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as NovedadType | null;
  const all = searchParams.get("all") === "1";

  if (all) {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const items = await getNovedades();
    return NextResponse.json({
      items:
        type === "newsletter" || type === "podcast"
          ? items.filter((n) => n.type === type)
          : items,
    });
  }

  const items = await getPublishedNovedades(
    type === "newsletter" || type === "podcast" ? type : undefined
  );
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

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
  const next: Novedad = {
    id: createId(validated.type),
    type: validated.type,
    title: validated.title,
    summary: validated.summary,
    date: validated.date,
    href: validated.href,
    youtubeId: validated.youtubeId,
    published: validated.published !== false,
  };
  items.unshift(next);
  await saveNovedades(items);
  return NextResponse.json({ item: next }, { status: 201 });
}
