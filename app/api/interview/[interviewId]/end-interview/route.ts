import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { getInterviewDetails, saveInterviewSession } from "@/lib/session";

/**
 * POST /api/interview/[interviewId]/end-interview
 *
 * Manually ends an in-progress interview.
 * - Validates session and ownership
 * - Marks Interview2 record as COMPLETED in Prisma
 * - Updates Redis session status to COMPLETED
 * - Does NOT trigger report generation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { interviewId } = await params;

  if (!interviewId) {
    return NextResponse.json(
      { success: false, data: null, message: "Interview ID is required" },
      { status: 400 },
    );
  }

  // Verify the interview exists, belongs to the user, and is still in progress
  const interview = await prisma.interview2.findFirst({
    where: {
      id: interviewId,
      userId: session.user.id,
      status: "IN_PROGRESS",
    },
    select: { id: true },
  });

  if (!interview) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Interview not found or already completed",
      },
      { status: 404 },
    );
  }

  try {
    // Update Prisma record
    await prisma.interview2.update({
      where: { id: interviewId },
      data: { status: "COMPLETED" },
    });

    // Update Redis session (if still present — TTL may have expired)
    const redisSession = await getInterviewDetails(
      interviewId,
      session.user.id,
    );
    if (redisSession) {
      redisSession.status = "COMPLETED";
      await saveInterviewSession(redisSession, interviewId, session.user.id);
    }

    return NextResponse.json(
      {
        success: true,
        data: { id: interviewId },
        message: "Interview ended successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to end interview:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Failed to end the interview. Please try again.",
      },
      { status: 500 },
    );
  }
}
