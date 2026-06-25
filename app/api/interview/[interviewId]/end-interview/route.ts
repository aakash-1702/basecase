import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

// will implement the background worker logic afterwards

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { interviewId } = await req.json();

  if (!interviewId) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Invalid request body, interviewId is required",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const updatedInterviewDetails = await prisma.interview2.update({
      where: {
        id: interviewId,
        userId: session.user.id,
      },
      data: { status: "COMPLETED" },
      select: { id: true, status: true },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          interviewId: updatedInterviewDetails.id,
          status: updatedInterviewDetails.status,
        },
        message: "Interview ended successfully",
      },
      { status: 200 },
    );
  } catch (e: any) {
    if (e.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Interview not found or already completed.",
        },
        { status: 404 },
      );
    }
    console.error("Failed to end interview:", e);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 },
    );
  }
}
