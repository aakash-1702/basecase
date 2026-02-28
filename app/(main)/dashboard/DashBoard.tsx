"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ── Backend Data (from API) ──────────────────────────────────────────────────
const backendData = {
  success: true,
  data: {
    totalEasyProblems: 10,
    totalMediumProblems: 18,
    totalHardProblems: 1,
    totalEasySolved: 0,
    totalMediumSolved: 0,
    totalHardSolved: 0,
    easyProgress: 0,
    mediumProgress: 0,
    hardProgress: 0,
    completion: 0,
    sheetProgress: [
      {
        id: "cmlx9xfr5000qo8epxbjph909",
        title: "Array",
        total: 29,
        solved: 0,
        progress: 0,
      },
    ],
    recentSubmissions: [],
  },
};

// ── Demo/Static Data ─────────────────────────────────────────────────────────
const streak = { current: 7, best: 12 };

const demoSheets = [
  { id: "1", title: "Array", total: 29, solved: 0, progress: 0 },
  {
    id: "2",
    title: "Heap / Priority Queue",
    total: 45,
    solved: 12,
    progress: 27,
  },
  { id: "3", title: "Stack", total: 30, solved: 18, progress: 60 },
  { id: "4", title: "Dynamic Programming", total: 50, solved: 5, progress: 10 },
];

const demoSubmissions = [
  {
    id: "1",
    problem: "Two Sum",
    difficulty: "Easy",
    status: "Accepted",
    time: "2h ago",
    sheet: "Array",
  },
  {
    id: "2",
    problem: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    status: "Wrong Answer",
    time: "3h ago",
    sheet: "Array",
  },
  {
    id: "3",
    problem: "Top K Frequent Elements",
    difficulty: "Medium",
    status: "Accepted",
    time: "Yesterday",
    sheet: "Heap / Priority Queue",
  },
  {
    id: "4",
    problem: "Valid Parentheses",
    difficulty: "Easy",
    status: "Accepted",
    time: "Yesterday",
    sheet: "Stack",
  },
];

