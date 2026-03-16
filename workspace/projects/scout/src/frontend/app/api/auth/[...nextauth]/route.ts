/**
 * NextAuth.js configuration with magic-link email provider.
 * No passwords — users authenticate via one-time email links.
 *
 * NOTE: In your file system this file should be at:
 *   app/api/auth/[...nextauth]/route.ts
 * (Brackets in directory names may need shell escaping.)
 */

import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Custom adapter that talks to the FastAPI backend's sessions/users tables.
 * This is a minimal adapter — it handles session creation/lookup.
 */
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

    async getUser(id: string) {
      // Not needed for our flow
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

    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      return null;
    },

    async updateUser(user: { id: string; email?: string }) {
      return user;
    },

    async linkAccount() {
      return undefined;
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      // Store session in backend database
      const res = await fetch(`${BACKEND_URL}/internal/sessions`, {
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
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as { id?: string; role?: string }).id = user.id;
        (session.user as { id?: string; role?: string }).role =
          (user as { role?: string }).role || "viewer";
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
