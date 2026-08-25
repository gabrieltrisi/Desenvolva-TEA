import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";
import { canAccessRoute } from "@/lib/auth/routes";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  const isLanding = pathname === "/"; // página institucional pública
  const isLogin = pathname.startsWith("/login");
  const isLegal = pathname === "/privacidade" || pathname === "/termos";
  const isChecklist = pathname === "/checklist"; // checklist público de sinais
  const isPublic = isLanding || isLogin || isLegal || isChecklist;

  // Usuário autenticado em /login -> manda para o dashboard.
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Rota protegida sem sessão -> manda para o login (preservando destino).
  if (!session && !isPublic) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role-gating: sessão válida acessando rota não permitida ao perfil -> dashboard.
  if (session && !isPublic && !canAccessRoute(session.role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Aplica o middleware a tudo, exceto assets estáticos, a API e os arquivos de
// metadados públicos (robots, sitemap, manifest, ícones e Open Graph).
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|icon|apple-icon|opengraph-image|.*\\.svg).*)",
  ],
};