const tagColors = {
  Easy: {
    bg: "rgba(16,185,129,0.14)",
    text: "#34d399",
    border: "rgba(52,211,153,0.35)",
  },
  Medium: {
    bg: "rgba(245,158,11,0.14)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.35)",
  },
  Hard: {
    bg: "rgba(239,68,68,0.14)",
    text: "#f87171",
    border: "rgba(248,113,113,0.35)",
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
  {
    text: "Stack problems often involve <strong>matching pairs or tracking state</strong>. Think about what needs to be 'remembered' until later.",
    topic: "Stack",
  },
];

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #080808;
  --surface:   #0f0f0f;
  --surface2:  #141414;
  --surface3:  #181818;
  --border:    rgba(255,255,255,0.06);
  --border-h:  rgba(245,158,11,0.25);
  --text:      #e5e5e5;
  --muted:     #7a7a7a;
  --dimmer:    #4a4a4a;
  --amber:     #f59e0b;
  --amber-d:   #d97706;
  --orange:    #ea580c;
  --emerald:   #10b981;
  --red:       #ef4444;
  --font:      'DM Sans', sans-serif;
  --font-head: 'Syne', sans-serif;
  --mono:      'DM Mono', monospace;
  --radius-sm: 10px;
  --radius:    14px;
  --radius-lg: 18px;
  --radius-xl: 22px;
  --shadow-card: 0 4px 28px rgba(0,0,0,0.45);
  --shadow-amber: 0 8px 36px rgba(245,158,11,0.10);
  --glow-amber: 0 0 0 1px rgba(245,158,11,0.14), 0 8px 36px rgba(245,158,11,0.10);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes popIn {
  0%   { opacity: 0; transform: scale(0.92); }
  65%  { transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes slideFade {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes barGrow {
  from { width: 0; }
}
@keyframes ringFill {
  from { stroke-dashoffset: 226; }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulseAmber {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
  50%       { box-shadow: 0 0 0 5px rgba(245,158,11,0.07); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes flamePulse {
  0%, 100% { text-shadow: none; }
  50%       { text-shadow: 0 0 14px rgba(245,158,11,0.7); }
}
@keyframes dotPop {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.35); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes aiOrb {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
  33%       { transform: scale(1.08) rotate(120deg); opacity: 0.9; }
  66%       { transform: scale(0.95) rotate(240deg); opacity: 0.75; }
}
@keyframes borderFlow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.35; }
  50%       { opacity: 0.65; }
}

.db {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

/* ── TOP HEADER ── */
.db-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 32px;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 40;
  background: rgba(8,8,8,0.88);
  backdrop-filter: blur(20px);
  max-width: 100%;
}
.logo {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-head); font-size: 20px; font-weight: 800; color: #fff;
  letter-spacing: -0.5px;
}
.logo-mark {
  width: 32px; height: 32px; background: linear-gradient(135deg, var(--amber-d), var(--orange));
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.logo em { color: var(--amber); font-style: normal; }

.nav { display: flex; align-items: center; gap: 4px; }
.nav-item {
  padding: 7px 15px; border-radius: var(--radius-sm);
  font-size: 13.5px; font-weight: 500; color: var(--muted);
  background: none; border: none; cursor: pointer; font-family: var(--font);
  transition: color 0.18s, background 0.18s;
  position: relative;
}
.nav-item:hover { color: var(--text); background: rgba(255,255,255,0.04); }
.nav-item.active {
  color: var(--amber); background: rgba(245,158,11,0.08);
}
.nav-item.active::after {
  content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
  width: 16px; height: 2px; background: var(--amber); border-radius: 999px;
}

.header-right { display: flex; align-items: center; gap: 12px; }
.streak-pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.18);
  border-radius: 999px; padding: 6px 14px;
  font-size: 12.5px; font-weight: 600; color: var(--amber); font-family: var(--mono);
}
.streak-pill .fl { animation: flamePulse 2.5s ease-in-out infinite; display: inline-block; }
.btn-session {
  background: linear-gradient(135deg, var(--amber-d), var(--orange));
  color: #fff; border: none; border-radius: var(--radius-sm);
  padding: 8px 18px; font-size: 13px; font-weight: 600; font-family: var(--font);
  cursor: pointer; transition: filter 0.18s, transform 0.18s;
}
.btn-session:hover { filter: brightness(1.1); transform: translateY(-1px); }

/* ── GREETING ── */
.db-top {
  padding: 32px 32px 0; max-width: 1320px; margin: 0 auto;
  animation: fadeUp 0.45s ease both;
}
.db-greeting { font-family: var(--font-head); font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
.db-greeting em { font-style: normal; color: var(--amber); }
.db-subline { font-size: 14px; color: var(--muted); margin-top: 5px; }

/* ── LAYOUT ── */
.db-body {
  display: grid; grid-template-columns: 1fr 344px; gap: 22px;
  padding: 24px 32px 80px; max-width: 1320px; margin: 0 auto;
}
@media (max-width: 980px) {
  .db-body { grid-template-columns: 1fr; padding: 20px; }
  .db-top  { padding: 24px 20px 0; }
  .db-header { padding: 16px 20px; }
}
.col-l, .col-r { display: flex; flex-direction: column; gap: 20px; }

/* ── CARD BASE ── */
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 22px;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}
.card:hover { border-color: var(--border-h); transform: translateY(-2px); box-shadow: var(--shadow-amber); }
.card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.card-title { font-size: 10.5px; font-weight: 700; color: var(--dimmer); text-transform: uppercase; letter-spacing: 1px; font-family: var(--mono); }
.view-all { font-size: 12.5px; color: var(--muted); background: none; border: none; cursor: pointer; font-family: var(--font); transition: color 0.18s; padding: 0; }
.view-all:hover { color: var(--amber); }

/* ── HERO CARD ── */
.hero-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 28px;
  position: relative; overflow: hidden;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
  animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both 0.05s;
}
.hero-card:hover { border-color: var(--border-h); transform: translateY(-2px); box-shadow: var(--shadow-amber); }
.hero-card::before {
  content: ''; position: absolute; top: -80px; right: -80px;
  width: 240px; height: 240px;
  background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%);
  pointer-events: none; animation: glowPulse 4s ease-in-out infinite;
}
.hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 28px; }
.hero-num { font-family: var(--font-head); font-size: 60px; font-weight: 800; color: var(--amber); line-height: 1; letter-spacing: -3px; animation: countUp 0.55s ease both 0.2s; }
.hero-num sub { font-size: 18px; color: var(--dimmer); font-weight: 400; letter-spacing: 0; vertical-align: baseline; }
.hero-lbl { font-size: 13px; color: var(--muted); margin-top: 6px; }

