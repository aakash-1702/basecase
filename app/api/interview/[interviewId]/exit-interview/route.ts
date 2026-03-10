import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { analysisQueue } from "@/lib/queue";
import { getInterviewSession, deleteInterviewSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unauthorised Access",
      },
      {
        status: 401,
      },
    );
  }

  // ending  the interview and adding the current interview to the analysisQueue
  try {
    const { interviewId } = await params;

    const interviewSession = await getInterviewSession(interviewId);

    if (!interviewSession || !interviewSession.transcript) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Interview does not exists ",
        },
        {
          status: 404,
        },
      );
    }

    const updatedInterview = await prisma.interview.update({
      where: {
        id: interviewId,
      },
      data: {
        status: "processing",
        completedAt: new Date(),
      },
    });

    await deleteInterviewSession(interviewId);

    await analysisQueue.add(
      "interview-analysis",
      {
        interviewId,
        mode: interviewSession.mode,
        transcript: interviewSession.transcript,
      },
      {
        attempts: 2,
        backoff: { type: "exponential", delay: 2000 },
      },
    );

    const jobs = await analysisQueue.getJobs(["waiting", "active"]);
    console.log("Jobs in queue:", jobs.length);
    return NextResponse.json(
      {
        success: true,
        data: null,
        message: "Interview ended successfully, analysis is being processed",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      // ← never throw from API route
      { success: false, data: null, message: "Failed to end interview" },
      { status: 500 },
    );
  }
}
