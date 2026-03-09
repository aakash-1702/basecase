// getting  all the information about a particular interview
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * GET /api/interview/:interviewId
 * Fetches all the information about a particular interview
 * @param {NextRequest} req - The NextRequest object
 * @param {Promise<{interviewId: string}>} params - The params object
 * @returns {NextResponse} - The response object
 * @throws {NextResponse} - A 401 response if the user is not authorized
 * @throws {NextResponse} - A 404 response if the interview is not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  // gettting all the information about a particular interview
  const { interviewId } = await params;

  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      userId: session.user.id,
    },
    include: {
      feedback: true,
    },
  });

  if (!interview) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Interview not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: interview,
    message: "Interview fetched successfully",
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  // deleting a particular interview
  try {
    const { interviewId } = await params;

    const interview = await prisma.interview.delete({
      where: {
        id: interviewId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: interview.id,
        message: "Interview deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Error deleting interview:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unable to delete the interview at the moment",
      },
      {
        status: 500,
      },
    );
  }
}
