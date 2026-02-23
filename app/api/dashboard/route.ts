import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { toast } from "sonner";

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

    const easyProgress =
      totalEasyProblems === 0 ? 0 : (totalEasySolved / totalEasyProblems) * 100;
    const mediumProgress =
      totalMediumProblems === 0
        ? 0
        : (totalMediumSolved / totalMediumProblems) * 100;
    const hardProgress =
      totalHardProblems === 0 ? 0 : (totalHardSolved / totalHardProblems) * 100;

    const completion =
      totalProblems === 0 ? 0 : (totalSolved / totalProblems) * 100;

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
              : (totalSolvedInSheet / totalProblemInSheet) * 100,
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
          recentSubmissions,
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
