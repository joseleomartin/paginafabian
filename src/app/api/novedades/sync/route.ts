import { NextResponse } from "next/server";
import { syncAllNovedades } from "@/lib/sync-novedades";

function authorize(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado" },
      { status: 503 }
    );
  }

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || token !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return null;
}

/**
 * Sincroniza newsletter + podcast al store de novedades.
 * Requiere: Authorization: Bearer <CRON_SECRET>
 * En Vercel Cron, con CRON_SECRET en env, el header se envía solo.
 */
export async function POST(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;

  try {
    const result = await syncAllNovedades();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("[sync-novedades]", error);
    return NextResponse.json(
      { error: "No se pudo sincronizar" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
