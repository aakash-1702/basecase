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

/**
 * GET /api/dashboard
 *
 * Fetches the dashboard data for the user.
 *
 * Returns an object containing the following data:
 * - totalEasyProblems: the total number of easy problems
 * - totalMediumProblems: the total number of medium problems
 * - totalHardProblems: the total number of hard problems
 * - totalEasySolved: the total number of easy problems solved by the user
 * - totalMediumSolved: the total number of medium problems solved by the user
 * - totalHardSolved: the total number of hard problems solved by the user
 * - easyProgress: the progress of the user in easy problems (0-100%)
 * - mediumProgress: the progress of the user in medium problems (0-100%)
 * - hardProgress: the progress of the user in hard problems (0-100%)
 * - completion: the overall completion percentage of the user (0-100%)
 * - sheetProgress: an array of objects containing the progress of the user in each sheet
 * - recentSubmissions: an array of objects containing the last 5 submissions of the user
 */
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
    const [easy, medium, hard, easySolved, mediumSolved, hardSolved] = await Promise.all([
  prisma.problem.count({ where: { difficulty: "easy" } }),
  prisma.problem.count({ where: { difficulty: "medium" } }),
  prisma.problem.count({ where: { difficulty: "hard" } }),
  prisma.userProblem.count({ where: { userId: session.user.id, solved: true, problem: { difficulty: "easy" } } }),
  prisma.userProblem.count({ where: { userId: session.user.id, solved: true, problem: { difficulty: "medium" } } }),
  prisma.userProblem.count({ where: { userId: session.user.id, solved: true, problem: { difficulty: "hard" } } }),
]);
    
    const totalSolved = easySolved + mediumSolved + hardSolved;
    const totalProblems =
      medium + easy + hard;

    const easyProgress = Math.round(
      easy === 0 ? 0 : (easySolved / easy) * 100,
    );
    const mediumProgress =
      medium === 0
        ? 0
        : Math.round((mediumSolved / medium) * 100);
    const hardProgress =
      hard === 0
        ? 0
        : Math.round((hardSolved / hard) * 100);

    const completion =
      totalProblems === 0 ? 0 : Math.round((totalSolved / totalProblems) * 100);

    // finding the sheets data
    const sheets = await prisma.sheet.findMany({
      where: {},
      select: {
        id: true,
        title: true,
        slug : true,
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
          slug : sheet.slug,
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

    // finding the problems which are supposed to be revised
    const now = new Date();
    const [problemsToRevise, totalDue] = await prisma.$transaction([
      prisma.userProblem.findMany({
        where: {
          userId: session.user.id,
          solved: true,
          nextAttempt: { lte: now },
        },
        include: { problem: true },
        orderBy: { nextAttempt: "asc" },
        take: 5,
      }),
      prisma.userProblem.count({
        where: {
          userId: session.user.id,
          solved: true,
          nextAttempt: { lte: now },
        },
      }),
    ]);


    // finding the recent submission of the user
    const recentSubmission = await prisma.userProblem.findMany({
      where : {
        userId : session.user.id,
        solved : true,
      },
      include : {
        problem : true,
      },
      orderBy : {
        solvedAt : "desc",
      },
      take : 5,
    })
    return NextResponse.json(
      {
        success: true,
        data: {
          easy,
          medium,
          hard,
          easySolved,
          mediumSolved,
          hardSolved,
          easyProgress,
          mediumProgress,
          hardProgress,
          completion,
          sheetProgress,
          recentSubmission,
          name: session.user.name ?? "User", // ← also add this, Dashboard uses d.name
          problemsToRevise,
          totalDue,
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
