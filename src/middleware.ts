import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const path  = req.nextUrl.pathname;

    // Rotas exclusivas da Diretoria
    const rotasDiretoria = ["/config", "/backup", "/api/usuarios"];
    if (rotasDiretoria.some((r) => path.startsWith(r))) {
      if (token?.perfilGlobal !== "DIRETORIA") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!auth|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
