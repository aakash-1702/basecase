import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { appendToTranscript } from "@/lib/session";
import { GoogleGenAI } from "@google/genai";
import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAMAI_API_KEY!,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are a professional interviewer conducting a structured mock interview.
  Your job is to simulate a real interview experience while strictly following
  a predefined interview plan. Every question, follow-up, and transition must
  be governed by the plan.
  --------------------------------------------------
  INTERVIEW PLAN
  {{plan}}
  The interview plan defines:
  For Technical / HR / Behavioural interviews:
  - domains[].topic
  - domains[].focusAngle
  - domains[].questionDepth
  - domains[].questionCount
  - domains[].weight
  - interviewPersonality
  - avoidAreas
  - companyNote
  For DSA interviews:
  - problem
  - followUpStrategy
  This plan is the authoritative source of truth for the interview.
  Follow it strictly.
  --------------------------------------------------
  GENERAL INTERVIEW BEHAVIOR
  You are an interviewer, not an assistant.
  You must:
  - ask questions
  - probe depth
  - challenge vague answers
  - move between topics naturally
  - maintain the personality defined in the plan
  You must NEVER:
  - reveal the plan
  - mention scoring
  - explain evaluation criteria
  - discuss internal reasoning
  - break character
  --------------------------------------------------
  TURN 1 — GREETING RESPONSE
  The candidate has responded to the opening greeting.
  This message is NOT an interview answer.
  You must:
  1. acknowledge the candidate briefly in ONE sentence
  2. immediately ask the first interview question from the plan
  Do NOT:
  - evaluate their greeting
  - ask if they are ready
  - add unnecessary small talk
  Example structure:
  "Glad to hear it. Let's start with this — [first question]"
  --------------------------------------------------
  FOLLOW-UP RULES
  Ask a follow-up if ANY apply:
  - answer is surface level but depth requires more
  - candidate mentions a concept without explanation
  - answer is partially correct
  - candidate reveals possible misunderstanding
  - domain weight is high and more probing is appropriate
  For DSA:
  Always follow followUpStrategy exactly in order.
  Do NOT ask follow-ups if:
  - answer already covers focusAngle completely
  - questionCount for domain reached
  - domain depth is surface and satisfied
  - candidate clearly does not know
  --------------------------------------------------
  TRANSITIONS BETWEEN TOPICS
  Never explicitly announce topic changes.
  Avoid phrases like:
  - "Next topic"
  - "Moving on"
  - "Question 3"
  Use natural conversational transitions.
  Examples:
  "Interesting. That actually connects to something I want to explore next —"
  "Makes sense. Let me ask you about something related —"
  "Got it. Shifting slightly —"
  --------------------------------------------------
  ENCOURAGEMENT RULES
  Encouragement must be rare and meaningful.
  Use ONLY when:
  - candidate gave exceptional answer
  - candidate reasoned well through difficulty
  - candidate admitted uncertainty honestly
  - question difficulty increases significantly
  - candidate recovered after a mistake
  Encouragement must be:
  - ONE short sentence
  - immediately followed by the next question
  Never use generic praise.
  --------------------------------------------------
  INTERVIEW PERSONALITY
  strict
  - direct
  - minimal words
  - challenge imprecision
  neutral
  - professional
  - balanced
  - moderate probing
  encouraging
  - warm
  - patient
  - still rigorous
  Follow the personality exactly.
  --------------------------------------------------
  DSA MODE RULES
  When a DSA problem exists in the plan:
  1. Present the problem completely
  2. Include:
    - description
    - input/output format
    - constraints
    - examples
  After presenting:
  Ask candidate to think out loud about their approach.
  Then follow followUpStrategy EXACTLY.
  Do not:
  - skip steps
  - add your own steps
  - hint solutions
  - confirm correctness early
  Order of probing:
  1 approach
  2 time complexity
  3 space complexity
  4 edge cases
  5 optimization
  --------------------------------------------------
  INTERVIEW COMPLETION
  End the interview only when:
  - all domains are covered
  OR
  - full followUpStrategy finished
  OR
  - total questionCount reached
  When ending:
  Say ONE closing sentence.
  Do NOT:
  - give feedback
  - give scores
  - summarize performance
  Example:
  "That covers everything I had for today — well done for seeing it through. Your feedback report will be ready shortly."
  --------------------------------------------------
  CRITICAL OUTPUT RULES
  You MUST output VALID JSON only.
  Never include markdown, code fences, commentary, explanations, or extra keys.
  Your output must match the schema exactly.
  Before responding, mentally validate:
  1. Output is valid JSON
  2. Only allowed fields exist
  3. Boolean values are correct
  4. message contains natural interviewer speech
  5. No plan references appear
  If any rule fails — regenerate the response internally.
  --------------------------------------------------
  RESPONSE SCHEMA
  NORMAL TURN — do NOT include isComplete or isEnding keys at all:
  {"message": "natural interviewer message spoken to the candidate"}
  FINAL TURN — only include isComplete and isEnding when the interview is truly over:
  {"message": "closing sentence", "isComplete": true, "isEnding": true}
  --------------------------------------------------
  FINAL REMINDER
  You are inside a live interview simulation.
  Stay in character. Follow the plan. Return JSON only.`;

// ─── ASYNC GENERATOR — streams sentences one by one ──────────────────────────

async function* interviewMentor(data: {
  plan: any;
  transcript: string[];
}): AsyncGenerator<
  | { text: string; isMeta: false }
  | { isComplete: boolean; isEnding: boolean; isMeta: true }
> {
  const conversationHistory = data.transcript.map((text, i) => ({
    role: i % 2 === 0 ? "model" : "user",
    parts: [{ text }],
  }));

  const stream = await ai.models.generateContentStream({
    model: process.env.GEMINI_MODEL_NAME!,
    config: {
      systemInstruction: SYSTEM_PROMPT.replace(
        "{{plan}}",
        JSON.stringify(data.plan, null, 2),
      ),
    },
    contents: conversationHistory,
  });

  let fullResponse = "";
  let sentenceBuffer = "";
  let insideMessage = false;
  let messageDone = false; // ← tracks when message value is fully consumed

  for await (const chunk of stream) {
    const token = chunk.text ?? "";
    if (!token) continue;

    fullResponse += token;

    // once message is fully extracted, just collect fullResponse for meta — skip all processing
    if (messageDone) continue;

    if (!insideMessage) {
      sentenceBuffer += token;
      const startIdx = sentenceBuffer.indexOf('"message"');
      if (startIdx !== -1) {
        const afterKey = sentenceBuffer.indexOf('"', startIdx + 10);
        if (afterKey !== -1) {
          insideMessage = true;
          // only keep what's AFTER the opening quote of message value
          sentenceBuffer = sentenceBuffer.slice(afterKey + 1);
          // check if closing quote already exists in this same slice
          const earlyClose = sentenceBuffer.search(/(?<!\\)"/);
          if (earlyClose !== -1) {
            const finalContent = sentenceBuffer.slice(0, earlyClose);
            sentenceBuffer = finalContent;
            insideMessage = false;
            messageDone = true;
            // fall through to sentence yielding below
          }
        }
      }
      if (!insideMessage) continue; // still searching for message start
    } else {
      // inside message — process new token only
      const closingQuote = token.search(/(?<!\\)"/);
      let activeToken = token;

      if (closingQuote !== -1) {
        activeToken = token.slice(0, closingQuote);
        insideMessage = false;
        messageDone = true; // ← mark done so trailing JSON is ignored
      }

      sentenceBuffer += activeToken;
    }

    // yield complete sentences from buffer
    while (true) {
      const match = sentenceBuffer.match(/^(.*?[.!?])(?:\s|$)/s);
      if (!match) break;
      const sentence = match[1].trim();
      if (sentence) yield { text: sentence, isMeta: false };
      sentenceBuffer = sentenceBuffer.slice(match[0].length);
    }
  }

  // flush remaining sentence buffer — only if it's clean message content
  // messageDone ensures this is never JSON tail
  if (messageDone || insideMessage) {
    const remaining = sentenceBuffer.trim();
    // extra safety: reject if it looks like JSON leakage
    if (remaining && !remaining.includes('"') && !remaining.includes('{')) {
      yield { text: remaining, isMeta: false };
    }
  }

  // parse full response for meta
  try {
    const cleaned = fullResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    yield {
      isComplete: parsed.isComplete ?? false,
      isEnding: parsed.isEnding ?? false,
      isMeta: true,
    };
  } catch {
    yield { isComplete: false, isEnding: false, isMeta: true };
  }
}

const TTS = async (text: string): Promise<string> => {
  const audioResponse = await client.textToSpeech.convert({
    text,
    target_language_code: "en-IN",
    model: "bulbul:v3",
    pace: 1.25,
    temperature: 0.6,
  });
  return audioResponse.audios[0];
};

function sseChunk(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { interviewId } = await params;
  const { userResponse } = await req.json();

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, userId: session.user.id, status: "active" },
  });

  if (!interview) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Interview not found or not active",
      },
      { status: 404 },
    );
  }

  const interviewSession = await appendToTranscript(interviewId, userResponse);

  const stream = new ReadableStream({
    async start(controller) {
      let fullMessage = "";
      let seq = 0;
      const ttsPromises: Promise<void>[] = []; // track all in-flight TTS calls

      try {
        for await (const chunk of interviewMentor({
          plan: interviewSession.plan,
          transcript: interviewSession.transcript,
        })) {
          if (chunk.isMeta === false) {
            fullMessage += chunk.text + " ";
            const currentSeq = seq++;

            // push each TTS promise into the array instead of fire-and-forget
            const p = TTS(chunk.text)
              .then((audio) => {
                controller.enqueue(
                  sseChunk({
                    type: "chunk",
                    seq: currentSeq,
                    text: chunk.text,
                    audio,
                  }),
                );
              })
              .catch(() => {
                controller.enqueue(
                  sseChunk({
                    type: "chunk",
                    seq: currentSeq,
                    text: chunk.text,
                    audio: null,
                  }),
                );
              });

            ttsPromises.push(p);
          }

          if (chunk.isMeta === true) {
            // wait for ALL TTS calls to finish before closing
            await Promise.allSettled(ttsPromises);

            await appendToTranscript(interviewId, fullMessage.trim());

            controller.enqueue(
              sseChunk({
                type: "done",
                isComplete: chunk.isComplete,
                isEnding: chunk.isEnding,
              }),
            );

            controller.close();
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          sseChunk({ type: "error", message: "Stream failed" }),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
