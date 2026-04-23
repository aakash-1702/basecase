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
import textToAudio from "@/lib/text_to_audio";

const ROLLING_WINDOW = 6;


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

  if (nextStep === "next-question") {
    // Advance the index first, then read the question at the NEW index
    interviewDetails.currentQuestionIndex += 1;
    const newIndex = interviewDetails.currentQuestionIndex;
    currentQuestion = interviewDetails.questions[newIndex].question;
    interviewDetails.followupCountForCurrent = 0;
  } else if (nextStep === "follow-up") {
    currentQuestion = await followUpQuestion(
      interviewDetails.rollingTranscript,
      interviewDetails.previousSummary,         // was incorrectly passed as ""
      interviewDetails.questions[curIndex].question, // fixed: was .questions[0].question
    );
    interviewDetails.followupCountForCurrent += 1;
    // Note: index advancement is handled by decideNextActionForInterview
    // returning "next-question" once followupCount reaches 2
  } else {
    currentQuestion = `That is it , these were all the questions i had for you . Now you may click the end interview button once ready and detailed interview feedback report will be shown in the interview page itself within 5-10 minutes , in case of high traffic can take upto 2 hours as well`;
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
          const result = await textToAudio(currentQuestion);
          sendEvent({
            type: "audio",
            audio: result, // send full result object, consistent with new-interview route
            text: currentQuestion,
          });
        } else if (currentQuestion) {
          const splitter = sentenceSplitter();
          currentQuestion.pipe(splitter);

          for await (const sentence of splitter) {
            const s = sentence as string;
            accumulatedText += s + " ";
            const result = await textToAudio(s);
            sendEvent({ type: "audio", audio: result, text: s });
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
