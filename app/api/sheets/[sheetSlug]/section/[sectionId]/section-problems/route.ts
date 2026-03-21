// this route is for adding problems to a section of a sheet
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sheetSlug: string; sectionId: string }> },
) {
  // ✅ DEV SEED BYPASS
  const seedKey = req.headers.get("x-seed-key");

  if (
    process.env.NODE_ENV === "development" &&
    seedKey === process.env.SEED_KEY
  ) {
    // skip auth — allow seeding
  } else {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, data: null, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  // checking if the sheet exists or not
  const { sheetSlug, sectionId } = await params;
  // seeing if the sectionId exists or not

  try {
    const section = await prisma.sheetSection.findFirst({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Section not found",
        },
        {
          status: 404,
        },
      );
    }

    const { problemId } = await req.json();

    // Check if this problem is already linked to this section
    const existingLink = await prisma.sectionProblem.findFirst({
      where: {
        sectionId: sectionId,
        problemId: problemId,
      },
    });

    // If already linked, return the existing record (idempotent)
    if (existingLink) {
      return NextResponse.json(
        {
          success: true,
          data: existingLink,
          message: "Problem already linked to section",
        },
        {
          status: 200,
        },
      );
    }

    const lastOrder = await prisma.sectionProblem.findFirst({
      where: {
        sectionId: sectionId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const order = lastOrder ? lastOrder.order + 1 : 1;

    // now we need to add the problem to the section
    const sectionProblem = await prisma.sectionProblem.create({
      data: {
        sectionId: sectionId,
        problemId: problemId,

        order,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: sectionProblem,
        message: "Problem added to section successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
    // Handle unique constraint violation (P2002) gracefully
    if (error.code === "P2002") {
      const existing = await prisma.sectionProblem.findFirst({
        where: {
          sectionId: sectionId,
          problemId: (await req.json()).problemId,
        },
      });
      return NextResponse.json(
        {
          success: true,
          data: existing,
          message: "Problem already linked to section",
        },
        {
          status: 200,
        },
      );
    }

    console.log("Error adding problem to section:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
