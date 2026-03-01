"use client";
import Link from "next/link";

const tagColors = {
  easy: {
    bg: "rgba(16,185,129,0.12)",
    text: "#34d399",
    border: "rgba(52,211,153,0.25)",
  },
  medium: {
    bg: "rgba(245,158,11,0.12)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.25)",
  },
  hard: {
    bg: "rgba(239,68,68,0.12)",
    text: "#f87171",
    border: "rgba(248,113,113,0.25)",
  },
};

const dailyTips = [
  {
    text: "When solving heap problems, always ask: <strong>do I need the min or max k elements?</strong> This determines which heap type to use.",
    topic: "Heap",
  },
  {
    text: "For array problems, consider the <strong>two-pointer technique</strong> — it often reduces O(n²) solutions to O(n).",
    topic: "Array",
  },
];

const css = `
:root {
  --bg: transparent;
  --surface: rgba(23, 23, 23, 0.6);
  --surface2: rgba(38, 38, 38, 0.5);
  --surface3: rgba(45, 45, 45, 0.5);
  --border: rgba(255,255,255,0.06);
  --border-active: rgba(255,255,255,0.12);
  --text: #e5e5e5;
  --muted: #737373;
  --dim: #525252;
  --accent: #f59e0b;
  --accent-dim: rgba(245,158,11,0.06);
  --accent-border: rgba(245,158,11,0.15);
  --red: #ef4444;
  --green: #10b981;
  --r: 10px;
  --r-lg: 12px;
}

@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes barGrow { from { width: 0; } }
@keyframes ringDraw { from { stroke-dashoffset: 226; } }

.db { color:var(--text); -webkit-font-smoothing:antialiased; }

/* LAYOUT */
.db-main { max-width:1200px; margin:0 auto; padding:0 24px 48px; display:flex; flex-direction:column; gap:16px; }

/* GREETING */
.greeting { animation:fadeUp 0.35s ease both; }
.greeting-name { font-size:1.75rem; font-weight:600; color:#fff; letter-spacing:-0.02em; }
.greeting-sub { font-size:0.875rem; color:var(--muted); margin-top:2px; }

/* REVISION BANNER */
.revision-banner {
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r-lg);
  overflow:hidden;
  animation:fadeUp 0.35s ease both 0.05s;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.revision-banner:hover {
  border-color:rgba(245,158,11,0.2);
  box-shadow:0 0 0 1px rgba(245,158,11,0.08);
}
.revision-top {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 18px 12px;
  border-bottom:1px solid var(--border);
}
.revision-heading { display:flex; align-items:center; gap:8px; }
.revision-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); flex-shrink:0; }
.revision-title { font-size:0.75rem; font-weight:500; color:var(--accent); text-transform:uppercase; letter-spacing:0.5px; }
.revision-count {
  font-size:0.7rem; color:var(--muted);
  background:var(--surface3); border:1px solid var(--border);
  padding:2px 8px; border-radius:999px;
}
.revision-count strong { color:var(--accent); }
.revision-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(240px,1fr)); gap:0; }
.revision-item {
  display:flex; align-items:center; gap:10px;
  padding:12px 18px;
  border-right:1px solid var(--border);
  border-bottom:1px solid var(--border);
  cursor:pointer;
  transition:background 0.15s, box-shadow 0.15s;
  text-decoration:none;
  color:inherit;
}
.revision-item:hover { background:rgba(255,255,255,0.02); box-shadow:inset 0 0 0 1px rgba(245,158,11,0.1); }
.revision-item:last-child { border-right:none; }
.rev-num { font-size:0.7rem; color:var(--dim); width:16px; flex-shrink:0; }
.rev-info { flex:1; min-width:0; }
.rev-name { font-size:0.85rem; font-weight:500; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rev-due { font-size:0.65rem; color:var(--red); margin-top:1px; }
.rev-tag { font-size:0.6rem; font-weight:500; padding:2px 6px; border-radius:999px; border:1px solid; white-space:nowrap; flex-shrink:0; }
.rev-empty { padding:24px 18px; text-align:center; color:var(--muted); font-size:0.85rem; }
.rev-empty-icon { font-size:20px; margin-bottom:6px; }

/* TWO COLUMN GRID */
.p2-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; animation:fadeUp 0.35s ease both 0.1s; }

/* Weakest Sheet */
.weak-card {
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r-lg); padding:18px;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.weak-card:hover {
  border-color:rgba(239,68,68,0.15);
  box-shadow:0 0 0 1px rgba(239,68,68,0.06);
}
.weak-eyebrow { font-size:0.65rem; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; color:#f87171; margin-bottom:10px; display:flex; align-items:center; gap:5px; }
.weak-name { font-size:1.25rem; font-weight:600; color:#fff; margin-bottom:4px; letter-spacing:-0.01em; }
.weak-desc { font-size:0.8rem; color:var(--muted); line-height:1.5; margin-bottom:14px; }
.weak-stats { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:8px; }
.weak-pct { font-size:2rem; font-weight:700; color:#f87171; line-height:1; }
.weak-frac { font-size:0.7rem; color:var(--muted); }
.progress-bar { height:2px; background:rgba(255,255,255,0.04); border-radius:999px; overflow:hidden; }
.progress-fill { height:100%; border-radius:999px; animation:barGrow 0.8s cubic-bezier(0.22,1,0.36,1) both; }
.btn-focus {
  margin-top:12px; width:100%; padding:8px 14px;
  background:transparent; border:1px solid rgba(239,68,68,0.15);
  color:#f87171; border-radius:var(--r); font-size:0.8rem; font-weight:500;
  cursor:pointer; transition:background 0.15s, border-color 0.15s;
}
.btn-focus:hover { background:rgba(239,68,68,0.06); border-color:rgba(239,68,68,0.25); }

/* Overall Progress */
.progress-card {
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r-lg); padding:18px;
  display:flex; flex-direction:column; gap:0;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.progress-card:hover {
  border-color:rgba(245,158,11,0.15);
  box-shadow:0 0 0 1px rgba(245,158,11,0.06);
}
.progress-card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }
.prog-label { font-size:0.65rem; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; color:var(--muted); }
.ring-wrap { position:relative; width:72px; height:72px; flex-shrink:0; }
.ring-wrap svg { transform:rotate(-90deg); }
.ring-fill { stroke-dasharray:226; animation:ringDraw 1s cubic-bezier(0.22,1,0.36,1) both 0.15s; }
.ring-label { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.ring-pct { font-size:0.9rem; font-weight:600; color:var(--accent); }
.ring-sub { font-size:0.6rem; color:var(--muted); }
.diff-rows { display:flex; flex-direction:column; gap:10px; }
.diff-row { display:flex; align-items:center; gap:10px; }
.diff-label-col { font-size:0.7rem; color:var(--muted); width:44px; }
.diff-bar-wrap { flex:1; height:3px; background:rgba(255,255,255,0.04); border-radius:999px; overflow:hidden; }
.diff-bar-fill { height:100%; border-radius:999px; animation:barGrow 0.8s cubic-bezier(0.22,1,0.36,1) both; }
.diff-count { font-size:0.7rem; color:var(--muted); width:36px; text-align:right; }
.total-solved { margin-bottom:16px; }
.total-num { font-size:2.5rem; font-weight:700; color:#fff; line-height:1; letter-spacing:-0.02em; }
.total-num span { font-size:1rem; color:var(--muted); font-weight:400; }
.total-sub { font-size:0.8rem; color:var(--muted); margin-top:2px; }

/* SHEETS PROGRESS */
.sheets-card {
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r-lg);
  animation:fadeUp 0.35s ease both 0.15s;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.sheets-card:hover {
  border-color:rgba(255,255,255,0.08);
  box-shadow:0 0 0 1px rgba(255,255,255,0.03);
}
.card-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 16px; border-bottom:1px solid var(--border);
}
.card-label { font-size:0.65rem; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; color:var(--muted); }
.link-btn { font-size:0.75rem; color:var(--muted); background:none; border:none; cursor:pointer; transition:color 0.15s; }
.link-btn:hover { color:var(--accent); }
.sheet-list { padding:4px 0; }
.sheet-row {
  display:grid; grid-template-columns:1fr 72px 100px 52px;
  align-items:center; gap:14px;
  padding:10px 16px; cursor:pointer;
  transition:background 0.15s, box-shadow 0.15s;
  text-decoration:none; color:inherit;
  border-bottom:1px solid var(--border);
}
.sheet-row:last-child { border-bottom:none; }
.sheet-row:hover { background:rgba(255,255,255,0.015); box-shadow:inset 0 0 0 1px rgba(255,255,255,0.04); }
.sheet-name { font-size:0.85rem; font-weight:500; color:var(--text); }
.sheet-prog-bar { height:2px; background:rgba(255,255,255,0.04); border-radius:999px; overflow:hidden; }
.sheet-prog-fill { height:100%; border-radius:999px; animation:barGrow 0.8s cubic-bezier(0.22,1,0.36,1) both; }
.sheet-frac { font-size:0.7rem; color:var(--muted); text-align:center; }
.sheet-pct { font-size:0.75rem; font-weight:600; text-align:right; }

/* BOTTOM ROW */
.bottom-grid { display:grid; grid-template-columns:1fr 280px; gap:14px; animation:fadeUp 0.35s ease both 0.2s; }
.submissions-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); transition:border-color 0.2s, box-shadow 0.2s; }
.submissions-card:hover { border-color:rgba(255,255,255,0.08); box-shadow:0 0 0 1px rgba(255,255,255,0.03); }
.sub-list { padding:4px 0; }
.sub-row {
  display:flex; align-items:center; gap:10px;
  padding:10px 16px; cursor:pointer;
  transition:background 0.15s, box-shadow 0.15s;
  text-decoration:none; color:inherit;
  border-bottom:1px solid var(--border);
}
.sub-row:last-child { border-bottom:none; }
.sub-row:hover { background:rgba(255,255,255,0.015); box-shadow:inset 0 0 0 1px rgba(255,255,255,0.04); }
.sub-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
.sub-info { flex:1; min-width:0; }
.sub-title { font-size:0.8rem; font-weight:500; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sub-meta { font-size:0.65rem; color:var(--muted); margin-top:1px; }
.sub-diff { font-size:0.6rem; font-weight:500; padding:2px 6px; border-radius:999px; border:1px solid; }
.sub-time { font-size:0.65rem; color:var(--dim); white-space:nowrap; }
.empty { padding:24px; text-align:center; color:var(--muted); font-size:0.8rem; }

/* Side column */
.side-col { display:flex; flex-direction:column; gap:12px; }
.tip-card {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--r-lg); padding:14px 16px;
  border-left:2px solid rgba(245,158,11,0.4);
  transition:border-color 0.2s;
}
.tip-card:hover { border-color:rgba(245,158,11,0.25); border-left-color:rgba(245,158,11,0.6); }
.tip-label { font-size:0.65rem; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; color:var(--accent); margin-bottom:8px; }
.tip-text { font-size:0.8rem; color:var(--muted); line-height:1.55; }
.tip-text strong { color:var(--text); font-weight:500; }
.quick-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); padding:14px 16px; transition:border-color 0.2s, box-shadow 0.2s; }
.quick-card:hover { border-color:rgba(255,255,255,0.08); box-shadow:0 0 0 1px rgba(255,255,255,0.03); }
.quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-top:10px; }
.quick-btn {
  display:flex; align-items:center; gap:6px;
  padding:7px 10px; border-radius:var(--r);
  background:var(--surface2); border:1px solid var(--border);
  font-size:0.75rem; color:var(--muted); cursor:pointer;
  transition:color 0.15s, background 0.15s, border-color 0.15s, box-shadow 0.15s;
  text-decoration:none; white-space:nowrap;
}
.quick-btn:hover { color:var(--text); background:var(--surface3); border-color:var(--border-active); box-shadow:0 0 0 1px rgba(255,255,255,0.04); }

@media (max-width:900px) {
  .p2-grid, .bottom-grid { grid-template-columns:1fr; }
  .db-main { padding:0 16px 40px; }
  .sheet-row { grid-template-columns:1fr 56px 40px; }
  .sheet-frac { display:none; }
}
`;

