import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import {
  saveInterviewSession,
  getInterviewSession,
  appendToTranscript,
} from "@/lib/session";
import { success } from "zod";
import { GoogleGenAI } from "@google/genai";
import { SarvamAIClient } from "sarvamai";
import next from "next";
const client = new SarvamAIClient({
  apiSubscriptionKey: `${process.env.SARVAMAI_API_KEY!}`,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are a professional interviewer conducting a structured mock interview.

Your job is to simulate a real interview experience while strictly following
a predefined interview plan. Every question, follow-up, and transition must
be governed by the plan.

You must ALWAYS respond using the JSON schema defined at the end of this prompt.
Never output any text outside JSON.

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

• answer is surface level but depth requires more
• candidate mentions a concept without explanation
• answer is partially correct
• candidate reveals possible misunderstanding
• domain weight is high and more probing is appropriate

For DSA:
Always follow followUpStrategy exactly in order.

Do NOT ask follow-ups if:

• answer already covers focusAngle completely
• questionCount for domain reached
• domain depth is surface and satisfied
• candidate clearly does not know

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
• candidate gave exceptional answer
• candidate reasoned well through difficulty
• candidate admitted uncertainty honestly
• question difficulty increases significantly
• candidate recovered after a mistake

Encouragement must be:
- ONE short sentence
- immediately followed by the next question

Never use generic praise.

--------------------------------------------------

INTERVIEW PERSONALITY

strict
• direct
• minimal words
• challenge imprecision

neutral
• professional
• balanced
• moderate probing

encouraging
• warm
• patient
• still rigorous

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
• skip steps
• add your own steps
• hint solutions
• confirm correctness early

Order of probing:

1 approach
2 time complexity
3 space complexity
4 edge cases
5 optimization

--------------------------------------------------

INTERVIEW COMPLETION

End the interview only when:

• all domains are covered
OR
• full followUpStrategy finished
OR
• total questionCount reached

When ending:

Say ONE closing sentence.

Do NOT:
• give feedback
• give scores
• summarize performance

Example:

"That covers everything I had for today — well done for seeing it through. Your feedback report will be ready shortly."

--------------------------------------------------

CRITICAL OUTPUT RULES

You MUST output VALID JSON only.

Never include:
• markdown
• code fences
• commentary
• explanations
• extra keys

Your output must match this schema EXACTLY.

Before responding, mentally validate:

1. Output is valid JSON
2. Only allowed fields exist
3. Boolean values are correct
4. message contains natural interviewer speech
5. No plan references appear

If any rule fails — regenerate the response internally.

--------------------------------------------------

RESPONSE SCHEMA

NORMAL TURN

{
  "message": "natural interviewer message spoken to the candidate",
  "isComplete": false,
  "isEnding": false
}

FINAL TURN

{
  "message": "closing sentence",
  "isComplete": true,
  "isEnding": true
}

--------------------------------------------------

FINAL REMINDER

You are inside a live interview simulation.

Stay in character.
Follow the plan.
Return JSON only.`;

const interviewMentor = async (data: {
  plan: any;
  transcript: string[];
}): Promise<{ message: string; isComplete: boolean; isEnding: boolean }> => {
  const conversationHistory = data.transcript.map((text, i) => ({
    role: i % 2 === 0 ? "model" : "user",
    parts: [{ text }],
  }));

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL_NAME!,
    config: {
      systemInstruction: SYSTEM_PROMPT.replace(
        "{{plan}}",
        JSON.stringify(data.plan, null, 2),
      ),
      responseMimeType: "application/json",
    },
    contents: conversationHistory,
  });

  const raw = response.text;
  if (!raw) {
    throw new Error("No response text received from AI model");
  }

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed as {
      message: string;
      isComplete: boolean;
      isEnding: boolean;
    };
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", raw);
    throw new Error("AI returned invalid JSON");
  }
};

const TTS = async (text: string) => {
  const audioResponse = await client.textToSpeech.convert({
    text: text,
    target_language_code: "en-IN",
    model: "bulbul:v3",
    pace: 1.25,
    temperature: 0.6,
  });

  console.log(audioResponse);

  return audioResponse.audios[0]; // This is the binary audio data
};
export async function PATCH(
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

  // user responds back to the greeting message we need to start the interview session and save it in redis
  try {
    const { interviewId } = await params;
    // checking if the interview is valid and active or not
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId: session.user.id,
        status: "active",
      },
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

    // pushing user response to the transcript
    const { userResponse } = await req.json();
    const interviewSession = await appendToTranscript(
      interviewId,
      userResponse,
    );

    const nextQuestion = await interviewMentor({
      plan: interviewSession.plan,
      transcript: interviewSession.transcript,
    });

    if (!nextQuestion || !nextQuestion.message) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Failed to generate next question",
        },
        { status: 500 },
      );
    }

    const audioData = nextQuestion.isEnding
      ? null
      : await TTS(nextQuestion.message);

    await appendToTranscript(interviewId, nextQuestion.message);

    return NextResponse.json(
      {
        success: true,
        data: {
          nextQuestion: nextQuestion.message,
          audioData,
          isComplete: nextQuestion.isComplete || false,
          isEnding: nextQuestion.isEnding || false,
        },
        message: "User response recorded and next question generated",
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error during interview session:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "An error occurred during the interview session",
      },
      { status: 500 },
    );
  }
}
