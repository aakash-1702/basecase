import type { NextRequest } from "next/server";
import { MOCK_MODE } from "@/lib/mock/mode";
import { handleMockRequest } from "@/lib/mock/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path?: string[] }> };

async function handler(req: NextRequest, ctx: Ctx) {
  if (!MOCK_MODE) {
    return Response.json(
      { success: false, data: null, message: "Mock API is disabled" },
      { status: 404 },
    );
  }
  const { path = [] } = await ctx.params;
  return handleMockRequest(req, path);
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
