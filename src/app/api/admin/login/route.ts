import { NextResponse } from "next/server";
import {
  createSessionToken,
  hasAdminPassword,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!hasAdminPassword()) {
    return NextResponse.json(
      {
        error:
          "Configurá ADMIN_PASSWORD en las variables de entorno para habilitar el admin.",
      },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!verifyPassword(String(body.password ?? ""))) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const cookie = sessionCookieOptions(createSessionToken());
  response.cookies.set(cookie);
  return response;
}
