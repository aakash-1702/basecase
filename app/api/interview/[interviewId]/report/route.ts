import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    const { interviewId } = await params;

   const interviewReport = await prisma.interviewFeedback.findFirst({
  where: {
    interviewId: interviewId,
    interview: {
      userId: session.user.id,
    },
  },
  include: {
    interview: {
      select: {
        company: true,
        mode: true,
        difficulty: true,
        startedAt: true,
        completedAt: true,
      }
    }
  }
});

    return NextResponse.json(
      {
        success: true,
        data: interviewReport,
        message: "Report fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}