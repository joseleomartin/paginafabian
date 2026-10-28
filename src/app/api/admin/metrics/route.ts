import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildAdminMetrics, todayIsoDate } from "@/lib/admin-metrics";
import { errorResponse, handleApiError } from "@/lib/api-response";
import { getNoticias } from "@/lib/noticias";
import { getNovedades } from "@/lib/novedades";

export const dynamic = "force-dynamic";

/** Métricas de contenido del panel (incluye borradores, por eso requiere sesión). */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return errorResponse("No autorizado.", 401);
  }

  try {
    const [noticias, novedades] = await Promise.all([
      getNoticias(),
      getNovedades(),
    ]);
    const metrics = buildAdminMetrics({
      noticias,
      novedades,
      today: todayIsoDate(),
    });
    return NextResponse.json(
      { metrics },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
