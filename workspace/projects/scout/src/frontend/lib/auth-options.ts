/**
 * NextAuth configuration — kept in lib/ so it can be imported without
 * going through the [...nextauth] dynamic route path (which webpack
 * cannot resolve as a module import).
 *
 * server-only ensures this file (and nodemailer) never gets bundled
 * into the client-side JavaScript bundle.
 */
import "server-only";

import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ScoutAdapter() {
  return {
    async createUser(user: { email: string }) {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, role: "viewer" }),
      });
      if (!res.ok) throw new Error("Failed to create user");
      const data = await res.json();
      return { id: data.user_id, email: user.email, emailVerified: null };
    },

    async getUser(_id: string) {
      return null;
    },

    async getUserByEmail(email: string) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return null;
        const users: Array<{ id: string; email: string; role: string }> = await res.json();
        const found = users.find((u) => u.email === email);
        if (!found) return null;
        return { id: found.id, email: found.email, emailVerified: new Date(), role: found.role };
      } catch {
        return null;
      }
    },

    async getUserByAccount(_: { provider: string; providerAccountId: string }) {
      return null;
    },

    async updateUser(user: { id: string; email?: string }) {
      return user;
    },

    async linkAccount() {
      return undefined;
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      await fetch(`${BACKEND_URL}/internal/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_token: session.sessionToken,
          user_id: session.userId,
          expires: session.expires.toISOString(),
        }),
      }).catch(() => null);
      return session;
    },

    async getSessionAndUser(sessionToken: string) {
      try {
        const res = await fetch(`${BACKEND_URL}/internal/sessions/${sessionToken}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async updateSession(session: { sessionToken: string }) {
      return session;
    },

    async deleteSession(sessionToken: string) {
      await fetch(`${BACKEND_URL}/internal/sessions/${sessionToken}`, {
        method: "DELETE",
      }).catch(() => null);
    },

    async createVerificationToken(token: { identifier: string; token: string; expires: Date }) {
      return token;
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      return { identifier, token, expires: new Date() };
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: ScoutAdapter() as any,
  providers: [
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM || "scout@yourdomain.com",
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as { id?: string; role?: string }).id = user.id;
        (session.user as { id?: string; role?: string }).role =
          (user as { role?: string }).role || "viewer";
        (session as any).accessToken = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
      },
    },
  },
};
