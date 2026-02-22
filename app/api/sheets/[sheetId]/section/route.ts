import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { sheetId } = await params;

  const sheet = await prisma.sheet.findUnique({
    where: {
      id: sheetId,
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

  if (!sheet) {
    return NextResponse.json(
      { success: false, data: null, message: "Sheet not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: sheet,
      message: "Sheet fetched successfully",
    },
    { status: 200 },
  );
}

/**
 * Creates a new section and adds the problems for that section to the particular sheet
 *
 * @returns {Promise<NextResponse>} - The response object
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  // now want to create the section and add the problem then and there itself

  try {
    const { title, description } = await req.json();
    const { sheetId } = await params;

    const last = await prisma.sheetSection.findFirst({
      where: {
        sheetId: sheetId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const section = await prisma.sheetSection.create({
      data: {
        title,
        description,
        order: last ? last.order + 1 : 1,
        sheetId,
      },
    });

    if (!section) {
      return NextResponse.json(
        { success: false, data: null, message: "Unable to create section" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: section, message: "Section created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.log("Error ", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal Server Error" },
      { status: 501 },
    );
  }
}
