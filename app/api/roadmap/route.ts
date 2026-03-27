import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Agent, run } from "@openai/agents";
import * as z from "zod";

// ============================================================
// SCHEMAS
// ============================================================

const DaySchema = z.object({
  day: z.number().int().min(1).max(7),
  title: z.string(),
  focus: z.string(),
  tasks: z.array(z.string()).min(1).max(5),
  problemSlugs: z.array(z.string()).max(5),
  isInterviewDay: z.boolean(),
  interviewTopics: z.array(z.string()).optional(),
});

const WeekSchema = z.object({
  weekNumber: z.number().int().min(1),
  theme: z.string(),
  days: z.array(DaySchema).length(7),
});

const RoadmapOutputSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(500),
  weeks: z.array(WeekSchema).min(1).max(12),
});

type RoadmapOutput = z.infer<typeof RoadmapOutputSchema>;

type ProblemMeta = {
  slug: string;
  title: string;
  difficulty: string;
};

// ============================================================
// PROMPT
// ============================================================

const ROADMAP_GENERATION_PROMPT = `
You are an expert case interview coach who creates highly structured, practical, and actionable study roadmaps.

You will be given a list of available practice problems from the platform. Each problem has a slug, title, and difficulty.

========================
CORE RULES
========================
- Parse the timespan and convert it into weeks:
  * "1 week" = 1 week
  * "2 weeks" = 2 weeks
  * "1 month" = 4 weeks
  * "2 months" = 8 weeks
  * "3 months" = 12 weeks

- Each week MUST have exactly 7 days.
- Day 7 is ALWAYS a Mock Interview Day.
- Days 1–6 are practice days.

========================
PROBLEM ASSIGNMENT RULES
========================
- Each practice day MUST include 4–5 problems (NOT 1–2).
- Problems MUST:
  - Come ONLY from the provided list
  - Be relevant to the week’s theme
  - Match the user’s level (Beginner / Intermediate / Advanced)
  - Be ordered in INCREASING difficulty (easy → medium → hard)

- NEVER invent problem slugs.

========================
LEARNING QUALITY RULES
========================
- Avoid generic or vague phrases like:
    "Apply dynamic frameworks"
   "Work through layered logic"

- Instead, make each day CLEAR and PRACTICAL:
   What exactly to study
   What exactly to do
   How to approach the problems
   What to focus on (timing, thinking, communication, etc.)

- Every day should feel like a REAL study plan, not theory.

========================
TASK REQUIREMENTS
========================
Each day must have 3–5 HIGH-QUALITY tasks:
- Specific and actionable
- No fluff or buzzwords
- Include:
  - Concept revision (what exactly?)
  - Problem-solving approach (how exactly?)
  - Reflection or improvement step

Example GOOD tasks:
- "Revise prefix sum concept and when to use it vs sliding window"
- "Solve all problems in order, spending max 20 mins per problem"
- "After solving, write down 2 mistakes and how to avoid them"
- "Re-solve the hardest problem without looking at solution"

========================
DAY DESCRIPTION STYLE
========================
- Each day must have:
  - A CLEAR title (specific, not fancy)
  - A FOCUSED description (1–2 lines max, meaningful)

BAD:
"Analytical Pathways"
"Apply layered logic"

GOOD:
"Prefix Sum Fundamentals"
"Learn how prefix sums reduce time complexity in range queries"

========================
MOCK INTERVIEW DAY (DAY 7)
========================
- isInterviewDay = true
- problemSlugs = []
- Include:
  - 3–4 structured tasks:
    - Pick problems from the week
    - Simulate real interview (timed)
    - Speak your approach out loud
    - Reflect on mistakes

- Include interviewTopics relevant to that week

========================
LEVEL GUIDELINES
========================
BEGINNER:
- Focus on fundamentals
- Slower pace, more clarity
- Easier problems first

INTERMEDIATE:
- Mixed difficulty
- Emphasis on pattern recognition and speed

ADVANCED:
- Hard problems
- Ambiguity + multi-step reasoning
- Interview-level thinking

========================
COMPANY ALIGNMENT
========================
- McKinsey → structuring & clarity
- BCG → data/quant heavy
- Bain → business intuition

Reflect this in themes and tasks.

========================
OUTPUT RULES
========================
- Return ONLY valid JSON
- No markdown, no explanation
- Generate ALL weeks based on timespan
- Every week must have exactly 7 days

========================
SCHEMA
========================
{
  "title": "string (5-100 chars)",
  "description": "string (20-500 chars, 2-3 sentences max)",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "string",
      "days": [
        {
          "day": 1,
          "title": "string",
          "focus": "string",
          "tasks": ["string"],
          "problemSlugs": ["slug1", "slug2", "slug3", "slug4"],
          "isInterviewDay": false
        },
        {
          "day": 7,
          "title": "Mock Interview Day",
          "focus": "string",
          "tasks": ["string"],
          "problemSlugs": [],
          "isInterviewDay": true,
          "interviewTopics": ["string"]
        }
      ]
    }
  ]
}
`;

