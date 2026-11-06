import { NextResponse, type NextRequest } from "next/server";
import { MOCK_MODE } from "@/lib/mock/mode";

/**
 * In mock mode every /api/* request is transparently served by the single
 * catch-all handler in app/api/mock/[...path]/route.ts, so the real route
 * handlers (Prisma, Judge0, Redis, LLMs) are never executed.
 */
export function proxy(req: NextRequest) {
  if (!MOCK_MODE) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/mock/")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api/mock${pathname.slice("/api".length)}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
