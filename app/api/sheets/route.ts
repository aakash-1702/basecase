import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import slug from "slug";

const genSlug = (title: string) => {
  const slugProb = slug(title);
  return slugProb;
};

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const sheets = await prisma.sheet.findMany({});

  if (!sheets) {
    return NextResponse.json(
      { success: false, data: null, message: "Unable to fetch sheets" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { success: true, data: sheets, message: "Sheets fetched successfully" },
    { status: 200 },
  );
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }
  const { title, description } = await req.json();
  if (!title) {
    return NextResponse.json(
      { success: false, data: null, message: "Title is required" },
      { status: 400 },
    );
  }

  const slug = genSlug(title as string);

  try {
    const sheet = await prisma.sheet.create({
      data: {
        title,
        description,
        slug,
      },
    });

    if (!sheet) {
      return NextResponse.json(
        { success: false, data: null, message: "Unable to create sheet" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: sheet,
      message: "Sheet created successfully",
    });
  } catch (error) {
    console.log("Error", error);
    return NextResponse.json(
      { success: false, data: null, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
