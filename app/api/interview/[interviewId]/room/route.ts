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
import { Readable, Transform } from "stream";
import { SarvamAIClient } from "sarvamai";
import convertTextToAudio from "@/lib/text-to-audio";
import next from "next";

const ROLLING_WINDOW = 6;

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAMAI_API_KEY!,
});

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

  if (userResponse.trim().length === 0) {
    const askingForClarityResponse =
      "We couldn’t hear your response clearly. Please try speaking again, or click the red 'End Interview' button to end the session and generate your report.";

    const audioResult = await convertTextToAudio(askingForClarityResponse);

    return NextResponse.json(
      {
        success: true,
        data: {
          audioResponse: audioResult.audios[0],
          textResponse: askingForClarityResponse,
        },
        message: "Asking candidate for clarity on inaudible response",
      },
      {
        status: 200,
      },
    );
  }

  if (!interviewId) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Invalid request body, interviewId is required",
      },
      { status: 400 },
    );
  }

  const interviewIdExists = await prisma.interview2.findFirst({
    where: {
      id: interviewId,
      userId: session.user.id,
      status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
    },
    select: { id: true, repoLink: true, repoId: true, status: true },
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

  if (interviewIdExists.status === "NOT_STARTED") {
    await prisma.interview2.update({
      where: { id: interviewId },
      data: { status: "IN_PROGRESS" },
    });
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

  // Only record candidate turn when user has actually submitted spoken text.
  if (userResponse.length > 0) {
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
  }

  // Decide next step
  const nextStep = decideNextActionForInterview(
    curIndex,
    followupCount,
    interviewDetails.questions[0]?.questions.length ?? 0,
  );

  let currentQuestion: string | Readable | null = null;

  if (nextStep === "start-interview") {
    interviewDetails.currentQuestionIndex = 0;
    currentQuestion =
      interviewDetails.questions[0]?.questions[0]?.question ?? null;

    if (!currentQuestion) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "No interview question found after icebreaker",
        },
        { status: 400 },
      );
    }
  } else if (nextStep === "follow-up") {
    const previousSummary = interviewDetails.previousSummary ?? "";
    const questionReference =
      interviewDetails.questions[0]?.questions[curIndex]?.question ?? "";

    currentQuestion = await followUpQuestion(
      interviewDetails.rollingTranscript,
      previousSummary,
      questionReference,
    );

    // Increment follow-up count for current question
    interviewDetails.followupCountForCurrent += 1;
  } else if (nextStep === "main-question") {
    // Advance to next question, reset follow-up counter
    interviewDetails.currentQuestionIndex = curIndex + 1;
    interviewDetails.followupCountForCurrent = 0;

    const nextMainQuestion =
      interviewDetails.questions[0]?.questions[
        interviewDetails.currentQuestionIndex
      ]?.question ?? null;

    if (!nextMainQuestion) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "No question found at next index",
        },
        { status: 500 },
      );
    }

    currentQuestion = nextMainQuestion;
  } else if (nextStep === "end-interview") {
    currentQuestion =
      "That's all the questions for today! You've completed the interview. " +
      "Please click the 'End Interview' button whenever you're ready, and your report will be generated — " +
      "usually within a few minutes. During peak hours it can occasionally take up to 2 hours, " +
      "so don't worry if it's not instant. Good luck!";
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
          const result = await convertTextToAudio(currentQuestion);
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
            const result = await convertTextToAudio(s);
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
