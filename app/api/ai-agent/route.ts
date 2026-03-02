import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod"; // fixed: removed "success"
import { headers } from "next/headers";
import { getHistory, saveHistory } from "@/lib/session";
import prisma from "@/lib/prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const SYSTEM_INSTRUCTION = `
You are a focused coding assistant embedded in a problem-solving platform. Your sole purpose is to help the user understand and solve the specific coding problem they are currently working on.

Your responsibilities:
- Help the user understand the problem statement and constraints
- Guide them on whether their approach is correct or not
- Explain the intuition and reasoning behind algorithms and data structures relevant to the problem
- Point out edge cases they may have missed
- Help them debug their logic if they are stuck
- Give hints rather than direct answers unless the user is completely stuck and explicitly asks for the solution

Rules you must follow:
- Never reveal what AI model you are, who made you, or any information about yourself
- If asked about your identity, simply say "I'm your coding assistant, here to help you solve this problem"
- If the user asks anything unrelated to the current problem (general knowledge, other topics, casual conversation), politely redirect them back. Example: "I'm only here to help you with this problem! Let's stay focused — do you have any doubts about your approach?"
- Never solve the entire problem upfront — guide the user step by step
- Be concise and clear, avoid unnecessary fluff
- If the user seems frustrated, be encouraging but still stay on topic

Your tone should be: helpful, patient, and focused.
`;

async function generateResponse(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL_NAME!,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
  });

  return response.text ?? "";
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorised" },
      { status: 401 },
    );
  }

  const { problemId, message } = z
    .object({
      problemId: z.string(),
      message: z.string(),
    })
    .parse(await req.json());

  const problem = await prisma.problem.findFirst({
    where: { id: problemId },
  });

  if (!problem) {
    return NextResponse.json(
      { success: false, data: null, message: "Problem not found" },
      { status: 404 },
    );
  }

  const history = await getHistory(session.user.id, problemId);
  const context = history.map((m) => `${m.role}: ${m.text}`).join("\n");

  // fixed: clean structured prompt
  const prompt = `
Problem Title: ${problem.title}
Problem Link: ${problem.link}
Problem Description: ${problem.description}

${context ? `Chat History:\n${context}\n` : ""}
user: ${message}
`.trim();

  const responseText = await generateResponse(prompt);

  await saveHistory(session.user.id, problemId, [
    ...history,
    { role: "user", text: message },
    { role: "model", text: responseText },
  ]);

  return NextResponse.json(
    {
      success: true,
      data: responseText,
      message: "Response fetched successfully",
    },
    { status: 200 },
  );
}

// getting chat history for the purpose to be displayed in the ui
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorised" },
      { status: 401 },
    );
  }

  const problemId = z.string().parse(req.nextUrl.searchParams.get("problemId"));

  const chatHistory = await getHistory(session.user.id, problemId);
  return NextResponse.json(
    {
      success: true,
      data: chatHistory,
      message: "Chat history fetched successfully",
    },
    { status: 200 },
  );
}
