import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Evita indexar el panel de administración. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
