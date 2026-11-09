import { headers } from "next/headers";
import { MOCK_MODE } from "@/lib/mock/mode";

export interface ServerSessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  premium?: boolean;
  role?: string;
}

export interface ServerSession {
  user: ServerSessionUser;
  session: { id: string; userId: string; expiresAt: Date | string };
}

/**
 * Single entry-point for reading the session on the server.
 * In mock mode it returns the demo user without touching the DB; otherwise it
 * defers to better-auth. `lib/auth` is imported lazily so mock mode never
 * initialises Prisma.
 */
export async function getServerSession(): Promise<ServerSession | null> {
  // Reading headers opts the page into dynamic rendering in both modes, so
  // session-gated pages are never prerendered at build time with mock data.
  const h = await headers();
  if (MOCK_MODE) {
    const { MOCK_SESSION } = await import("@/lib/mock/data");
    return MOCK_SESSION as unknown as ServerSession;
  }
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers: h });
  return (session as unknown as ServerSession | null) ?? null;
}
