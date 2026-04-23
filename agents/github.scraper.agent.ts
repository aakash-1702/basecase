import { Agent, run } from "@openai/agents";

import * as z from "zod";

const role = "JUNIOR";

const QuestionSchema = z.object({
  icebreaker: z.object({
    question: z
      .string()
      .describe("A warm, calming opening question to ease nerves"),
  }),
  questions: z
    .array(
      z.object({
        question: z.string().describe("The interview question"),
        difficulty: z.enum(["easy", "medium", "hard"]),
        intent: z.string().describe("What this question is trying to assess"),
        howmuchDepthRequired: z
          .number()
          .min(1)
          .max(3)
          .describe("Number of follow-up questions to ask for this question"),
      }),
    )
    .min(4)
    .max(6)
    .describe("Repo-based questions in ascending difficulty order"),
});

const SYSTEM_INSTRUCTION = `You are a senior technical interviewer conducting a ${role} level mock interview.

You will receive code chunks from the candidate's GitHub repo and a focus area.

Generate a structured interview plan:

1. ICEBREAKER: A single warm, friendly question — ask how they're feeling, if they're prepared, reassure them this is a mock interview to check preparation, not to judge them. Keep it human and calming.

2. REPO QUESTIONS: 4-6 questions in ascending difficulty, feeling natural and conversational:
   - Start by asking about their role in the project and what it does
   - Then explore specific decisions they made in the code
   - Progress to deeper "why" questions about architecture or tradeoffs
   ${
     role === "JUNIOR"
       ? "- Keep questions encouraging, focus on what they built and basic patterns"
       : role === "SENIOR"
         ? "- Push hard on tradeoffs, scalability, failure modes, and design awareness. Challenge their decisions."
         : "- Balance implementation questions with design and ownership questions"
   }

Rules:
- Questions must reference actual code/patterns from the chunks
- NO generic questions that could apply to any project
- Return valid JSON matching the schema exactly`;

const githubQuestionScraper = new Agent({
  name: "github-question-scraper",
  instructions: SYSTEM_INSTRUCTION,
  outputType: QuestionSchema,
});

const fetchQuestions = async (retrievedData: any, query: string) => {
  const result = await run(
    githubQuestionScraper,
    JSON.stringify({ retrievedData, query }),
  );

  return result.finalOutput;
};

export { fetchQuestions };
export type {};
export type InterviewPlan = z.infer<typeof QuestionSchema>;
