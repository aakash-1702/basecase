"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { questions } from "@/lib/mockData";

const microFeedback = [
  "Solid. Let's keep that energy.",
  "Clear thinking. Push deeper on the next one.",
  "Good instincts. The interviewer would nod.",
  "Nice clarity. We're building momentum.",
  "Strong response. Stay in the zone.",
];

export default function InterviewSessionPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const interviewConfig = { company: "Google", type: "Technical", difficulty: "Medium" };

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((p) => p + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTranscript("");
      setTimeout(() => {
        setTranscript(
          "REST is resource-based and uses multiple endpoints with fixed data shapes. GraphQL uses a single endpoint where the client defines exactly what data it needs, reducing over-fetching. REST is great for simple, cacheable APIs. GraphQL shines when you need flexible, nested data from multiple sources.",
        );
        setIsRecording(false);
      }, 2000);
    }
  };

  const handleNextQuestion = () => {
    const saved = [...answers];
    saved[currentQuestionIndex] = transcript;
    setAnswers(saved);

    const msg = microFeedback[currentQuestionIndex % microFeedback.length];
    setFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2800);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      setTranscript("");
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      router.push("/interview/result/demo");
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLast = currentQuestionIndex === questions.length - 1;

  return (
    <div className="relative min-h-screen">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-5 border-b border-[#1F1F2A]">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium text-[#F5F5F7]">
              {interviewConfig.company}
            </span>
            <span className="text-xs text-[#A1A1AA]">Â·</span>
            <span className="text-xs text-[#A1A1AA]">{interviewConfig.type}</span>
            <span className="text-xs text-[#A1A1AA]">Â·</span>
            <span className="text-xs text-[#A1A1AA]">{interviewConfig.difficulty}</span>
          </div>
          <span className="font-mono text-sm text-[#A1A1AA] tabular-nums">
            {formatTime(timer)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar progress */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-8 space-y-1">
              <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-3">
                Progress
              </p>
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    i === currentQuestionIndex
                      ? "bg-amber-500/10 border border-amber-500/25"
                      : ""
                  }`}
                >
                  {i < currentQuestionIndex ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : i === currentQuestionIndex ? (
                    <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#1F1F2A] shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      i === currentQuestionIndex
                        ? "text-amber-400 font-medium"
                        : i < currentQuestionIndex
                          ? "text-[#A1A1AA]/50 line-through"
                          : "text-[#A1A1AA]"
                    }`}
                  >
                    Question {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main area */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-[#A1A1AA]">
                <span>
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-[3px] w-full bg-[#1F1F2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="p-6 rounded-xl border border-[#1F1F2A] bg-[#111117] space-y-2">
              <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest">
                Q{currentQuestionIndex + 1}
              </span>
              <p className="text-xl font-semibold text-[#F5F5F7] leading-snug">
                {questions[currentQuestionIndex]}
              </p>
            </div>

            {/* Record button */}
            <div className="flex flex-col items-center gap-3 py-4">
              <button
                onClick={toggleRecording}
                className={`relative p-5 rounded-full transition-all duration-300 active:scale-95 ${
                  isRecording
                    ? "bg-red-500/90 shadow-xl shadow-red-500/30 scale-105"
                    : "bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/30 hover:scale-105"
                }`}
              >
                {isRecording && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-400/40" />
                )}
                {isRecording ? (
                  <MicOff className="w-7 h-7 text-white relative z-10" />
                ) : (
                  <Mic className="w-7 h-7 text-white relative z-10" />
                )}
              </button>
              <p className="text-xs text-[#A1A1AA]">
                {isRecording ? "Recording \u2014 click to stop" : "Click to start speaking"}
              </p>
            </div>

            {/* Transcript */}
            <div className="rounded-xl border border-[#1F1F2A] bg-[#111117] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#1F1F2A]">
                <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest">
                  Your Answer
                </p>
              </div>
              <div className="p-5 min-h-[120px]">
                {transcript ? (
                  <p className="text-[#F5F5F7] text-sm leading-relaxed">{transcript}</p>
                ) : (
                  <p className="text-[#A1A1AA]/40 text-sm italic">
                    Your response will appear here as you speak...
                  </p>
                )}
              </div>
            </div>

            {/* Micro feedback toast */}
            <div
              className={`transition-all duration-500 ${
                feedback
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-400">{feedback}</p>
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={handleNextQuestion}
              disabled={!transcript}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold hover:from-amber-400 hover:to-orange-400 active:scale-[0.99] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-amber-900/30"
            >
              {isLast ? "Finish Interview \u2192" : "Next Question \u2192"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
