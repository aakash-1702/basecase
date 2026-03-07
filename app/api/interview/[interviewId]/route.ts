// getting  all the information about a particular interview
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  params: Promise<{ interviewId: string }>,
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
  const {interviewId} = await params;

  const interview = await prisma.interview.findFirst({
    where : {
        id : interviewId,
        userId : session.user.id,
    },
    include : {
        turns : {
            orderBy : {
                index : "asc",
            }
        },
        feedback : true,
    }
  })

}













