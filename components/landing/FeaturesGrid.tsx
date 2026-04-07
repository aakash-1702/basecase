"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/landing-animations";

type IconProps = {
  className?: string;
  style?: React.CSSProperties;
};

function CodeIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      style={style}
    >
      <path
        d="M8 9l-4 3 4 3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 9l4 3-4 3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 4l-4 16"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SheetsIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      style={style}
    >
      <path
        d="M5 4h14v14H5z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 8h8" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12h8" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 16h5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function InterviewIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      style={style}
    >
      <path
        d="M12 4a6 6 0 016 6v4a6 6 0 11-12 0v-4a6 6 0 016-6z"
        strokeWidth="2"
      />
      <path d="M12 18v3" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 21h6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BrainIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      style={style}
    >
      <path
        d="M9 7a3 3 0 016 0 3 3 0 012 5 3 3 0 01-2 5H9a3 3 0 01-2-5 3 3 0 012-5z"
        strokeWidth="2"
      />
      <path d="M12 7v10" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProgressIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      style={style}
    >
      <path d="M4 20V8" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 20V4" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 20v-6" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 20v-9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RoadmapIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      style={style}
    >
      <path
        d="M4 6h5a2 2 0 012 2v2H4z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 14h7" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M11 10h5a2 2 0 012 2v2h-7z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Card({
  icon: Icon,
  title,
  body,
  badge,
  className,
  children,
}: {
  icon: React.ComponentType<IconProps>;
  title: string;
  body: string;
  badge: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.article
      variants={fadeUp}
      className={`glass-card-landing feature-card-hover p-7 sm:p-8 ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: "rgba(232,73,15,0.08)",
            border: "1px solid rgba(232,73,15,0.22)",
          }}
        >
          <Icon className="w-5 h-5" style={{ color: "#E8490F" }} />
        </div>
        <span
          className="text-[11px] px-2.5 py-1 rounded-full"
          style={{
            color: "#E8490F",
            background: "rgba(232,73,15,0.1)",
            border: "1px solid rgba(232,73,15,0.22)",
          }}
        >
          {badge}
        </span>
      </div>

      <h3
        className="text-xl mt-5 text-white font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-syne), sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-sm leading-[1.65] max-w-[60ch]"
        style={{ color: "#A0A0A0" }}
      >
        {body}
      </p>
      {children}
    </motion.article>
  );
}

function RoadmapVisual() {
  const steps = ["Arrays", "Strings", "Trees", "Graphs", "DP"];
  return (
    <div
      className="mt-5 rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid #1E1E1E",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const highlighted = index === 2;
          const completed = index < 2;
          return (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{
                    color: highlighted ? "#fff" : "rgba(255,255,255,0.7)",
                    background: highlighted
                      ? "#E8490F"
                      : completed
                        ? "rgba(232,73,15,0.2)"
                        : "rgba(255,255,255,0.07)",
                  }}
                >
                  {step}
                </span>
                {highlighted && (
                  <span className="text-[10px]" style={{ color: "#E8490F" }}>
                    You are here
                  </span>
                )}
              </div>
              {index < steps.length - 1 && (
                <span
                  className="w-6 h-px"
                  style={{
                    background: completed ? "rgba(232,73,15,0.45)" : "#2a2a2a",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-30" style={{ background: "#0A0A0A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="problems">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-14"
        >
          <h2
            className="text-[40px] sm:text-[48px] md:text-[56px] font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Everything You Need. Nothing You Don&apos;t.
          </h2>
          <p
            className="mt-4 text-base max-w-[60ch] mx-auto"
            style={{ color: "#A0A0A0" }}
          >
            A dense prep stack built like a catalog: execution, sheets,
            interviews, spaced reviews, tracking, and guided progression.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card
            icon={CodeIcon}
            title="Code Execution"
            body="Judge0-backed runs with hidden tests, language support, and tight feedback loops built for interview speed."
            badge="< 200ms"
            className="md:col-span-2"
          >
            <div
              className="mt-5 rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid #1E1E1E",
              }}
            >
              <p
                className="text-[12px]"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                Accepted • 42ms • 14/14 test cases passed
              </p>
            </div>
          </Card>

          <Card
            icon={SheetsIcon}
            title="Sheets"
            body="Structured sheets that move from fundamentals to interview-level hard problems without topic gaps."
            badge="500+ problems"
          />

          <Card
            icon={InterviewIcon}
            title="AI Interviews"
            body="Practice DSA, system design, project-based, and role-targeted rounds with adaptive follow-up prompts."
            badge="Powered by Gemini AI"
          />

          <Card
            icon={BrainIcon}
            title="Spaced Repetition"
            body="SM-2-driven review timing keeps weak topics fresh and prevents over-practice on familiar problems."
            badge="SM-2 Engine"
          />

          <Card
            icon={ProgressIcon}
            title="Progress Tracking"
            body="Weak sheets, revisit trends, and streak behavior are surfaced automatically so your next step is always obvious."
            badge="Daily Signals"
          />

          <Card
            icon={RoadmapIcon}
            title="Roadmap"
            body="A real progression flow with milestone clarity and current-position highlighting."
            badge="Topic Progression"
            className="md:col-span-3"
          >
            <RoadmapVisual />
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
