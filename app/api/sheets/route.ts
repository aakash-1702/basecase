import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import slug from "slug";

const genSlug = (title: string) => slug(title);

const isSeedRequest = (req: NextRequest) =>
  process.env.NODE_ENV === "development" &&
  req.headers.get("x-seed-key") === process.env.SEED_KEY;

/**
 * Fetches all sheets for the current user.
 *
 * @returns {Promise<NextResponse>} - The response object.
 *
 * @throws {Error} - If there is an error fetching the sheets.
 */

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const sheets = await prisma.sheet.findMany({});

  return NextResponse.json(
    { success: true, data: sheets, message: "Sheets fetched successfully" },
    { status: 200 },
  );
}

/**
 * Creates a new sheet.
 *
 * @throws {Error} - If there is an error creating the sheet.
 *
 * @returns {Promise<NextResponse>} - The response object.
 */

export async function POST(req: NextRequest) {
  // ✅ DEV SEED BYPASS
  if (!isSeedRequest(req)) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, data: null, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const { title, description } = await req.json();

  if (!title) {
    return NextResponse.json(
      { success: false, data: null, message: "Title is required" },
      { status: 400 },
    );
  }

  try {
    const sheet = await prisma.sheet.create({
      data: {
        title,
        description,
        slug: genSlug(title as string),
      },
    });

    return NextResponse.json(
      { success: true, data: sheet, message: "Sheet created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating sheet:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