.ring-wrap { position: relative; width: 88px; height: 88px; flex-shrink: 0; }
.ring-wrap svg { transform: rotate(-90deg); }
.ring-fill { stroke-dasharray: 226; animation: ringFill 1.3s cubic-bezier(0.22,1,0.36,1) both 0.3s; }
.ring-pct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--amber); font-family: var(--mono); animation: countUp 0.5s ease both 0.65s; opacity: 0; animation-fill-mode: both; }

.diff-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.diff-pill { border-radius: var(--radius-sm); padding: 14px 16px; transition: transform 0.22s; cursor: default; }
.diff-pill:hover { transform: translateY(-3px); }
.diff-label { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.9px; opacity: 0.7; margin-bottom: 8px; font-family: var(--mono); }
.diff-val { font-size: 30px; font-weight: 800; line-height: 1; font-family: var(--font-head); }
.diff-total { font-size: 11.5px; color: var(--muted); margin-top: 3px; font-family: var(--mono); }
.diff-bar { height: 3px; background: rgba(255,255,255,0.07); border-radius: 999px; margin-top: 12px; overflow: hidden; }
.diff-bar-fill { height: 100%; border-radius: 999px; animation: barGrow 1.1s cubic-bezier(0.22,1,0.36,1) both; }

/* ── RECOMMENDED CARD ── */
.ai-card {
  border-radius: var(--radius-xl); overflow: hidden; position: relative;
  animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both 0.12s;
}
.ai-card-inner {
  background: linear-gradient(135deg, #0c0c0e 0%, #100f0c 50%, #0d0b08 100%);
  border: 1px solid rgba(245,158,11,0.18);
  border-radius: var(--radius-xl);
  padding: 22px 24px; position: relative; overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.ai-card-inner:hover {
  border-color: rgba(245,158,11,0.32);
  box-shadow: 0 12px 48px rgba(245,158,11,0.10);
}
.ai-orb {
  position: absolute; right: -30px; top: -30px;
  width: 160px; height: 160px;
  background: radial-gradient(circle at center, rgba(245,158,11,0.10) 0%, rgba(234,88,12,0.05) 40%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.ai-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.1px;
  color: var(--amber-d); margin-bottom: 14px; display: flex; align-items: center; gap: 7px;
  font-family: var(--mono);
}
.ai-pulse-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--amber);
  box-shadow: 0 0 0 2px rgba(245,158,11,0.2);
  animation: flamePulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
.rec-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05);
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  animation: slideFade 0.35s ease both;
}
.rec-row + .rec-row { margin-top: 7px; }
.rec-row:hover { background: rgba(245,158,11,0.06); border-color: rgba(245,158,11,0.18); transform: translateX(4px); }
.rec-title { flex: 1; font-size: 13px; font-weight: 600; color: #d8d8d8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rec-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid; letter-spacing: 0.3px; white-space: nowrap; }
.rec-reason { font-size: 10.5px; color: var(--muted); font-family: var(--mono); white-space: nowrap; }

/* ── SHEETS ── */
.sheet-row {
  border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.055);
  background: var(--surface2); padding: 16px 18px; cursor: pointer;
  transition: background 0.22s, border-color 0.22s, transform 0.22s, box-shadow 0.22s;
  animation: slideFade 0.38s ease both;
}
.sheet-row + .sheet-row { margin-top: 10px; }
.sheet-row:hover {
  background: rgba(245,158,11,0.035); border-color: rgba(245,158,11,0.2);
  transform: translateX(5px); box-shadow: -3px 0 0 0 rgba(245,158,11,0.45);
}
.sheet-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.sheet-name { font-size: 14px; font-weight: 600; color: #e0e0e0; font-family: var(--font-head); }
.sheet-count { font-size: 12px; color: var(--muted); margin-top: 3px; font-family: var(--mono); }
.pct-badge {
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px;
  background: rgba(245,158,11,0.09); color: var(--amber);
  border: 1px solid rgba(245,158,11,0.2); font-family: var(--mono);
  transition: background 0.18s;
}
.sheet-row:hover .pct-badge { background: rgba(245,158,11,0.18); }
.prog-bar { height: 3px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; margin-bottom: 10px; }
.prog-fill { height: 100%; background: linear-gradient(90deg, var(--amber-d), var(--orange)); border-radius: 999px; animation: barGrow 1.1s cubic-bezier(0.22,1,0.36,1) both; }
.sheet-next { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.next-prob { color: #b0b0b0; }
.tag { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; border: 1px solid; letter-spacing: 0.3px; white-space: nowrap; }

/* ── SUBMISSIONS ── */
.sub-row {
  display: flex; align-items: center; gap: 12px; padding: 13px 14px;
  background: var(--surface2); border: 1px solid rgba(255,255,255,0.055);
  border-radius: var(--radius-sm); cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  animation: slideFade 0.38s ease both;
}
.sub-row + .sub-row { margin-top: 8px; }
.sub-row:hover { background: rgba(245,158,11,0.03); border-color: rgba(245,158,11,0.15); transform: translateX(4px); }
.sub-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; animation: dotPop 0.4s ease both; }
.sub-info { flex: 1; min-width: 0; }
.sub-problem { font-size: 13.5px; font-weight: 600; color: #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sub-meta { font-size: 11.5px; color: var(--muted); margin-top: 2px; font-family: var(--mono); }
.sub-time { font-size: 11px; color: var(--dimmer); font-family: var(--mono); white-space: nowrap; }
.sub-status { font-size: 11px; font-weight: 600; white-space: nowrap; font-family: var(--mono); }
.status-accepted { color: #34d399; }
.status-wrong { color: #f87171; }

/* ── WEAK SECTION CARD (Right Column) ── */
.weak-card {
  background: var(--surface); border: 1px solid rgba(239,68,68,0.15);
  border-radius: var(--radius-xl); padding: 22px; position: relative; overflow: hidden;
  transition: border-color 0.25s, transform 0.25s;
  animation: popIn 0.45s cubic-bezier(0.22,1,0.36,1) both 0.22s;
}
.weak-card:hover { border-color: rgba(239,68,68,0.3); transform: translateY(-2px); }
.weak-card::before {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%);
  pointer-events: none; border-radius: 50%;
}
.weak-eyebrow { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #f87171; margin-bottom: 12px; display: flex; align-items: center; gap: 7px; font-family: var(--mono); }
.weak-title { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 6px; }
.weak-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
.weak-stat { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.weak-pct { font-family: var(--mono); font-size: 24px; font-weight: 700; color: #f87171; }
.weak-total { font-size: 12px; color: var(--muted); font-family: var(--mono); }
.weak-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
.weak-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #ef4444, #f87171); animation: barGrow 1.1s cubic-bezier(0.22,1,0.36,1) both 0.5s; }
.weak-cta {
  margin-top: 16px; width: 100%; padding: 9px; font-size: 12.5px; font-weight: 600;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18);
  color: #f87171; border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font);
  transition: background 0.2s, border-color 0.2s, transform 0.18s;
}
.weak-cta:hover { background: rgba(239,68,68,0.16); border-color: rgba(239,68,68,0.35); transform: translateY(-1px); }

/* ── TIP CARD ── */
.tip-card {
  background: linear-gradient(135deg, rgba(245,158,11,0.07), rgba(234,88,12,0.03));
  border: 1px solid rgba(245,158,11,0.13); border-radius: var(--radius-xl); padding: 20px 22px;
  transition: border-color 0.25s, transform 0.25s;
  animation: popIn 0.45s cubic-bezier(0.22,1,0.36,1) both 0.35s;
}
.tip-card:hover { border-color: rgba(245,158,11,0.26); transform: translateY(-1px); }
.tip-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--amber-d); margin-bottom: 10px; font-family: var(--mono); }
.tip-text { font-size: 13px; color: #909090; line-height: 1.65; }
.tip-text strong { color: #d8d8d8; font-weight: 500; }

/* ── QUICK JUMP ── */
.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.quick-btn {
  background: var(--surface2); border: 1px solid rgba(255,255,255,0.055);
  border-radius: var(--radius-sm); padding: 12px 14px;
  display: flex; align-items: center; gap: 9px; font-size: 13px; color: #909090;
  cursor: pointer; font-family: var(--font);
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
  text-align: left;
}
.quick-btn:hover { background: rgba(245,158,11,0.065); border-color: rgba(245,158,11,0.2); color: var(--amber); transform: translateY(-2px); }
.quick-btn:active { transform: translateY(0); }
.quick-ico { font-size: 16px; transition: transform 0.2s; }
.quick-btn:hover .quick-ico { transform: scale(1.15); }

/* ── EMPTY STATES ── */
.empty-state { text-align: center; padding: 32px 20px; color: var(--muted); font-size: 13.5px; }
.empty-ico { font-size: 28px; margin-bottom: 10px; }
.empty-sub { font-size: 12px; color: var(--dimmer); margin-top: 5px; }
`;

function ProgressRing({ pct }: { pct: number }) {
  const r = 36,
    circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="ring-wrap">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="7"
        />
        <circle
          className="ring-fill"
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="url(#rg)"
          strokeWidth="7"
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
      <div className="ring-pct">{pct}%</div>
    </div>
  );
}

type Sheet = {
  id: string;
  title: string;
  total: number;
  solved: number;
  progress: number;
};

interface WeakSectionCardProps {
  sheets: Sheet[];
}

function WeakSectionCard({ sheets }: WeakSectionCardProps) {
  const weakest = [...sheets].sort((a, b) => a.progress - b.progress)[0];
  if (!weakest) return null;
  return (
    <div className="weak-card">
      <div className="weak-eyebrow">
        <span style={{ fontSize: 13 }}>⚠</span>
        Focus Area
      </div>
      <div className="weak-title">{weakest.title}</div>
      <div className="weak-desc">
        This is your weakest sheet — only {weakest.solved} of {weakest.total}{" "}
        problems solved. A focused session here will boost your overall score.
      </div>
      <div className="weak-stat">
        <div className="weak-pct">{weakest.progress}%</div>
        <div className="weak-total">
          {weakest.solved} / {weakest.total}
        </div>
      </div>
      <div className="weak-bar">
        <div
          className="weak-bar-fill"
          style={{ width: `${weakest.progress}%` }}
        />
      </div>
      <button className="weak-cta">Practice {weakest.title} Now →</button>
    </div>
  );
}

interface DashboardProps {
  data: {
    success: boolean;
    data: {
      totalEasyProblems: number;
      totalMediumProblems: number;
      totalHardProblems: number;
      totalEasySolved: number;
      totalMediumSolved: number;
      totalHardSolved: number;
      easyProgress: number;
      mediumProgress: number;
      hardProgress: number;
      completion: number;
      sheetProgress: Array<{
        id: string;
        title: string;
        total: number;
        solved: number;
        progress: number;
      }>;
      recentSubmissions: any[];
      name: string;
      recommended: Array<{
        id: string;
        confidence: string;
        solved: boolean;
        solvedAt: string | null;
        problem: {
          id: string;
          title: string;
          difficulty: string;
          link: string;
          slug: string;
        };
      }>;
    };
  };
}

export default function Dashboard({ data }: DashboardProps) {
  const d = data.data;
  const totalProblems =
    d.totalEasyProblems + d.totalMediumProblems + d.totalHardProblems;
  const totalSolved =
    d.totalEasySolved + d.totalMediumSolved + d.totalHardSolved;
  const completion =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  const sheets = d.sheetProgress;
  const submissions = d.recentSubmissions;
  const recommended = d.recommended ?? [];
  const tip = dailyTips[0];

  const [activeNav, setActiveNav] = useState("dashboard");

  const diffData = [
    {
      label: "Easy",
      solved: d.totalEasySolved,
      total: d.totalEasyProblems,
      color: "#34d399",
      bg: "rgba(16,185,129,0.09)",
      delay: "0.42s",
    },
    {
      label: "Medium",
      solved: d.totalMediumSolved,
      total: d.totalMediumProblems,
      color: "#fbbf24",
      bg: "rgba(245,158,11,0.09)",
      delay: "0.54s",
    },
    {
      label: "Hard",
      solved: d.totalHardSolved,
      total: d.totalHardProblems,
      color: "#f87171",
      bg: "rgba(239,68,68,0.09)",
      delay: "0.66s",
    },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="db">
        {/* ── GREETING ── */}
        <div className="db-top">
          <div className="db-greeting">Greetings ! {d.name}👋</div>
          <div className="db-subline">Keep the momentum going</div>
        </div>

        {/* ── BODY ── */}
        <div className="db-body">
          <div className="col-l">
            {/* Hero Progress Card */}
            <div className="hero-card">
              <div className="hero-top">
                <div>
                  <div className="hero-num">
                    {totalSolved} <sub>/ {totalProblems}</sub>
                  </div>
                  <div className="hero-lbl">
                    Problems solved across all sheets
                  </div>
                </div>
                <ProgressRing pct={completion} />
              </div>
              <div className="diff-row">
                {diffData.map(({ label, solved, total, color, bg, delay }) => (
                  <div
                    key={label}
                    className="diff-pill"
                    style={{ background: bg }}
                  >
                    <div className="diff-label" style={{ color }}>
                      {label}
                    </div>
                    <div className="diff-val" style={{ color }}>
                      {solved}
                    </div>
                    <div className="diff-total">/ {total}</div>
                    <div className="diff-bar">
                      <div
                        className="diff-bar-fill"
                        style={{
                          width: `${total > 0 ? (solved / total) * 100 : 0}%`,
                          background: color,
                          animationDelay: delay,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Problems Card */}
            <div
              className="ai-card"
              style={{
                animation:
                  "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both 0.12s",
              }}
            >
              <div className="ai-card-inner">
                <div className="ai-orb" />
                <div className="ai-label">
                  <span className="ai-pulse-dot" />
                  Recommended for You
                </div>
                {recommended.length === 0 ? (
                  <div className="empty-state" style={{ padding: "20px 0" }}>
                    <div className="empty-ico">🎯</div>
                    <div>No recommendations yet</div>
                    <div className="empty-sub">
                      Solve more problems to get personalised picks
                    </div>
                  </div>
                ) : (
                  <div>
                    {recommended.map((item, i) => {
                      const diff = item.problem.difficulty;
                      const diffCapitalised =
                        diff.charAt(0).toUpperCase() + diff.slice(1);
                      const t =
                        tagColors[diffCapitalised as keyof typeof tagColors] ??
                        tagColors["Medium"];
                      const reason =
                        item.confidence === "failed"
                          ? "Couldn't solve"
                          : item.confidence === "needs_revision"
                            ? "Needs revision"
                            : "Review due";
                      return (
                        <Link
                          key={item.id}
                          href={item.problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", display: "block" }}
                        >
                          <div
                            className="rec-row"
                            style={{ animationDelay: `${0.05 + i * 0.07}s` }}
                          >
                            <span
                              className="rec-tag"
                              style={{
                                background: t.bg,
                                color: t.text,
                                borderColor: t.border,
                              }}
                            >
                              {diffCapitalised}
                            </span>
                            <span className="rec-title">
                              {item.problem.title}
                            </span>
                            <span className="rec-reason">{reason}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sheets */}
            <div
              className="card"
              style={{
                animation:
                  "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both 0.20s",
              }}
            >
              <div className="card-hd">
                <span className="card-title">Your Sheets</span>
                <Link href="/sheets">
                  <button
                    className="view-all"
                    onClick={() => setActiveNav("sheets")}
                  >
                    View all →
                  </button>
                </Link>
              </div>
              {sheets.map((s, i) => {
                const pct = s.progress;
                const difficulty =
                  pct < 30 ? "Hard" : pct < 70 ? "Medium" : "Easy";
                const t = tagColors[difficulty];
                return (
                  <div
                    key={s.id}
                    className="sheet-row"
                    style={{ animationDelay: `${0.28 + i * 0.08}s` }}
                  >
                    <div className="sheet-top">
                      <div>
                        <div className="sheet-name">{s.title}</div>
                        <div className="sheet-count">
                          {s.solved} / {s.total} solved
                        </div>
                      </div>
                      <div className="pct-badge">{pct}%</div>
                    </div>
                    <div className="prog-bar">
                      <div
                        className="prog-fill"
                        style={{
                          width: `${pct}%`,
                          animationDelay: `${0.5 + i * 0.1}s`,
                        }}
                      />
                    </div>
                    <div className="sheet-next">
                      <span>Progress:</span>
                      <span className="next-prob">
                        {s.solved === 0
                          ? "Not started yet"
                          : `${s.total - s.solved} remaining`}
                      </span>
                      <span
                        className="tag"
                        style={{
                          background: t.bg,
                          color: t.text,
                          borderColor: t.border,
                        }}
                      >
                        {difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Submissions */}
            <div
              className="card"
              style={{
                animation:
                  "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both 0.27s",
              }}
            >
              <div className="card-hd">
                <span className="card-title">Recent Submissions</span>
                <Link href="/problems">
                  <button className="view-all">Solve More →</button>
                </Link>
              </div>
              {submissions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-ico">📭</div>
                  No submissions yet
                  <div className="empty-sub">
                    Solve your first problem to see it here
                  </div>
                </div>
              ) : (
                submissions.map((sub, i) => {
                  const t = tagColors[sub.difficulty as keyof typeof tagColors];
                  const accepted = sub.status === "Accepted";
                  return (
                    <div
                      key={sub.id}
                      className="sub-row"
                      style={{ animationDelay: `${0.3 + i * 0.07}s` }}
                    >
                      <div
                        className="sub-status-dot"
                        style={{
                          background: accepted ? "#34d399" : "#f87171",
                          boxShadow: `0 0 0 2px ${accepted ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                          animationDelay: `${0.35 + i * 0.07}s`,
                        }}
                      />
                      <div className="sub-info">
                        <div className="sub-problem">{sub.problem}</div>
                        <div className="sub-meta">{sub.sheet}</div>
                      </div>
                      <span
                        className="tag"
                        style={{
                          background: t.bg,
                          color: t.text,
                          borderColor: t.border,
                        }}
                      >
                        {sub.difficulty}
                      </span>
                      <div
                        className={`sub-status ${accepted ? "status-accepted" : "status-wrong"}`}
                      >
                        {accepted ? "✓ Accepted" : "✗ Wrong"}
                      </div>
                      <div className="sub-time">{sub.time}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="col-r">
            {/* Weak Section Card */}
            <WeakSectionCard sheets={sheets} />

            {/* Daily Tip */}
            <div className="tip-card">
              <div className="tip-label">✦ Daily Tip</div>
              <div
                className="tip-text"
                dangerouslySetInnerHTML={{ __html: tip.text }}
              />
            </div>

            {/* Quick Jump */}
            <div
              className="card"
              style={{
                animation: "popIn 0.45s cubic-bezier(0.22,1,0.36,1) both 0.44s",
              }}
            >
              <div className="card-hd">
                <span className="card-title">Quick Jump</span>
              </div>
              <div className="quick-grid">
                {[
                  {
                    icon: "📊",
                    label: "My Sheets",
                    nav: "sheets",
                    link: "/sheets",
                  },
                  {
                    icon: "📋",
                    label: "All Problems",
                    nav: "problems",
                    link: "/problems",
                  },
                  {
                    icon: "🎯",
                    label: "Interview Prep",
                    nav: "interview",
                    link: "/interview",
                  },
                  {
                    icon: "✏️",
                    label: "Revision List",
                    nav: "problems",
                    link: "/dashboard",
                  },
                  {
                    icon: "📈",
                    label: "Statistics",
                    nav: "dashboard",
                    link: "/dashboard",
                  },
                ].map(({ icon, label, nav, link }, i) => (
                  <div key={nav}>
                    <Link href={link}>
                      <button
                        key={label}
                        className="quick-btn"
                        style={{
                          animation: `popIn 0.4s cubic-bezier(0.22,1,0.36,1) both ${0.46 + i * 0.06}s`,
                        }}
                        onClick={() => setActiveNav(nav)}
                      >
                        <span className="quick-ico">{icon}</span> {label}
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