function ProgressRing({ pct }: { pct: number }) {
  const r = 30,
    circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="5"
        />
        <circle
          className="ring-fill"
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="url(#rg)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="ring-label">
        <div className="ring-pct">{pct}%</div>
        <div className="ring-sub">done</div>
      </div>
    </div>
  );
}

function getRelativeTime(date: Date | string | null) {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function getDueLabel(date: Date | string | null) {
  if (!date) return "Due now";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Due today";
  if (days === 1) return "1 day overdue";
  return `${days} days overdue`;
}

interface DashboardProps {
  data: {
    success: boolean;
    data: {
      easy: number;
      medium: number;
      hard: number;
      easySolved: number;
      mediumSolved: number;
      hardSolved: number;
      easyProgress: number;
      mediumProgress: number;
      hardProgress: number;
      completion: number;
      sheetProgress: Array<{

        id: string;
        slug : string
        title: string;
        total: number;
        solved: number;
        progress: number;
      }>;
      recentSubmission: Array<{
        id: string;
        solvedAt: string | null;
        updatedAt: string;
        problem: {
          title: string;
          difficulty: string;
          slug: string;
          link: string;
        };
      }>;
      name: string;
      problemsToRevise: Array<{
        id: string;
        nextAttempt: string | null;
        problem: {
          title: string;
          difficulty: string;
          slug: string;
          link: string;
        };
      }>;
      totalDue: number;
    };
  };
}

export default function Dashboard({ data }: DashboardProps) {
  const d = data.data;

  const totalProblems = d.easy + d.medium + d.hard;
  const totalSolved = d.easySolved + d.mediumSolved + d.hardSolved;
  const completion =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  const weakest = [...d.sheetProgress].sort(
    (a, b) => a.progress - b.progress,
  )[0];
  const tip = dailyTips[0];

  const quickLinks = [
    { icon: "📊", label: "My Sheets", href: "/sheets" },
    { icon: "📋", label: "Problems", href: "/problems" },
    { icon: "🎯", label: "Interview", href: "/interview" },
    { icon: "✏️", label: "Revisions", href: "/dashboard" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="db">
        <main className="db-main">
          {/* GREETING */}
          <div className="greeting">
            <div className="greeting-name">Good to see you, {d.name}</div>
            <div className="greeting-sub">
              {d.totalDue > 0
                ? `You have ${d.totalDue} problem${d.totalDue > 1 ? "s" : ""} due for revision today.`
                : "All caught up — keep the streak going."}
            </div>
          </div>

          {/* ── P1: REVISION BANNER ── */}
          <div className="revision-banner">
            <div className="revision-top">
              <div className="revision-heading">
                <div className="revision-dot" />
                <div className="revision-title">Due for Revision</div>
              </div>
              <div className="revision-count">
                <strong>{d.totalDue}</strong> total due
              </div>
            </div>
            {d.problemsToRevise.length === 0 ? (
              <div className="rev-empty">
                <div className="rev-empty-icon">✅</div>
                No problems due right now — you're all caught up!
              </div>
            ) : (
              <div className="revision-grid">
                {d.problemsToRevise.map((item, i) => {
                  const diff = item.problem
                    .difficulty as keyof typeof tagColors;
                  const t = tagColors[diff] ?? tagColors.medium;
                  return (
                    <a
                      key={item.id}
                      href={item.problem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="revision-item"
                    >
                      <div className="rev-num">0{i + 1}</div>
                      <div className="rev-info">
                        <div className="rev-name">{item.problem.title}</div>
                        <div className="rev-due">
                          {getDueLabel(item.nextAttempt)}
                        </div>
                      </div>
                      <div
                        className="rev-tag"
                        style={{
                          background: t.bg,
                          color: t.text,
                          borderColor: t.border,
                        }}
                      >
                        {diff}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── P2: WEAKEST SHEET + OVERALL PROGRESS ── */}
          <div className="p2-grid">
            {/* Weakest Sheet */}
            {weakest && (
              <div className="weak-card">
                <div className="weak-eyebrow">⚠ Focus Area</div>
                <div className="weak-name">{weakest.title}</div>
                <div className="weak-desc">
                  Your weakest sheet — only {weakest.solved} of {weakest.total}{" "}
                  solved. A focused session here will make the biggest
                  difference.
                </div>
                <div className="weak-stats">
                  <div className="weak-pct">{weakest.progress}%</div>
                  <div className="weak-frac">
                    {weakest.solved} / {weakest.total}
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${weakest.progress}%`,
                      background: "linear-gradient(90deg,#ef4444,#f87171)",
                    }}
                  />
                </div>
                <button className="btn-focus">
                  Practice {weakest.title} →
                </button>
              </div>
            )}

            {/* Overall Progress */}
            <div className="progress-card">
              <div className="progress-card-top">
                <div>
                  <div className="prog-label">Overall Progress</div>
                  <div className="total-solved">
                    <div className="total-num">
                      {totalSolved} <span>/ {totalProblems}</span>
                    </div>
                    <div className="total-sub">problems solved</div>
                  </div>
                </div>
                <ProgressRing pct={completion} />
              </div>
              <div className="diff-rows">
                {[
                  {
                    label: "easy",
                    solved: d.easySolved,
                    total: d.easy,
                    color: "#34d399",
                  },
                  {
                    label: "medium",
                    solved: d.mediumSolved,
                    total: d.medium,
                    color: "#fbbf24",
                  },
                  {
                    label: "hard",
                    solved: d.hardSolved,
                    total: d.hard,
                    color: "#f87171",
                  },
                ].map(({ label, solved, total, color }) => (
                  <div key={label} className="diff-row">
                    <div className="diff-label-col" style={{ color }}>
                      {label}
                    </div>
                    <div className="diff-bar-wrap">
                      <div
                        className="diff-bar-fill"
                        style={{
                          width: `${total > 0 ? (solved / total) * 100 : 0}%`,
                          background: color,
                        }}
                      />
                    </div>
                    <div className="diff-count">
                      {solved}/{total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── P3: SHEETS PROGRESS ── */}
          <div className="sheets-card">
            <div className="card-header">
              <div className="card-label">Sheet Progress</div>
              <Link href="/sheets">
                <button className="link-btn">View all →</button>
              </Link>
            </div>
            <div className="sheet-list">
              {d.sheetProgress.map((s) => {
                const pct = s.progress;
                const color =
                  pct < 30 ? "#f87171" : pct < 70 ? "#fbbf24" : "#34d399";
                return (
                  <Link
                    key={s.id}
                    href={`/sheets/${s.slug}`}
                    className="sheet-row"
                  >
                    <div className="sheet-name">{s.title}</div>
                    <div className="sheet-prog-bar">
                      console.log("sheet-slug",s.slug);
                      <div
                        className="sheet-prog-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <div
                      className="sheet-frac"
                      style={{ color: "var(--muted)" }}
                    >
                      {s.solved}/{s.total}
                    </div>
                    <div className="sheet-pct" style={{ color }}>
                      {pct}%
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── P4: RECENT SUBMISSIONS + SIDE ── */}
          <div className="bottom-grid">
            <div className="submissions-card">
              <div className="card-header">
                <div className="card-label">Recent Submissions</div>
                <Link href="/problems">
                  <button className="link-btn">Solve more →</button>
                </Link>
              </div>
              {d.recentSubmission.length === 0 ? (
                <div className="empty">
                  No submissions yet — solve your first problem!
                </div>
              ) : (
                <div className="sub-list">
                  {d.recentSubmission.map((sub) => {
                    const diff = sub.problem
                      .difficulty as keyof typeof tagColors;
                    const t = tagColors[diff] ?? tagColors.medium;
                    return (
                      <a
                        key={sub.id}
                        href={sub.problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sub-row"
                      >
                        <div
                          className="sub-dot"
                          style={{
                            background: "#34d399",
                            boxShadow: "0 0 0 2px rgba(52,211,153,0.2)",
                          }}
                        />
                        <div className="sub-info">
                          <div className="sub-title">{sub.problem.title}</div>
                          <div className="sub-meta">Solved</div>
                        </div>
                        <div
                          className="sub-diff"
                          style={{
                            background: t.bg,
                            color: t.text,
                            borderColor: t.border,
                          }}
                        >
                          {diff}
                        </div>
                        <div className="sub-time">
                          {getRelativeTime(sub.solvedAt)}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="side-col">
              <div className="tip-card">
                <div className="tip-label">✦ Daily Tip</div>
                <div
                  className="tip-text"
                  dangerouslySetInnerHTML={{ __html: tip.text }}
                />
              </div>
              <div className="quick-card">
                <div className="card-label">Quick Jump</div>
                <div className="quick-grid">
                  {quickLinks.map((q) => (
                    <Link key={q.href} href={q.href} className="quick-btn">
                      <span>{q.icon}</span> {q.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
