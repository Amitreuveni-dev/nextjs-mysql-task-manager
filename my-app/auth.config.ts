import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma / Node-only modules).
 * Used by both auth.ts (full) and middleware.ts (edge).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAuthPage =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

      if (isOnDashboard) {
        // Block unauthenticated users from /dashboard/*
        return isLoggedIn;
      }

      if (isLoggedIn && isAuthPage) {
        // Redirect logged-in users away from auth pages
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },

    jwt({ token, user }) {
      // Persist user.id into the JWT on first sign-in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    session({ session, token }) {
      // Expose user.id in the session object
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Credentials provider added in auth.ts
} satisfies NextAuthConfig;
