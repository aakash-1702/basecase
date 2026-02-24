import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import slug from "slug";
import { kMaxLength } from "node:buffer";

const genSlug = (title: string) => {
  const slugProb = slug(title);
  return slugProb;
};

// /*************  ✨ Windsurf Command ⭐  *************/
//  * Creates a new problem.
//  * @throws {Error} - If there is an error creating the problem.
// /*******  18601527-9168-4310-8a8b-a68dd6ab8552  *******/
//
export async function POST(req: NextRequest) {
  // ✅ DEV SEED BYPASS (safe)
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
  }

  try {
    const { title, description, tags, companies, difficulty, link } =
      await req.json();
    const genProb = genSlug(title as string);
    const problem = await prisma.problem.create({
      data: {
        title,
        slug: genProb,
        description,
        tags,
        companies,
        difficulty,
        link,
      },
    });
    return NextResponse.json(
      {
        success: true,
        data: problem,
        message: "Problem created successfully",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unable to create the problem",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const page = Math.max(Number(sp.get("page")) || 1, 1);
    const limit = Math.max(Number(sp.get("limit")) || 5, 1);

    const difficulty = sp.get("difficulty");
    const status = sp.get("status");
    const search = sp.get("search");

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    console.log("SESSION:", session.user);
    const userId = session.user.id;

    const where: any = {
      isPublic: true,
      isActive: true,
    };

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (status === "solved") {
      where.userProblems = {
        some: { userId, solved: true },
      };
    }

    if (status === "unsolved") {
      where.OR = [
        { userProblems: { none: { userId } } },
        { userProblems: { some: { userId, solved: false } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take: limit,
        include: {
          userProblems: {
            where: { userId },
            select: { solved: true, confidence: true },
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        problems: problems.map((p) => ({
          ...p,
          userProgress: p.userProblems[0] ?? null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("API ERROR:", error); // <-- WATCH THIS LOG
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
