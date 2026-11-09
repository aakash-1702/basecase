import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

/**
 * GET /api/dashboard
 *
 * Returns the signed-in user's dashboard payload (see `DashboardData` in
 * `lib/dashboard.ts`): totals + solved counts per difficulty, overall
 * completion, per-sheet progress, problems due for revision and the five most
 * recent submissions. The server page calls `getDashboardData` directly.
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const data = await getDashboardData(session.user.id, session.user.name);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Error fetching dashboard data" },
      { status: 500 },
    );
  }
}
