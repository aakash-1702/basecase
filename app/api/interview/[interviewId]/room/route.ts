import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import {
  getInterviewDetails,
  saveInterviewSession,
  InterviewSession,
} from "@/lib/session";
import decideNextActionForInterview from "@/lib/next-action-from-ai";
import {
  followUpQuestion,
  mainQuestion,
} from "@/lib/interview-questions-aiagent";
import { Transform } from "stream";
import { SarvamAIClient } from "sarvamai";

const ROLLING_WINDOW = 6;

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAMAI_API_KEY!,
});

const textToSpeech = async (text: string) => {
  return await client.textToSpeech.convert({
    text,
    target_language_code: "en-IN",
    speaker: "shubh",
    pace: 1.2,
    speech_sample_rate: 16000,
    enable_preprocessing: true,
    model: "bulbul:v2",
  });
};

function sentenceSplitter(): Transform {
  let buffer = "";
  return new Transform({
    readableObjectMode: true,
    transform(chunk, _, callback) {
      buffer += chunk.toString();
      const sentences = buffer.split(/(?<=[.?!])\s+/);
      buffer = sentences.pop() || "";
      for (const s of sentences) {
        if (s.trim()) this.push(s.trim());
      }
      callback();
    },
    flush(callback) {
      if (buffer.trim()) this.push(buffer.trim());
      callback();
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, data: null, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { interviewId, userResponse } = await req.json();

  if (!interviewId || !userResponse) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message:
          "Invalid request body, interviewId and userResponse are required",
      },
      { status: 400 },
    );
  }

  const interviewIdExists = await prisma.interview2.findFirst({
    where: { id: interviewId, userId: session.user.id, status: "IN_PROGRESS" },
    select: { id: true, repoLink: true, repoId: true },
  });

  if (!interviewIdExists) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Interview not found or already completed",
      },
      { status: 404 },
    );
  }

  const interviewDetails: InterviewSession | null = await getInterviewDetails(
    interviewId,
    session.user.id,
  );

  if (!interviewDetails) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Interview details not found for the given interviewId",
      },
      { status: 404 },
    );
  }

  const curIndex = interviewDetails.currentQuestionIndex;
  const followupCount = interviewDetails.followupCountForCurrent;

  // Push candidate response to both transcripts
  const candidateTurn = {
    role: "candidate" as const,
    content: userResponse,
    timestamp: Date.now(),
    questionIndex: curIndex,
    isFollowup: false,
  };
  interviewDetails.transcript.push(candidateTurn);
  interviewDetails.rollingTranscript.push(candidateTurn);
  interviewDetails.totalTurns += 1;

  // Trim rolling transcript to window
  if (interviewDetails.rollingTranscript.length > ROLLING_WINDOW) {
    interviewDetails.rollingTranscript =
      interviewDetails.rollingTranscript.slice(-ROLLING_WINDOW);
  }

  // Decide next step
  const nextStep = decideNextActionForInterview(
    curIndex,
    followupCount,
    interviewDetails.questions.length,
  );

  let currentQuestion: import("stream").Readable | string | null = null;

  if (nextStep === "follow-up") {
    interviewDetails.followupCountForCurrent += 1;
    currentQuestion = await followUpQuestion(
      interviewDetails.rollingTranscript,
      interviewDetails.previousSummary,
      interviewDetails.questions[curIndex]?.questions?.[0]?.question ??
        "Can you walk me through your approach in more detail?",
    );
  } else if (nextStep === "main-question") {
    interviewDetails.currentQuestionIndex += 1;
    interviewDetails.followupCountForCurrent = 0;
    currentQuestion = await mainQuestion(
      interviewDetails.rollingTranscript,
      interviewDetails.previousSummary,
      interviewDetails.questions[interviewDetails.currentQuestionIndex]
        ?.questions?.[0]?.question ?? "No more questions available",
    );
  } else if (nextStep === "interview-completed") {
    // marking interview as completed
    const completedInterview = await prisma.interview2.update({
      where: {
        id: interviewId,
      },
      data: {
        status: "COMPLETED",
      },
    });

    currentQuestion =
      "That was the last question. Thank you for your time. The interview has been completed. You can expect to receive feedback and a review of your performance within the next hour.";
    interviewDetails.status = "COMPLETED";
  } else if (nextStep === "ice-breaker") {
    interviewDetails.currentQuestionIndex = 0; // advance so next turn doesn't re-trigger ice-breaker
    currentQuestion = interviewDetails.questions[0].icebreaker.question;
  } else {
    currentQuestion =
      "Great , Can u please share more details about your approach?";
  }

  // SSE stream
  const encoder = new TextEncoder();
  let accumulatedText = "";

  const sseStream = new ReadableStream({
    async start(controller) {
      const sendEvent = (payload: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );
      };

      try {
        if (typeof currentQuestion === "string") {
          accumulatedText = currentQuestion;
          const result = await textToSpeech(currentQuestion);
          sendEvent({
            type: "audio",
            audio: result.audios[0],
            text: currentQuestion,
          });
        } else if (currentQuestion) {
          const splitter = sentenceSplitter();
          currentQuestion.pipe(splitter);

          for await (const sentence of splitter) {
            const s = sentence as string;
            accumulatedText += s + " ";
            const result = await textToSpeech(s);
            sendEvent({ type: "audio", audio: result.audios[0], text: s });
          }

          accumulatedText = accumulatedText.trim();
        }

        // Push interviewer turn after full text is known
        const interviewerTurn = {
          role: "interviewer" as const,
          content: accumulatedText,
          timestamp: Date.now(),
          questionIndex: interviewDetails.currentQuestionIndex,
          isFollowup: nextStep === "follow-up",
        };
        interviewDetails.transcript.push(interviewerTurn);
        interviewDetails.rollingTranscript.push(interviewerTurn);
        interviewDetails.totalTurns += 1;

        if (interviewDetails.rollingTranscript.length > ROLLING_WINDOW) {
          interviewDetails.rollingTranscript =
            interviewDetails.rollingTranscript.slice(-ROLLING_WINDOW);
        }

        await saveInterviewSession(
          interviewDetails,
          interviewId,
          session.user.id,
        );

        sendEvent({ type: "done", nextStep });
        controller.close();
      } catch (err) {
        console.error("SSE stream error:", err);
        sendEvent({ type: "error", message: "Something went wrong" });
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