// ============================================================
// DIFFICULTY MAP
// ============================================================

const difficultyMap = {
  BEGINNER: "easy",
  INTERMEDIATE: "medium",
  ADVANCED: "hard",
} as const;

// ============================================================
// AGENT
// ============================================================

const generateRoadmap = async (
  company: string,
  timespan: string,
  prepLevel: string,
  problems: ProblemMeta[],
): Promise<RoadmapOutput> => {
  const roadmapGenerator = new Agent({
    name: "Roadmap_Generator_agent",
    instructions: ROADMAP_GENERATION_PROMPT,
    outputType: RoadmapOutputSchema,
  });

  const query = {
    company,
    timespan,
    prepLevel,
    availableProblems: problems,
    query: "Using all of the above information, generate the roadmap.",
  };

  const result = await run(roadmapGenerator, JSON.stringify(query));
  return result.finalOutput as RoadmapOutput;
};

// ============================================================
// REQUEST VALIDATION
// ============================================================

const RequestSchema = z.object({
  company: z.string().min(1, "Company is required"),
  timespan: z.string().min(1, "Timespan is required"),
  prepLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
});

// ============================================================
// SHARED SELECT
// no data JSON blob — only fetched on detail page /api/roadmap/[id]
// ============================================================

const roadmapListSelect = {
  id: true,
  title: true,
  description: true,
  company: true,
  prepLevel: true,
  status: true,
  createdAt: true,
  userId: true,
  user: {
    select: {
      name: true,
      image: true,
    },
  },
} as const;

// ============================================================
// POST /api/roadmap — generate + persist
// ============================================================

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Invalid request",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { company, timespan, prepLevel } = parsed.data;

  try {
    // credit check before doing any heavy work
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { roadmapCredits: true },
    });

    if (!currentUser || currentUser.roadmapCredits < 1) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Not enough credits to generate roadmap",
        },
        { status: 403 },
      );
    }

    // fetch problems filtered by difficulty
    const problemMetaData = await prisma.problem.findMany({
      where: { difficulty: difficultyMap[prepLevel] },
      select: { slug: true, title: true, difficulty: true },
    });

    // AI generation — fully outside transaction, can take 20-30s
    const roadmapOutput = await generateRoadmap(
      company,
      timespan,
      prepLevel,
      problemMetaData,
    );

    // only DB writes inside transaction — completes in milliseconds
    const [roadmap] = await prisma.$transaction([
      prisma.roadmap.create({
        data: {
          title: roadmapOutput.title,
          description: roadmapOutput.description,
          company,
          prepLevel,
          status: "PRIVATE",
          data: roadmapOutput,
          userId: session.user.id,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { roadmapCredits: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: roadmap,
        message: "Roadmap generated successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[ROADMAP_GENERATION_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Failed to generate roadmap. Please try again.",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// GET /api/roadmap — list view, no data blob
// ============================================================

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  const isAuthenticated = !!userId;

  try {
    // Always fetch public roadmaps
    const publicRoadmaps = await prisma.roadmap.findMany({
      where: { status: "PUBLIC" },
      select: roadmapListSelect,
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    // Only fetch user-specific data if authenticated
    let userRoadmaps: any[] = [];
    let currentUser = null;

    if (isAuthenticated && userId) {
      [userRoadmaps, currentUser] = await Promise.all([
        prisma.roadmap.findMany({
          where: { userId },
          select: roadmapListSelect,
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            premium: true,
            roadmapCredits: true,
          },
        }),
      ]);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          publicRoadmaps,
          userRoadmaps,
          user: {
            id: userId ?? null,
            premium: currentUser?.premium ?? false,
            roadmapCredits: currentUser?.roadmapCredits ?? 0,
            isAuthenticated,
          },
        },
        message: "Data fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ROADMAP_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, data: null, message: "Failed to fetch roadmaps" },
      { status: 500 },
    );
  }
}
