import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Vérification optimiste : sans cookie de session, on redirige tout de suite vers la connexion.
 * La vraie vérification (session valide, rôle, double authentification) est faite côté serveur
 * dans chaque layout protégé.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request, { cookiePrefix: "kraken" }));

  if (pathname.startsWith("/espace") && !hasSession) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/connexion") && !hasSession) {
    return NextResponse.redirect(new URL("/admin/connexion", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/espace/:path*", "/admin/:path*"],
};
