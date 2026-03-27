import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { success } from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roadmapId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { roadmapId } = await params;

  const { status } = await req.json();

  try {
    const roadmap = await prisma.roadmap.update({
      where: {
        id: roadmapId,
      },
      data: {
        status: status,
      },
      select : {
        status : true,
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: roadmap,
        message: "Roadmap updated successfully",
      },
      {
        status: 203,
      },
    );
  } catch (error) {
    console.log("Error occured : ", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
