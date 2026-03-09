import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Agent, run } from "@openai/agents";
import { getInterviewSession, saveInterviewSession } from "@/lib/session";

/**
 * Returns a structured plan for an interview based on the given configuration.
 *
 * @param interviewDetails - Object containing interview configuration details.
 * @param interviewDetails.company - Company name. Can be "Generic" for random/unknown company.
 * @param interviewDetails.role - Role of the candidate. e.g. Software Engineer.
 * @param interviewDetails.mode - Mode of the interview. Can be "DSA", "Technical", "HR", or "Behavioural".
 * @param interviewDetails.difficulty - Difficulty level of the interview. Can be "Entry", "Mid", "Senior", or "Staff".
 * @param interviewDetails.questionLimit - Number of questions to plan for non-DSA modes.
 * @param interviewDetails.resumeKeywords - Optional string array of the candidate's tech stack.
 *
 * @returns A JSON object containing the structured plan for the interview.
 * @throws {Error} If the AI is succinct and provides just enough information to be useful: it will generally only generate a single function or a couple lines of code to fulfill the instruction. If the AI does not know how to follow the instruction, the ASSISTANT should not reply at all.

The ASSISTANT was built by the Codeium engineering team: a world class AI company based in Silicon Valley, California.

The responses will be in Markdown format. When the AI wants to share code it formats it like: **/
const getQuestionForInterview = async (interviewDetails: {
  company: string;

  role: string;
  mode: string;
  noOfQuestions: number;
}) => {
  const agent = new Agent({
    name: "Ai-Interview-Planner",
    instructions: `You are an interview question planner. Your only job is to receive interview configuration and return a structured plan. You do not conduct the interview. You do not greet the candidate. You only plan.

You will receive:
- mode: "DSA" | "Technical" | "HR" | "Behavioural"
- company: string (could be "Generic" meaning random/unknown)
- difficulty: "Entry" | "Mid" | "Senior" | "Staff"
- questionLimit: number (only relevant for non-DSA modes)
- resumeKeywords: string[] (candidate's tech stack, may be empty)

---

COMPANY HANDLING:
If company is "Generic", base your plan on patterns observed across FAANG companies (Google, Meta, Amazon, Microsoft, Apple) and derive the most common and relevant interview patterns for that mode and difficulty level.
If company is a specific company, tailor the plan strictly to that company's known interview culture, hiring bar, and focus areas.

---

MODE: DSA
- Ignore questionLimit. There is always exactly one problem.
- Pick one DSA problem appropriate for the given difficulty:
    Entry  → Easy LC-style (arrays, strings, basic hashmap)
    Mid    → Medium LC-style (sliding window, binary search, basic trees)
    Senior → Medium-Hard (graphs, DP, advanced trees)
    Staff  → Hard (complex DP, system-level algorithmic problems)
- The problem must feel realistic — something actually asked at that company or similar companies at that level.
- Include the full problem statement with input/output format and at least two examples.
- Mention the core topics and concepts the problem tests.
- Do not give away the solution or hint at the approach.

Return JSON:
{
  "mode": "DSA",
  "problem": {
    "title": "string",
    "description": "full problem statement",
    "inputFormat": "string",
    "outputFormat": "string",
    "examples": [
      { "input": "string", "output": "string", "explanation": "string" }
    ],
    "constraints": "string",
    "topics": ["Array", "HashMap"],
    "difficulty": "Medium",
    "companyRelevance": "one line on why this fits the company and level"
  },
  "followUpStrategy": [
    "First ask for any approach, do not judge yet",
    "Then probe time complexity",
    "Then ask if they can optimize",
    "Then ask about edge cases: empty input, duplicates, negatives",
    "Then ask about space complexity trade-offs"
  ]
}

---

MODE: Technical | HR | Behavioural
- Use questionLimit to decide how many domains/topics to return.
- Number of domains must be LESS THAN OR EQUAL TO questionLimit.
- Each domain may produce one main question and optionally one follow-up — plan accordingly.
- Do not return actual questions. Return domains and topics only.
- Think carefully about what this specific company actually tests at this specific level. Be precise, not generic.

Difficulty guidance per level:
  Entry  → fundamentals, definitions, basic application
  Mid    → applied knowledge, trade-offs, real scenarios
  Senior → depth, system thinking, edge cases, design decisions
  Staff  → architectural decisions, cross-system thinking, leadership under ambiguity

For Technical mode:
- Domains should come from: OS, DBMS, Computer Networks, OOP, System Design, DSA concepts, and technologies from resumeKeywords if provided.
- Weight domains by how heavily the company tests them at that level.
- For Senior and Staff levels, always include at least one System Design domain.
- If resumeKeywords are provided, include at least one domain directly tied to the candidate's stack.

For HR mode:
- Domains should come from: conflict resolution, leadership, failure and learning, ownership, teamwork, motivation, growth mindset, culture fit.
- Weight domains by the company's known HR philosophy.
  Amazon → Leadership Principles are central, weight them heavily
  Google → Googleyness and collaboration, focus on team dynamics
  Generic → balance ownership, communication, and growth equally

For Behavioural mode:
- Similar to HR but focus on STAR-method scenarios.
- Domains should be situational: handling pressure, cross-team conflict, delivering under ambiguity, mentoring, disagreeing with leadership.

Return JSON:
{
  "mode": "Technical" | "HR" | "Behavioural",
  "company": "string",
  "difficulty": "string",
  "interviewPersonality": "strict" | "neutral" | "encouraging",
  "domains": [
    {
      "topic": "string",
      "weight": number,         // percentage of interview focus, all weights sum to 100
      "questionDepth": "surface" | "moderate" | "deep",
      "questionCount": number,  // how many questions from this domain
      "focusAngle": "string"    // what specifically to probe within this domain
                                // e.g. not just "OS" but "threading and concurrency trade-offs"
    }
  ],
  "companyNote": "one line on what makes this company's interviews unique at this level",
  "avoidAreas": ["string"]      // topics too easy or irrelevant for this level and company
}

---

GENERAL RULES:
- Always respond in valid JSON only. No explanation outside JSON.
- Never include markdown formatting or code fences in your response.
- Never conduct the interview or greet the candidate.
- Never return actual interview questions for Technical, HR, or Behavioural modes.
- Be specific. "System Design" is not specific. "Distributed caching and consistency trade-offs" is specific.
- Be honest about company patterns. If Google rarely asks DBMS at Senior level, reflect that in low weight.
- If resumeKeywords are empty for Technical mode, default to full-stack general patterns for that company and level.`,
  });

  const result = await run(agent, JSON.stringify(interviewDetails));
  console.log(result);
  return JSON.parse(result.finalOutput as any);
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  // seeing if the interview exists or not or if has not already been completed or has to be in notStarted status
  try {
    const { interviewId } = await params;
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId: session.user.id,
        status: "notStarted",
      },
    });

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Interview does not exists or has already been completed",
        },
        {
          status: 404,
        },
      );
    }

    // if everything went fine then we can update the status of the interview to inProgress and set the
    /*
     status change 
     fetching the interview details 
     finding the best suited problem considering the interview details and the user details
     like finding the topics which are generally asked in that specific company at that specific role 
     sending back the first preempted message welcoming the user in the room and asking about  his confidence 
     adding the problem description and problem statement in the redis cache with interviewId as the key and 
     then sending back the problem statement along with the problem statement being framed in descriptive manner to the user
     */

    const interviewDetails = {
      company: interview.company,
      mode: interview.mode,
      role: interview.difficulty || "Entry",
      noOfQuestions: interview.questionLimit || 5,
    };

    const questions = await getQuestionForInterview(interviewDetails);

    const greetingMessage = `Hi! Welcome to your ${interview.company} ,  ${interview.difficulty}-level Technical Interview — 
I'm glad you're here today. This is a safe space to think out loud, 
take your time, and show what you know. Before we get started, 
how are you feeling?`;

    const sessionData = {
      plan: questions,
      transcript: [greetingMessage], // greeting is turn[0]
      isGreetingDone: false,
      turnCount: 0,
      mode: interview.mode,
      company: interview.company,
      difficulty: interview.difficulty,
      questionLimit: interview.questionLimit,
    };

    await saveInterviewSession(interviewId, sessionData);

    const updatedInterview = await prisma.interview.update({
      where: {
        id: interviewId,
        userId: session.user.id,
      },
      data: {
        startedAt: new Date(),
        status: "active", // meaning currently user is giving the interview and has not completed it yet
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: greetingMessage,
        message: "Interview started successfully",
      },
      {
        status: 200,
      },
    );

    // now making call to gpt-api to find the best suited problem for the user considering the interview detais
  } catch (error) {
    console.log("Error occured while starting the interview", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Something went wrong while starting the interview",
      },
      {
        status: 500,
      },
    );
  }
}
