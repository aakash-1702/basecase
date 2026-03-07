"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Upload, Minus, Plus } from "lucide-react";

interface StartInterviewModalProps {
  onClose: () => void;
}

type InterviewMode = "dsa" | "technical" | "hr";
type Difficulty = "entry" | "mid" | "senior" | "staff";

const companies = [
  "Google", "Amazon", "Microsoft", "Flipkart",
  "Uber", "Swiggy", "Netflix", "Generic",
];

export function StartInterviewModal({ onClose }: StartInterviewModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<InterviewMode>("technical");
  const [company, setCompany] = useState("Google");
  const [difficulty, setDifficulty] = useState<Difficulty>("senior");
  const [questionCount, setQuestionCount] = useState(8);
  const [resume, setResume] = useState<File | null>(null);

  const handleStart = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const params = new URLSearchParams({
      mode, company, difficulty,
      questions: questionCount.toString(),
    });
    router.push(`/interview/new-session?${params.toString()}`);
    onClose();
  };

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") setResume(file);
    }, []
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[540px] max-h-[85vh] overflow-y-auto interview-scrollbar"
        style={{
          background: "#0c0c0c",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "10px",
          animation: "fadeSlideUp 0.25s ease forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-7 py-5 flex items-center justify-between"
          style={{
            background: "#0c0c0c",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2
            className="text-sm tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-primary)", fontWeight: 500 }}
          >
            Configure Session
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded transition">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="px-7 py-6 space-y-7">
          {/* ① Interview Mode */}
          <div>
            <label className="block text-[10px] mb-3 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
              Interview Mode
            </label>
            <div className="flex gap-2">
              {(["dsa", "technical", "hr"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-3 px-4 text-xs capitalize transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    background: mode === m ? "var(--amber)" : "var(--bg-card)",
                    color: mode === m ? "#000" : "var(--text-muted)",
                    border: `1px solid ${mode === m ? "var(--amber)" : "var(--border-subtle)"}`,
                    borderRadius: "6px",
                    fontWeight: mode === m ? 600 : 400,
                  }}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* ② Company */}
          <div>
            <label className="block text-[10px] mb-3 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
              Company
            </label>
            <div className="grid grid-cols-4 gap-2">
              {companies.map((c) => (
                <button
                  key={c}
                  onClick={() => setCompany(c)}
                  className="py-2.5 px-3 text-xs transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    background: company === c ? "var(--bg-card-hover)" : "var(--bg-card)",
                    color: company === c ? "var(--text-primary)" : "var(--text-muted)",
                    border: `1px solid ${company === c ? "rgba(245,158,11,0.3)" : "var(--border-subtle)"}`,
                    borderRadius: "6px",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* ③ Difficulty */}
          <div>
            <label className="block text-[10px] mb-3 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
              Difficulty
            </label>
            <div className="flex gap-2">
              {(["entry", "mid", "senior", "staff"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="flex-1 py-3 px-3 text-xs capitalize transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    background: difficulty === d ? "var(--amber)" : "var(--bg-card)",
                    color: difficulty === d ? "#000" : "var(--text-muted)",
                    border: `1px solid ${difficulty === d ? "var(--amber)" : "var(--border-subtle)"}`,
                    borderRadius: "6px",
                    fontWeight: difficulty === d ? 600 : 400,
                  }}
                >
                  {d === "entry" ? "Entry" : d === "mid" ? "Mid" : d === "senior" ? "Senior" : "Staff"}
                </button>
              ))}
            </div>
          </div>

          {/* ④ Questions */}
          {mode !== "dsa" && (
            <div>
              <label className="block text-[10px] mb-3 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
                Questions
              </label>
              <div className="flex items-center justify-center gap-5">
                <button onClick={() => setQuestionCount(Math.max(1, questionCount - 1))} className="p-2 hover:bg-white/5 rounded transition" style={{ color: "var(--amber)" }}>
                  <Minus size={20} />
                </button>
                <div className="text-3xl w-14 text-center tabular-nums" style={{ fontFamily: "var(--font-dm-serif)", color: "var(--text-primary)" }}>
                  {questionCount.toString().padStart(2, "0")}
                </div>
                <button onClick={() => setQuestionCount(Math.min(10, questionCount + 1))} className="p-2 hover:bg-white/5 rounded transition" style={{ color: "var(--amber)" }}>
                  <Plus size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ⑤ Resume Upload */}
          {mode === "technical" && (
            <div>
              <label className="block text-[10px] mb-3 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
                Resume (optional)
              </label>
              <label
                className="block border-2 border-dashed py-7 px-6 text-center cursor-pointer hover:border-white/[0.12] transition"
                style={{ borderColor: "var(--border-subtle)", borderRadius: "6px", background: "var(--bg-card)" }}
              >
                <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
                <Upload size={22} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <div className="text-xs" style={{ fontFamily: "var(--font-dm-mono)", color: resume ? "var(--amber)" : "var(--text-muted)" }}>
                  {resume ? resume.name : "Drop resume PDF here"}
                </div>
              </label>
            </div>
          )}

          {/* DSA Warning */}
          {mode === "dsa" && (
            <div className="flex gap-3 p-4" style={{ background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "6px" }}>
              <AlertCircle size={20} style={{ color: "var(--amber)", flexShrink: 0 }} />
              <div className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
                This mode requires a scratchpad or IDE. Keep one open before entering the room.
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div
          className="sticky bottom-0 px-7 py-5"
          style={{ background: "#0c0c0c", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={handleStart}
            className="w-full py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              background: "var(--amber)",
              color: "#000",
              borderRadius: "6px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            → Start {mode === "dsa" ? "DSA" : mode === "technical" ? "Technical" : "HR"} Interview
          </button>
        </div>
      </div>
    </div>
  );
}
