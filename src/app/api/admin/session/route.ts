import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Informa si hay una sesión de administrador válida (siempre 200, para no ensuciar la consola al estar deslogueado). */
export async function GET() {
  return NextResponse.json(
    { authenticated: await isAdminAuthenticated() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
