import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { toast } from "sonner";
import { ConfidenceV2 } from "@/generated/prisma/enums";

function getRelativeTime(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

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

  /*
      we need to fetch number of total no of easy problems and then no of medium problems and then no of hard problems and then count of problems solved by the users

      randomly assign the potd to the user , and it should persist for 24 hours and then change to another random problem

      we need to fetch the recent submission of the user and show it on the board  

      need to fetch three-four sheets for the user and show it's progress , 

      free user can generate one to-do list using ai for the day and premium user can generate three to-do list using ai for the day




      */

  try {
    const totalEasyProblems = await prisma.problem.count({
      where: {
        difficulty: "easy",
      },
    });

    const totalMediumProblems = await prisma.problem.count({
      where: {
        difficulty: "medium",
      },
    });

    const totalHardProblems = await prisma.problem.count({
      where: {
        difficulty: "hard",
      },
    });

    const totalEasySolved = await prisma.userProblem.count({
      where: {
        userId: session.user.id,
        solved: true,
        problem: {
          difficulty: "easy",
        },
      },
    });

    const totalMediumSolved = await prisma.userProblem.count({
      where: {
        userId: session.user.id,
        solved: true,
        problem: {
          difficulty: "medium",
        },
      },
    });

    const totalHardSolved = await prisma.userProblem.count({
      where: {
        userId: session.user.id,
        solved: true,
        problem: {
          difficulty: "hard",
        },
      },
    });

    const totalSolved = totalEasySolved + totalMediumSolved + totalHardSolved;
    const totalProblems =
      totalEasyProblems + totalMediumProblems + totalHardProblems;

    const easyProgress = Math.round(
      totalEasyProblems === 0 ? 0 : (totalEasySolved / totalEasyProblems) * 100,
    );
    const mediumProgress =
      totalMediumProblems === 0
        ? 0
        : Math.round((totalMediumSolved / totalMediumProblems) * 100);
    const hardProgress =
      totalHardProblems === 0
        ? 0
        : Math.round((totalHardSolved / totalHardProblems) * 100);

    const completion =
      totalProblems === 0 ? 0 : Math.round((totalSolved / totalProblems) * 100);

    // finding the sheets data
    const sheets = await prisma.sheet.findMany({
      where: {},
      select: {
        id: true,
        title: true,
      },
    });

    // finding the progress for each sheet
    const sheetProgress = await Promise.all(
      sheets.map(async (sheet) => {
        const totalProblemInSheet = await prisma.sectionProblem.count({
          where: {
            section: {
              sheetId: sheet.id,
            },
          },
        });

        const totalSolvedInSheet = await prisma.userProblem.count({
          where: {
            userId: session.user.id,
            solved: true,
            problem: {
              sectionProblems: {
                some: {
                  section: {
                    sheetId: sheet.id,
                  },
                },
              },
            },
          },
        });

        return {
          id: sheet.id,
          title: sheet.title,
          total: totalProblemInSheet,
          solved: totalSolvedInSheet,
          progress:
            totalProblemInSheet === 0
              ? 0
              : Math.round((totalSolvedInSheet / totalProblemInSheet) * 100),
        };
      }),
    );

    // fetching the last 5 submission of the users
    const recentSubmissions = await prisma.userProblem.findMany({
      where: {
        userId: session.user.id,
        solved: true,
      },
      orderBy: { solvedAt: "desc" },
      take: 5,
      include: {
        problem: {
          select: {
            title: true,
            difficulty: true,
          },
        },
      },
    });

    const normalizedSubmissions = recentSubmissions.map((sub) => ({
      id: sub.id,
      problem: sub.problem.title, // flatten from nested object → string
      difficulty:
        sub.problem.difficulty.charAt(0).toUpperCase() +
        sub.problem.difficulty.slice(1), // "easy" → "Easy"
      status: sub.solved ? "Accepted" : "Wrong Answer",
      time: sub.solvedAt ? getRelativeTime(sub.solvedAt) : "Recently",
      sheet: "", // you'd need to join this from sectionProblems if needed
    }));

    const threeDaysAgo = new Date(Date.now() - 15 * 60 * 1000);

    const recommended = await prisma.userProblem.findMany({
      where: {
        userId: session.user.id,
        OR: [
          {
            confidenceV2: {
              in: ["LOW"],
            },
          },
          {
            solved: true,
            solvedAt: {
              lte: threeDaysAgo,
            },
          },
        ],
      },
      include: {
        problem: true, // 🔥 this gives you full problem data
      },
      take: 5,
    });
    return NextResponse.json(
      {
        success: true,
        data: {
          totalEasyProblems,
          totalMediumProblems,
          totalHardProblems,
          totalEasySolved,
          totalMediumSolved,
          totalHardSolved,
          easyProgress,
          mediumProgress,
          hardProgress,
          completion,
          sheetProgress,
          recentSubmissions: normalizedSubmissions,
          name: session.user.name ?? "User", // ← also add this, Dashboard uses d.name
          recommended,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error fetching dashboard data:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Error fetching dashboard data" },
      { status: 500 },
    );
  }
}
