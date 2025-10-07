import { NextResponse } from "next/server";
import { auth } from "@/core/lib/auth";

export default async function middleware(request: Request) {
  const session = await auth();
  const { pathname } = new URL(request.url);

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/sign-in", "/api/auth"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Si no hay sesión, redirigir al login
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
