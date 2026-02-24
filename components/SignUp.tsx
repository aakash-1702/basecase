"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-actions";

const stages = [
  {
    rank: "DORMANT",
    badge: "00",
    msg: "System standby. Awaiting operator input.",
    color: "#71717a",
    glow: "rgba(82,82,91,0.12)",
    bar: "from-zinc-700 to-zinc-600",
  },
  {
    rank: "IDENTIFIED",
    badge: "01",
    msg: "Entity recognized. Commencing uplink.",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.15)",
    bar: "from-blue-600 to-blue-400",
  },
  {
    rank: "VERIFIED",
    badge: "02",
    msg: "Channel secured. Finalizing encryption.",
    color: "#34d399",
    glow: "rgba(52,211,153,0.15)",
    bar: "from-emerald-600 to-emerald-400",
  },
  {
    rank: "ACTIVATED",
    badge: "03",
    msg: "Core ready. Execute initialization.",
    color: "#f97316",
    glow: "rgba(249,115,22,0.2)",
    bar: "from-orange-600 to-amber-400",
  },
];

export default function GamifiedSignup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    let s = 0;
    if (form.name.trim().length > 2) s = 1;
    if (form.email.includes("@") && form.email.length > 5) s = 2;
    if (form.password.length >= 8) s = 3;
    setStage(s);
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || stage < 3) return;
    setLoading(true);
    const toastId = toast.loading("Establishing connection...");
    try {
      const result = await signUp(form.name.trim(), form.email, form.password);
      if (!result?.success) {
        toast.error(result?.error || "Connection refused.", { id: toastId });
        return;
      }
      toast.success("Identity verified. Welcome to the 1%.", { id: toastId });
      confetti({
        particleCount: 160,
        spread: 72,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fb923c", "#fbbf24", "#fff"],
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      toast.error("Protocol error. Try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const current = stages[stage];
  const pct = Math.round((stage / 3) * 100);

  return (
    <div
      className="min-h-screen bg-[#06060a] text-white flex items-center justify-center p-4 overflow-y-auto"
      style={{ fontFamily: "'DM Mono', 'Fira Mono', monospace" }}
    >
      {/* Background Ambience */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${current.glow}, transparent 70%)`,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 py-10">
        {/* HERO HEADER */}
        <div className="mb-10 px-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 rounded-sm flex items-center justify-center bg-[#f97316]">
              <span className="text-[8px] font-black text-black">BC</span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase">
              Basecase Terminal
            </span>
          </div>

          <h1 className="text-[40px] font-black leading-[0.95] tracking-tighter mb-4">
            LEVEL UP.
            <br />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px #f97316" }}
            >
              OWN THE OUTCOME.
            </span>
          </h1>

          <p className="text-[12px] font-medium text-zinc-400 leading-relaxed max-w-[340px]">
            The top 1% don't leave success to chance. They build
            <span className="text-white"> systems</span>. Initialize your
            uplink.
          </p>
        </div>

        {/* PROGRESS HUD */}
        <div className="mb-6 px-1">
          <div className="flex justify-between items-end mb-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-zinc-600 tracking-widest uppercase mb-1">
                Authorization
              </span>
              <span
                className="text-[11px] font-black tracking-[0.2em] uppercase transition-colors duration-500"
                style={{ color: current.color }}
              >
                {current.rank}{" "}
                <span className="opacity-40">[{current.badge}]</span>
              </span>
            </div>
            <span
              className="text-[14px] font-black tabular-nums transition-colors duration-500"
              style={{ color: current.color }}
            >
              {pct}%
            </span>
          </div>

          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${current.bar} transition-all duration-700 ease-out`}
              style={{ width: `${pct === 0 ? 2 : pct}%` }}
            />
          </div>
        </div>

        {/* CARD */}
        <div className="relative">
          <div
            className="absolute -inset-[1px] rounded-[24px] transition-all duration-700"
            style={{
              background: "linear-gradient(140deg, #f97316, #fbbf24, #ea580c)",
              opacity: stage === 3 ? 0.8 : 0.3,
            }}
          />

          <div className="relative bg-[#0b0b0f] rounded-[23px] overflow-hidden">
            <div className="p-8 md:p-10">
              {/* Terminal Status Message */}
              <div className="mb-8 flex items-start gap-2 h-8">
                <span className="text-[#f97316] font-bold text-[10px] mt-[1px]">
                  ▸
                </span>
                <span className="text-[11px] font-bold leading-tight tracking-wide transition-all duration-500 text-zinc-300">
                  {current.msg}
                </span>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  {
                    name: "name",
                    type: "text",
                    placeholder: "Operator ID",
                    label: "UID",
                  },
                  {
                    name: "email",
                    type: "email",
                    placeholder: "Contact Uplink",
                    label: "MAIL",
                  },
                  {
                    name: "password",
                    type: "password",
                    placeholder: "Min. 8 Chars",
                    label: "KEY",
                  },
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <label
                      className="absolute left-4 -top-2 px-1 bg-[#0b0b0f] text-[8px] font-black tracking-[0.2em] transition-colors duration-300 z-10"
                      style={{
                        color: focused === field.name ? "#f97316" : "#3f3f46",
                      }}
                    >
                      {field.label}
                    </label>
                    <Input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      autoComplete="off"
                      onChange={handleChange}
                      onFocus={() => setFocused(field.name)}
                      onBlur={() => setFocused(null)}
                      className="bg-white/[0.03] border-zinc-800 rounded-lg h-[52px] px-4 text-[13px] font-medium placeholder:text-zinc-800 focus-visible:ring-0 transition-all duration-300"
                      style={{
                        borderColor:
                          focused === field.name
                            ? "rgba(249,115,22,0.5)"
                            : "rgba(255,255,255,0.05)",
                      }}
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={stage < 3 || loading}
                  className="w-full h-[56px] rounded-lg text-[11px] font-black tracking-[0.3em] uppercase transition-all duration-300 mt-2"
                  style={{
                    background: stage === 3 ? "#f97316" : "#18181b",
                    color: stage === 3 ? "#000" : "#3f3f46",
                    boxShadow:
                      stage === 3 ? "0 0 20px rgba(249,115,22,0.3)" : "none",
                  }}
                >
                  {loading
                    ? "INITIALIZING..."
                    : stage < 3
                      ? `LOCKED: ${3 - stage} STEPS LEFT`
                      : "START ASCENT →"}
                </button>
              </form>

              {/* OAUTH SECTION */}
              <div className="relative flex items-center justify-center my-10">
                <div className="absolute w-full h-[1px] bg-zinc-900" />
                <span className="relative px-3 text-[8px] font-black tracking-[0.3em] text-zinc-600 bg-[#0b0b0f] uppercase">
                  External Auth
                </span>
              </div>

              <div className="space-y-4">
                {/* CLEAR COMING SOON LABEL */}
                <div className="flex justify-center mb-[-8px]">
                  <span className="text-[9px] font-black tracking-[0.4em] text-[#f97316] uppercase animate-pulse">
                    — Coming Soon —
                  </span>
                </div>

                <div
                  className="relative w-full h-[48px] rounded-lg flex items-center justify-center gap-3 overflow-hidden select-none opacity-30 grayscale"
                  style={{
                    border: "1px dashed rgba(249,115,22,0.2)",
                    background: "rgba(255,255,255,0.01)",
                    cursor: "not-allowed",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path
                      fill="#fff"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#fff"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#fff"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#fff"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-[9px] font-black tracking-[0.2em] text-zinc-600 uppercase">
                    Sign in with Google
                  </span>
                </div>

                <div className="text-center pt-6">
                  <a
                    href="/auth/sign-in"
                    className="text-[10px] font-bold tracking-widest text-zinc-500 hover:text-[#f97316] transition-colors uppercase"
                  >
                    Back to{" "}
                    <span className="text-zinc-300 underline underline-offset-4 decoration-zinc-800">
                      Terminal Login
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[8px] font-bold tracking-[0.6em] text-zinc-800 uppercase">
          Basecase OS v2.0 // Node_Active
        </p>
      </div>
    </div>
  );
}
