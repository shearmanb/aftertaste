import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function getIp(request: Request | undefined): string {
  if (!request) return "unknown";
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const ip = getIp(request as Request | undefined);
        const windowStart = new Date(Date.now() - WINDOW_MS);

        const failCount = await prisma.loginAttempt.count({
          where: { ip, attemptedAt: { gte: windowStart } },
        });
        if (failCount >= MAX_ATTEMPTS) return null;

        if (credentials?.password !== process.env.APP_PASSWORD) {
          await prisma.loginAttempt.create({ data: { ip } });
          return null;
        }

        // Successful login — clean up old attempts
        prisma.loginAttempt
          .deleteMany({ where: { attemptedAt: { lt: new Date(Date.now() - 86400000) } } })
          .catch(() => {});

        return { id: "1", name: "Owner" };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});
