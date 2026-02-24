"use client";

import React, { useState, useEffect } from "react";
import { signUp } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SignupForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const toastId = toast.loading("Creating your account...");
    try {
      const result = await signUp(
        formData.name.trim(),
        formData.email,
        formData.password,
      );
      if (!result.success || !result.data?.user) {
        toast.error(result.error || "Failed to create account", {
          id: toastId,
        });
        return;
      }
      toast.success("Welcome to BaseCase! 🎉", { id: toastId });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "name", label: "Full name", type: "text", placeholder: "Alex Chen" },
    {
      id: "email",
      label: "Email address",
      type: "email",
      placeholder: "alex@basecase.dev",
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "min. 8 characters",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        .signup-root {
          font-family: 'Instrument Sans', sans-serif;
        }

        .signup-heading {
          font-family: 'Bricolage Grotesque', sans-serif;
        }

        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, 2%); }
          30% { transform: translate(-1%, 4%); }
          40% { transform: translate(4%, -1%); }
          50% { transform: translate(-3%, 3%); }
          60% { transform: translate(2%, -4%); }
          70% { transform: translate(-4%, 1%); }
          80% { transform: translate(1%, -2%); }
          90% { transform: translate(-2%, 4%); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(6px) rotate(-0.5deg); }
        }

        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.05); }
          50% { transform: translate(-15px, 20px) scale(0.97); }
          75% { transform: translate(25px, 10px) scale(1.02); }
        }

        @keyframes border-dance {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .card-animate {
          animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .field-animate-1 { animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
        .field-animate-2 { animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both; }
        .field-animate-3 { animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.29s both; }
        .btn-animate    { animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.36s both; }
        .footer-animate { animation: fadeIn 0.5s ease 0.5s both; }

        .noise-overlay::after {
          content: '';
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          z-index: 0;
          border-radius: inherit;
          opacity: 0.5;
        }

        .shimmer-btn {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .orb-1 { animation: orb-drift 12s ease-in-out infinite; }
        .orb-2 { animation: orb-drift 18s ease-in-out infinite reverse; }
        .orb-3 { animation: float 8s ease-in-out infinite; }

        .input-field {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .input-field:focus {
          background: rgba(10, 10, 10, 0.9);
          box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.5), 0 0 20px rgba(245, 158, 11, 0.08);
        }

        .label-float {
          transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .submit-btn {
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(245, 158, 11, 0.35), 0 4px 12px rgba(234, 88, 12, 0.2);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.99);
        }

        .divider-line {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }

        .brand-mark {
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          font-size: 18px;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
        }

        .grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="signup-root -mx-5 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12 -mb-16 relative min-h-[calc(100vh-3.5rem)] bg-[#060606] flex items-center justify-center px-4 overflow-hidden">
        {/* Grid pattern background */}
        <div className="grid-pattern absolute inset-0 opacity-60" />

        {/* Ambient orbs */}
        <div
          className="orb-1 absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          className="orb-2 absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 65%)",
          }}
        />
        <div
          className="orb-3 absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(245,158,11,0.03) 0%, transparent 70%)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Card */}
        <div
          className={cn(
            "card-animate noise-overlay relative w-full max-w-[420px] my-16",
            "rounded-[28px] overflow-hidden",
            "border border-white/[0.07]",
          )}
          style={{
            background:
              "linear-gradient(145deg, rgba(18,18,18,0.95) 0%, rgba(12,12,12,0.98) 100%)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-[20%] right-[20%] h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)",
            }}
          />

          <div className="relative z-10 p-8 sm:p-10">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-10">
              <div className="brand-mark">⌘</div>
              <div>
                <div className="signup-heading text-white font-bold text-lg tracking-tight leading-none">
                  BaseCase
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5 tracking-wide uppercase font-medium">
                  DSA Practice Platform
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="signup-heading text-[32px] font-bold text-white leading-[1.1] tracking-tight">
                Start your
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #fbbf24, #f59e0b, #ea580c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  coding journey.
                </span>
              </h1>
              <p className="mt-3 text-[14px] text-neutral-500 leading-relaxed">
                Join thousands preparing for top tech interviews.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field, i) => {
                const val = formData[field.id as keyof typeof formData];
                const isFocused = focused === field.id;
                const hasValue = val.length > 0;

                return (
                  <div
                    key={field.id}
                    className={`field-animate-${i + 1} relative`}
                  >
                    <div className="relative">
                      <input
                        id={field.id}
                        name={field.id}
                        type={field.type}
                        value={val}
                        onChange={handleChange}
                        onFocus={() => setFocused(field.id)}
                        onBlur={() => setFocused(null)}
                        disabled={loading}
                        required
                        autoComplete={
                          field.id === "password" ? "new-password" : field.id
                        }
                        placeholder={isFocused ? field.placeholder : ""}
                        className={cn(
                          "input-field w-full px-4 pt-6 pb-2.5 rounded-2xl",
                          "bg-white/[0.03] border text-white text-[14.5px]",
                          "placeholder:text-neutral-600 outline-none",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          isFocused
                            ? "border-amber-500/50"
                            : hasValue
                              ? "border-white/10"
                              : "border-white/[0.06]",
                        )}
                        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                      />
                      <label
                        htmlFor={field.id}
                        className={cn(
                          "label-float absolute left-4 pointer-events-none font-medium",
                          isFocused || hasValue
                            ? "top-2 text-[11px] tracking-wide uppercase"
                            : "top-4 text-[14px]",
                          isFocused
                            ? "text-amber-400"
                            : hasValue
                              ? "text-neutral-500"
                              : "text-neutral-500",
                        )}
                      >
                        {field.label}
                      </label>
                    </div>
                  </div>
                );
              })}

              {/* Submit */}
              <div className="btn-animate pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "submit-btn shimmer-btn w-full py-3.5 px-6 rounded-2xl",
                    "font-semibold text-[15px] text-white relative overflow-hidden",
                    "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
                  )}
                  style={{
                    background: loading
                      ? "linear-gradient(135deg, #92400e, #9a3412)"
                      : "linear-gradient(135deg, #d97706 0%, #f59e0b 40%, #ea580c 80%, #d97706 100%)",
                    backgroundSize: "200% auto",
                    boxShadow: loading
                      ? "none"
                      : "0 4px 20px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                        />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="footer-animate flex items-center gap-4 my-7">
              <div className="divider-line flex-1 h-px" />
              <span className="text-[11px] text-neutral-600 tracking-widest uppercase">
                or
              </span>
              <div className="divider-line flex-1 h-px" />
            </div>

            {/* Social proof */}
            <div className="footer-animate flex items-center justify-between text-[12px]">
              <div className="flex -space-x-2">
                {["#f59e0b", "#ea580c", "#10b981", "#6366f1"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-[#0c0c0c] flex items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${color}88, ${color})`,
                        zIndex: 4 - i,
                      }}
                    >
                      {["A", "K", "R", "S"][i]}
                    </div>
                  ),
                )}
              </div>
              <span className="text-neutral-500">
                <span className="text-neutral-300 font-medium">2,400+</span>{" "}
                devs already in
              </span>
            </div>

            {/* Footer */}
            <p className="footer-animate mt-8 text-center text-[13px] text-neutral-600">
              Already have an account?{" "}
              <a
                href="/auth/sign-in"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors duration-200 hover:underline underline-offset-2"
              >
                Sign in →
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupForm;
