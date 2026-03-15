import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Middleware uses the edge-safe authConfig (no Prisma).
 * Protects all routes under /dashboard and redirects
 * authenticated users away from /login and /register.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
