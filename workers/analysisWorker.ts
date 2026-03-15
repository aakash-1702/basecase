import { Agent, run } from "@openai/agents";
import express from 'express';
const app = express();




import { connection } from "@/lib/queue";
import { Worker, Job } from "bullmq";
import prisma from "@/lib/prisma";
import { prismaVersion } from "@/generated/prisma/internal/prismaNamespace";

const ANALYSIS_INSTRUCTION = `You are an expert technical interviewer and communication coach.

Your task is to analyze a full interview transcript between a candidate and an interviewer and produce a structured evaluation of the candidate’s performance.

You must evaluate the candidate objectively based only on what appears in the transcript.

Return the output strictly in valid JSON format following the schema described below. Do not include explanations outside the JSON.

SCORING GUIDELINES
All scores must be between 0 and 10.

[0,3] → Poor
[4,6] → Average
[7,8] → Good
[9,10] → Excellent

EVALUATION DIMENSIONS

1. confidence
Evaluate how confidently the candidate communicates.
Consider:
- hesitation
- filler words
- clarity of thought
- ability to explain ideas
- composure under questioning

Return:
{
  "score": number,
  "summary": short explanation
}

2. depthReview
Evaluate how deeply the candidate understands the topic.
Consider:
- conceptual clarity
- reasoning
- ability to explain why something works
- edge case thinking
- tradeoff awareness

Return:
{
  "score": number,
  "summary": short explanation
}

3. englishQuality
Evaluate spoken communication quality.
Consider:
- grammar
- sentence clarity
- articulation
- professional communication

Return:
{
  "score": number,
  "summary": short explanation
}

4. technicalAccuracy (ONLY if interview type is TECHNICAL or DSA)
Evaluate correctness of technical explanations.

Consider:
- correctness of algorithm or concept
- time and space complexity understanding
- logical reasoning
- bug awareness
- correctness of examples

Return:
{
  "score": number,
  "summary": short explanation
}

5. starStructure (ONLY if interview type is HR or behavioural)
Evaluate if answers follow the STAR framework:
Situation
Task
Action
Result

Return:
{
  "score": number,
  "summary": short explanation
}

STRONG AREAS
List 3–5 strengths demonstrated in the interview.

Examples:
- strong algorithm intuition
- clear communication
- structured thinking
- good debugging reasoning

WEAK AREAS
List 3–5 areas needing improvement.

Examples:
- shallow explanation of concepts
- hesitation while speaking
- incomplete answers
- missing edge cases

RECOMMENDATIONS
Provide 3–5 actionable recommendations the candidate can follow to improve interview performance.

Examples:
- practice explaining algorithms aloud
- review time complexity analysis
- structure answers before speaking

OVERALL SCORE
Calculate an overall score between 0 and 10 based on all relevant evaluation dimensions.

OUTPUT FORMAT

Return JSON strictly in this format:

{
  "overallScore": number,
  "confidence": {
    "score": number,
    "summary": "string"
  },
  "depthReview": {
    "score": number,
    "summary": "string"
  },
  "englishQuality": {
    "score": number,
    "summary": "string"
  },
  "technicalAccuracy": {
    "score": number,
    "summary": "string"
  },
  "starStructure": {
    "score": number,
    "summary": "string"
  },
  "strongAreas": ["string"],
  "weakAreas": ["string"],
  "recommendations": ["string"]
}

Important Rules

- Only include "technicalAccuracy" if the interview is technical or DSA.
- Only include "starStructure" if the interview is HR or behavioural.
- Do not invent information that is not present in the transcript.
- Be concise but meaningful.
- Always return valid JSON.`;

export const analyseInterview = async (job: Job) => {
  const { interviewId, transcript, mode } = job.data;

  // refining the transcript
  const refinedTranscript = transcript
    .map(
      (text: string, i: number) =>
        `[Turn ${Math.floor(i / 2) + 1}] ${i % 2 === 0 ? "INTERVIEWER" : "CANDIDATE"}:\n${text}`,
    )
    .join("\n\n");

    const transcriptForDB = transcript
    .map(
      (text: string, i: number) =>
        `[Turn ${Math.floor(i / 2) + 1}] ${i % 2 === 0 ? "INTERVIEWER" : "CANDIDATE"}:\n${text}`,
    );

  // generating the review using the agent
  const agent = new Agent({
    name: "Interview Report Generator",
    instructions: ANALYSIS_INSTRUCTION,
  });

  try {
    const analysedReport = await run(
      agent,
      `Interview Mode : ${mode} \n\n Transcript : ${refinedTranscript} `,
    );

    const analysis = analysedReport.finalOutput;

    if (!analysis) {
      throw new Error("No analysis generated");
    }

    const cleaned = analysis.replace(/```json|```/g, "").trim();
    const feedback = JSON.parse(cleaned);

    const interviewReport = await prisma.interviewFeedback.create({
      data: {
        interviewId,
        overallScore: feedback.overallScore,
        confidence: feedback.confidence,
        depthReview: feedback.depthReview,
        englishQuality: feedback.englishQuality,
        technicalAccuracy: feedback.technicalAccuracy,
        starStructure: feedback.starStructure,
        strongAreas: feedback.strongAreas,
        weakAreas: feedback.weakAreas,
        recommendations: feedback.recommendations,
        transcript: transcriptForDB,
      },
    });

    const updateInterviewStatus = await prisma.interview.update({
      where: {
        id: interviewId,
      },
      data: {
        status: "completed",
      },
    });

    console.log(`Interview ${interviewId} analysis saved`);
  } catch (error) {
    console.log("Error generating interview analysis", error);

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "failed" },
    });

    throw error; // rethrow so BullMQ knows the job failed and can retry
  }
};

const worker = new Worker("interview-analysis", analyseInterview, {
  connection,
  concurrency: 2,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Worker started — listening for jobs...");


app.listen(process.env.PORT, () => {
  console.log(`Express server running on port ${process.env.PORT}`);
});



