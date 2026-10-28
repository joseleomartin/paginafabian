import { NextResponse } from "next/server";
import {
  createSessionToken,
  hasAdminPassword,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-auth";
import { createRateLimiter } from "@/lib/login-rate-limit";

/** Contraseña de ejemplo de `.env.example`: nunca válida en producción. */
const EXAMPLE_PASSWORD = "cambia-esta-clave";

const limiter = createRateLimiter();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

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

  if (
    process.env.NODE_ENV === "production" &&
    process.env.ADMIN_PASSWORD === EXAMPLE_PASSWORD
  ) {
    console.error(
      "[admin] ADMIN_PASSWORD usa el valor de ejemplo; login deshabilitado en producción."
    );
    return NextResponse.json(
      { error: "Definí una ADMIN_PASSWORD propia para habilitar el admin." },
      { status: 503 }
    );
  }

  const key = clientKey(request);
  if (limiter.isBlocked(key)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
      {
        status: 429,
        headers: { "Retry-After": String(limiter.retryAfterSeconds(key)) },
      }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!verifyPassword(String(body.password ?? ""))) {
    limiter.registerFailure(key);
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  limiter.reset(key);
  const response = NextResponse.json({ ok: true });
  const cookie = sessionCookieOptions(createSessionToken());
  response.cookies.set(cookie);
  return response;
}
