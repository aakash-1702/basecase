"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function BreathePanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], scale: [1, 1.015, 1] }}
      transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

function SectionWrap({
  children,
  id,
  bgNum,
  flip = false,
}: {
  children: React.ReactNode;
  id?: string;
  bgNum: string;
  flip?: boolean;
}) {
  return (
    <section
      id={id}
      style={{
        padding: "120px 48px",
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: flip ? "auto" : -40,
          top: flip ? -40 : "auto",
          right: flip ? "auto" : 48,
          left: flip ? 48 : "auto",
          fontSize: "clamp(160px, 20vw, 240px)",
          fontWeight: 900,
          color: "rgba(249,115,22,0.10)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          fontFamily: "var(--font-nunito), sans-serif",
          zIndex: 0,
        }}
      >
        {bgNum}
      </div>

      <div
        className="bc-feature-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {children}
      </div>

      <style>{`
        @media (max-width: 960px) {
          .bc-feature-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}

function SheetsMock() {
  const problems = [
    { name: "Container With Water", done: true, bar: 86 },
    { name: "Advanced Kit", done: true, bar: 72 },
    { name: "Container View", done: false, active: true, bar: 64 },
    { name: "Stream VII SH", done: false, bar: 52 },
    { name: "Stack Addition", done: false, bar: 48 },
    { name: "Stream Following Attaches", done: false, bar: 43 },
    { name: "Advance Value", done: false, bar: 36 },
  ];

  return (
    <BreathePanel>
      <div
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(249,115,22,0.12), 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          <span style={{ marginLeft: 10, fontSize: 11, color: "#555", fontFamily: "var(--font-fira), monospace" }}>JudgeO - Problems</span>
          <span style={{ marginLeft: "auto", background: "#f97316", color: "#fff", fontSize: 10, padding: "2px 10px", borderRadius: 4, fontWeight: 700 }}>Practice</span>
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ width: 44, background: "#111", borderRight: "1px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 14 }}>
            {["[]", "*", "o", "#"].map((ic, i) => (
              <span key={i} style={{ fontSize: 12, color: i === 0 ? "#f97316" : "#333" }}>{ic}</span>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            {problems.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: p.active ? "rgba(249,115,22,0.07)" : "transparent",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 12, color: p.done ? "#22c55e" : "#333", width: 16 }}>{p.done ? "OK" : ".."}</span>
                <span style={{ fontSize: 13, color: p.active ? "#f97316" : "#9ca3af", flex: 1 }}>{p.name}</span>
                <div style={{ width: `${p.bar}%`, height: 4, background: p.done ? "#f97316" : "rgba(249,115,22,0.2)", borderRadius: 2 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </BreathePanel>
  );
}

function IDEMock() {
  const lines = [
    { num: "01", content: "#include <bits/stdc++.h>", color: "#9ca3af" },
    { num: "02", content: "using namespace std;", color: "#9ca3af" },
    { num: "03", content: "", color: "#fff" },
    { num: "04", content: "int main() {", color: "#fff" },
    { num: "05", content: "    int n, target;", color: "#fb923c" },
    { num: "06", content: "    cin >> n >> target;", color: "#fff" },
    { num: "07", content: "    vector<int> nums(n);", color: "#fb923c" },
    { num: "08", content: "    for (auto &x : nums)", color: "#fff" },
    { num: "09", content: "        cin >> x;", color: "#fff" },
    { num: "10", content: "    // Two Sum Logic", color: "#555" },
    { num: "11", content: "    unordered_map<int,int> mp;", color: "#f97316" },
    { num: "12", content: "    for (int i = 0; i < n; i++) {", color: "#fff" },
  ];

  return (
    <BreathePanel>
      <div
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(249,115,22,0.12), 0 24px 48px rgba(0,0,0,0.6)",
          position: "relative",
        }}
      >
        <div style={{ background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          <span style={{ marginLeft: 10, fontSize: 11, color: "#555", fontFamily: "var(--font-fira), monospace" }}>JudgeO - solution.cpp</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#f97316", fontFamily: "var(--font-fira), monospace" }}>C++ 17</span>
        </div>

        <div style={{ padding: "14px 0", fontFamily: "var(--font-fira), monospace", fontSize: 12, lineHeight: 1.9 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex", paddingRight: 16, background: i === 10 ? "rgba(249,115,22,0.06)" : "transparent" }}>
              <span style={{ width: 44, textAlign: "right", paddingRight: 16, color: "#333", flexShrink: 0 }}>{line.num}</span>
              <span style={{ color: line.color }}>{line.content || "\u00A0"}</span>
            </div>
          ))}
        </div>

        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: 16,
            right: 20,
            background: "#f97316",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            padding: "10px 22px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 0 24px rgba(249,115,22,0.5)",
          }}
        >
          Run
        </motion.div>

        <div style={{ background: "#111", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "10px 16px", fontFamily: "var(--font-fira), monospace", fontSize: 11, color: "#555" }}>
          <span style={{ color: "#4ade80" }}>stdout:</span> <span style={{ color: "#9ca3af" }}>Testcase 1 - Accepted (Runtime: 2ms)</span>
        </div>
      </div>
    </BreathePanel>
  );
}

function AIMentorMock() {
  const messages = [
    { role: "user", text: "Can you explain the sliding window technique?" },
    { role: "ai", text: "Sure. It reduces nested loops into one pass over a moving window." },
    { role: "user", text: "Quick example?" },
    { role: "ai", text: "Start with first k sum, slide by add-next remove-prev, track max." },
  ];

  return (
    <BreathePanel>
      <div
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(249,115,22,0.12), 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          <span style={{ marginLeft: 10, fontSize: 11, color: "#555", fontFamily: "var(--font-fira), monospace" }}>JudgeO - AI Mentor</span>
          <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
        </div>

        <div style={{ display: "flex", height: 320 }}>
          <div style={{ width: 44, background: "#111", borderRight: "1px solid rgba(255,255,255,0.04)" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "82%",
                      background: msg.role === "user" ? "#f97316" : "#1a1a1a",
                      border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.07)" : "none",
                      borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                      padding: "8px 12px",
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: msg.role === "user" ? "#fff" : "#d1d5db",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#555" }}>
                Type a message...
              </div>
              <div style={{ width: 30, height: 30, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                ^
              </div>
            </div>
          </div>
        </div>
      </div>
    </BreathePanel>
  );
}

function AnalyticsMock() {
  const topics = [
    { name: "Arrays & Hashing", score: 94, bar: 94 },
    { name: "Two Pointers", score: 88, bar: 88 },
    { name: "Sliding Window", score: 76, bar: 76 },
    { name: "Binary Search", score: 82, bar: 82 },
  ];

  return (
    <BreathePanel>
      <div
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(249,115,22,0.12), 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          <span style={{ marginLeft: 10, fontSize: 11, color: "#555", fontFamily: "var(--font-fira), monospace" }}>JudgeO - Dashboard</span>
          <span style={{ marginLeft: "auto", background: "#f97316", color: "#fff", fontSize: 10, padding: "2px 10px", borderRadius: 4, fontWeight: 700 }}>New Interview</span>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "space-between" }}>
            {[85, 92, 88].map((pct, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{pct}%</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>Score</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topics.map((t) => (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#9ca3af", width: 120, flexShrink: 0 }}>{t.name}</span>
                <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                  <div style={{ width: `${t.bar}%`, height: "100%", background: "linear-gradient(90deg, #f97316, #fb923c)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, color: "#f97316", width: 28, textAlign: "right", fontFamily: "var(--font-fira), monospace" }}>{t.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BreathePanel>
  );
}

function TextBlock({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2
        style={{
          fontSize: "clamp(36px, 4vw, 52px)",
          fontWeight: 900,
          color: "#ffffff",
          lineHeight: 1.1,
          margin: "0 0 24px",
          letterSpacing: "-0.5px",
          fontFamily: "var(--font-nunito), sans-serif",
        }}
      >
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function TextBlockRight({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2
        style={{
          fontSize: "clamp(36px, 4vw, 52px)",
          fontWeight: 900,
          color: "#ffffff",
          lineHeight: 1.1,
          margin: "0 0 24px",
          letterSpacing: "-0.5px",
          fontFamily: "var(--font-nunito), sans-serif",
        }}
      >
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function BulletItem({ icon, text }: { icon: string; text: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function HighlightText({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#f97316", fontWeight: 700 }}>{children}</span>;
}

function MockSlide({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "relative" }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -30,
          background: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}

export default function FeatureDeepDiveSection() {
  return (
    <>
      <SectionWrap id="sheets" bgNum="1">
        <TextBlock
          title={
            <>
              Structured
              <br />
              DSA Sheets
            </>
          }
        >
          <BulletItem icon="-" text="Curated sheets designed for a better learning experience." />
          <BulletItem icon="-" text="Detailed videos and editorials to help you master every problem." />
          <BulletItem icon="-" text="Stay consistent with streaks and leaderboard competition." />
          <BulletItem icon="-" text="AI-powered instant doubt support for faster learning." />
        </TextBlock>

        <MockSlide>
          <SheetsMock />
        </MockSlide>
      </SectionWrap>

      <SectionWrap bgNum="2">
        <MockSlide>
          <IDEMock />
        </MockSlide>

        <TextBlockRight title="JudgeO IDE">
          <BulletItem icon="-" text={<><HighlightText>Run your code instantly</HighlightText> with our powerful online compiler.</>} />
          <BulletItem icon="-" text={<>Support for <HighlightText>multiple languages</HighlightText> including C++, Java, and Python.</>} />
          <BulletItem icon="-" text={<><HighlightText>Stay consistent</HighlightText> with streaks and a global leaderboard to compete.</>} />
          <BulletItem icon="-" text={<><HighlightText>AI-powered</HighlightText> instant support and solutions for every submission.</>} />
          <div style={{ marginTop: 32 }}>
            <Link
              href="/auth/sign-up"
              id="feature2-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#f97316",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                padding: "13px 28px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              Try It Free {"->"}
            </Link>
          </div>
        </TextBlockRight>
      </SectionWrap>

      <SectionWrap bgNum="3">
        <TextBlock title="AI Mentor">
          <p style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1.75, margin: "0 0 24px" }}>
            Get a personalized learning experience powered by AI. Instantly get doubt support,
            step-by-step explanations, and intelligent hints when you need them.
          </p>
          <BulletItem icon="-" text="Ask doubts in natural language, get clear code-level answers." />
          <BulletItem icon="-" text="Guided hints that teach you to think, not just copy solutions." />
          <BulletItem icon="-" text="Tracks weak areas and adapts explanations accordingly." />
        </TextBlock>

        <MockSlide>
          <AIMentorMock />
        </MockSlide>
      </SectionWrap>

      <SectionWrap id="about" bgNum="4">
        <MockSlide>
          <AnalyticsMock />
        </MockSlide>

        <TextBlockRight title="Interview Analytics">
          <p style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1.75, margin: "0 0 24px" }}>
            Get deep insights into your interview performance with real-time analytics. Identify
            weaknesses, track your growth over time, and target the exact topics that need attention.
          </p>
          <BulletItem icon="-" text="Technical depth scores across all major DSA topics." />
          <BulletItem icon="-" text="Communication and problem-solving quality metrics." />
          <BulletItem icon="-" text="Session-by-session improvement tracking and streaks." />
          <BulletItem icon="-" text="Company-specific benchmarks and readiness score." />
        </TextBlockRight>
      </SectionWrap>
    </>
  );
}
