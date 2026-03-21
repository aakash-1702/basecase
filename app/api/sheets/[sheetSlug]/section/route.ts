/*
shows all the section of a sheet
upon clicking on a section a dropdown will show all the problems of that sheet
and upon clicking a problem the problem page would open 
and again the same progres thing and all would happen there as well
*/

/*
i need to get the sheet slug form the params and display all the information regarding that sheet
*/

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sheetSlug: string }> },
) {
  // checking if the user is valid or not
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  // now i need to find if the sheet exists or not
  const { sheetSlug } = await params;
  const sheet = await prisma.sheet.findFirst({
    where: {
      slug: sheetSlug,
    },
  });

  if (!sheet) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Sheet not found",
      },
      {
        status: 404,
      },
    );
  }

  // fetching all the data regarding the sheet
  const sheetData = await prisma.sheet.findFirst({
    where: {
      id: sheet.id,
    },
    include: {
      sections: {
        orderBy: {
          order: "asc",
        },
        include: {
          problems: {
            orderBy: {
              order: "asc",
            },
            include: {
              problem: true,
            },
          },
        },
      },
    },
  });

  if (!sheetData?.sections || sheetData.sections.length === 0) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "No sections found for this sheet",
      },
      {
        status: 404,
      },
    );
  }

  // fetch all userProblems for this sheet (solved + attempted) to get solved + confidence
  const problemId = sheetData.sections.flatMap((section) =>
    section.problems.map((problem) => problem.problemId),
  );

  const userProblemsInSheet = await prisma.userProblem.findMany({
    where: {
      userId: session.user.id,
      problemId: { in: problemId },
    },
    select: {
      problemId: true,
      solved: true,
      confidenceV2: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: { ...sheetData, userProblems: userProblemsInSheet },
      message: "Sheet data fetched successfully",
    },
    {
      status: 200,
    },
  );
}

// create section for a sheet
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sheetSlug: string }> },
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

    if (!session?.user) {
      return NextResponse.json(
        { success: false, data: null, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  // creating new section for the sheet

  const { sheetSlug } = await params;

  // checking if the sheet exists or not
  try {
    const sheet = await prisma.sheet.findFirst({
      where: {
        slug: sheetSlug,
      },
    });

    if (!sheet) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Sheet not found",
        },
        {
          status: 404,
        },
      );
    }

    const { title, description } = await req.json();

    // Check if section with same title already exists in this sheet
    const existingSection = await prisma.sheetSection.findFirst({
      where: {
        sheetId: sheet.id,
        title: title,
      },
    });

    // If section already exists, return it (idempotent)
    if (existingSection) {
      return NextResponse.json(
        {
          success: true,
          data: existingSection,
          message: "Section already exists",
        },
        {
          status: 200,
        },
      );
    }

    // finding the last order of the section in the sheet and adding 1 to it
    const lastOrder = await prisma.sheetSection.findFirst({
      where: {
        sheetId: sheet.id,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const order = lastOrder ? lastOrder.order + 1 : 1;

    const sheetSection = await prisma.sheetSection.create({
      data: {
        sheetId: sheet.id,
        title,
        description,
        order,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: sheetSection,
        message: "Section created successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log("Error creating section : ", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Error creating section",
      },
      {
        status: 500,
      },
    );
  }
}
