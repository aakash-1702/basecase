import { Agent, run } from "@openai/agents";
import { Turn } from "./session";
import {Readable , PassThrough} from "stream";



const SYSTEM_INSTRUCTION_FOR_FOLLOWUP = `
You are an expert technical interviewer conducting a live coding/DSA interview.

You will receive:
- previousSummary: a condensed summary of earlier parts of the interview
- rollingTranscript: the recent conversation turns (current main question, candidate answers, any follow-ups so far)

Your job is to generate ONE follow-up question based on the candidate's most recent answer.

FOLLOW-UP STRATEGY:
- If the candidate gave a vague or incomplete answer, ask them to elaborate on the weak point
- If they mentioned a concept without explaining it, ask them to explain it
- If their solution works but is suboptimal, probe whether they can identify the bottleneck
- If they seem confident, challenge an edge case or a constraint change (e.g. "what if the input was sorted?")
- Stay strictly within the topic of the current main question — do not introduce new topics
- One question only — never ask two things at once

OUTPUT FORMAT — follow exactly, nothing outside these tags:
<reason>
Your internal reasoning for why you chose this follow-up. Never shown to candidate.
</reason>
<question>
The follow-up question. Plain spoken English only. No markdown, no asterisks, no brackets, no emojis, no newlines. Only commas, periods, and question marks as punctuation. Written exactly as it would be spoken aloud to the candidate.
</question>
`;

const SYSTEM_INSTRUCTION_FOR_MAIN_QUESTION = `
You are an expert technical interviewer conducting a live coding/DSA interview.

You will receive:
- previousSummary: a condensed summary of earlier parts of the interview
- rollingTranscript: the recent conversation turns
- nextMainQuestion: the exact question you must now ask the candidate

Your job is to naturally transition to and deliver the next main question.

TRANSITION STRATEGY:
- If this is the first question (rollingTranscript is empty), greet the candidate briefly and ask the question
- If previous turns exist, write one short sentence acknowledging the previous topic before moving on
- Then ask the nextMainQuestion — you may rephrase it slightly for natural spoken flow but do not change its meaning or remove any constraints
- Do not evaluate or comment on the candidate's previous answer (no "great job", no "that was correct")
- Keep the transition under one sentence — the question is what matters

OUTPUT FORMAT — follow exactly, nothing outside these tags:
<reason>
Your internal reasoning for the transition choice. Never shown to candidate.
</reason>
<question>
The transition sentence (if any) followed by the main question. Plain spoken English only. No markdown, no asterisks, no brackets, no emojis, no newlines. Only commas, periods, and question marks as punctuation. Written exactly as it would be spoken aloud.
</question>
`;

const followUpAgent = new Agent({
  name: "AI-Interviewer",
  instructions: SYSTEM_INSTRUCTION_FOR_FOLLOWUP,
});

const mainQuestionAgent = new Agent({
  name: "AI-Interviewer",
  instructions: SYSTEM_INSTRUCTION_FOR_MAIN_QUESTION,
});

/*
what is required here generallly: 
1 rolling transcript thing 
2 this is only required when follow up is being done as the main questions will be same already generated on teh basis of vectors and embeddings
3 follow up questions should be based on the current questions and the answer given by the candidate and also the previous follow up questions and answers as well

*/


// Strips everything outside <question>...</question>
// Handles the tag being split across chunk boundaries
function extractQuestionStream(agentStream: Readable): Readable {
  const output = new PassThrough();
  let buffer = "";
  let insideQuestion = false;

  agentStream.on("data", (chunk: Buffer | string) => {
    buffer += chunk.toString();

    if (!insideQuestion) {
      const openIdx = buffer.indexOf("<question>");
      if (openIdx !== -1) {
        insideQuestion = true;
        buffer = buffer.slice(openIdx + "<question>".length);
      } else {
        // Keep tail in case tag spans two chunks e.g. buffer ends with "<ques"
        if (buffer.length > 20) buffer = buffer.slice(-20);
        return;
      }
    }

    const closeIdx = buffer.indexOf("</question>");
    if (closeIdx !== -1) {
      const final = buffer.slice(0, closeIdx).trim();
      if (final) output.push(final);
      output.end();
      buffer = "";
    } else {
      // Flush safe portion, hold last 12 chars in case </question> is split
      const safeLen = buffer.length - 12;
      if (safeLen > 0) {
        output.push(buffer.slice(0, safeLen));
        buffer = buffer.slice(safeLen);
      }
    }
  });

  agentStream.on("end", () => {
    if (buffer.trim()) output.push(buffer.trim()); // malformed output fallback
    output.end();
  });

  agentStream.on("error", (err) => output.destroy(err));

  return output;
}

const followUpQuestion = async (
  rollingTranscript: Turn[],
  previousSummary: string,
  questionReference : string,
): Promise<Readable> => {
  const result = await run(
    followUpAgent,
    JSON.stringify({ rollingTranscript, previousSummary , questionReference}),
    { stream: true },
  );

  const rawStream = result.toTextStream({
    compatibleWithNodeStreams: true,
  }) as Readable;

  return extractQuestionStream(rawStream);
};

const mainQuestion = async (
  rollingTranscript: Turn[],
  previousSummary: string,
  nextMainQuestion: string, // pass the actual question text from your questions array
): Promise<Readable> => {
  const result = await run(
    mainQuestionAgent,
    JSON.stringify({ rollingTranscript, previousSummary, nextMainQuestion }),
    { stream: true },
  );

  const rawStream = result.toTextStream({
    compatibleWithNodeStreams: true,
  }) as Readable;

  return extractQuestionStream(rawStream);
};

export { followUpQuestion, mainQuestion };
