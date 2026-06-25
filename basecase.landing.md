# BaseCase Landing Page — Production Build Prompt

## Project Context

Build a **production-grade, single-file Next.js landing page** (`app/page.tsx`) for **BaseCase** — a DSA learning and interview prep platform built on Next.js 16, Prisma/PostgreSQL, Redis session state, BullMQ async workers, Gemini + OpenAI AI providers, Sarvam TTS, and Judge0 code execution.

The page must feel **hand-crafted by a developer who cares**, not AI-generated. Use only **Shadcn UI**, **Tailwind CSS**, and **Framer Motion**. Zero external images — all visuals are div/SVG mockups.

---

## Design System

### Colors (use existing CSS variables from `globals.css`)

- Background: `hsl(var(--background))` → `#09090b`
- Card: `hsl(var(--card))` → `#18181b`
- Border: `hsl(var(--border))` → subtle zinc
- Primary: `hsl(var(--primary))` → white
- Muted: `hsl(var(--muted-foreground))` → zinc-400
- **Accent**: `orange-500` `#f97316` — used _sparingly_: badges, underlines, glow halos, icon backgrounds, active states only

### Typography

- Headings: `font-mono font-bold tracking-tight` — hero at `text-6xl md:text-7xl`, stepping down each section
- Body: `text-muted-foreground text-base leading-relaxed`
- Stats/code: `font-mono`
- **No gradient text** — gradients only on decorative shapes

### Spacing

- Sections: `py-24 md:py-32`
- Container: `max-w-6xl mx-auto px-4 sm:px-6`

### Framer Motion

```tsx
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};
// Stagger: transition={{ ...fadeUp.transition, delay: index * 0.08 }}
// Card hover: whileHover={{ y: -2 }}
// No bounce. No spring. No spin.
```

### Custom globals.css additions

```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

.hero-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

---

## Navbar

Sticky. On scroll: `backdrop-blur-md bg-background/80 border-b border-border` via `useEffect`.

```
[BaseCase logo]    [DSA Sheets] [Problems] [Roadmap] [Mock Interview]    [Sign In] [Get Started →]
```

- Logo: `Base<span className="text-orange-500">Case</span><span className="text-orange-500">.</span>` in `font-mono font-bold`
- Nav links: `text-sm text-muted-foreground hover:text-white transition-colors`
- Mobile: Shadcn `Sheet` + hamburger
- "Get Started": Shadcn `Button` size="sm" with `→` icon

---

## Section 1 — Hero

`min-h-[92vh]` flex col items-center justify-center. Apply `.hero-grid` background. Radial orange glow behind headline: `absolute w-96 h-32 bg-orange-500/10 blur-3xl rounded-full -z-10`.

**Top badge:**

```
🔥  Trusted by 1,000+ developers  →  See what's inside
```

Shadcn `Badge variant="outline"` with `border-orange-500/40 text-orange-400`.

**Headline:**

```
Stop grinding randomly.
Start learning with structure.
```

Line 1: white `text-6xl md:text-7xl font-mono font-bold tracking-tight`
Line 2: same — but "structure" gets a hand-drawn SVG orange underline:

```tsx
<span className="relative">
  structure
  <svg
    className="absolute -bottom-2 left-0 w-full"
    height="6"
    viewBox="0 0 200 6"
  >
    <path
      d="M0 4 Q50 0 100 3 Q150 6 200 2"
      stroke="#f97316"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
</span>
```

**Subheadline:**
"BaseCase gives you curated DSA sheets, SM-2 spaced repetition, AI voice mock interviews backed by Gemini, and radar analytics — everything to go from zero to offer."
`text-lg text-muted-foreground max-w-2xl mx-auto text-center mt-4`

**CTAs:**

- Primary: `Button size="lg"` white bg, black text — "Start Learning Free →"
- Secondary: `Button variant="outline" size="lg"` — "Browse DSA Sheets"

**Social proof:**
5 overlapping zinc avatar circles with initials + "Join 1,000+ engineers already on BaseCase" in `text-sm text-muted-foreground`

**Hero Visual — Floating Dashboard Mockup:**

`animate-float shadow-[0_0_80px_rgba(249,115,22,0.15)]` dark rounded-2xl card:

- Title bar: 3 traffic-light dots + "BaseCase — Striver's SDE Sheet" centered in `font-mono text-xs text-muted-foreground`
- Left mini-sidebar: 4 icon blocks `bg-zinc-800 rounded`
- Main panel:
  - Section header: "Arrays — Step 1 · 42 / 191 solved"
  - Shadcn `Progress value={22}` with orange fill override
  - 5 problem rows — each: colored status dot (green/yellow/gray) + problem name + difficulty `Badge` (Easy=green, Medium=yellow, Hard=red) + confidence tag (Confident/Shaky/—)
  - Problems: "Sort 0s, 1s & 2s", "Stock Buy & Sell", "Next Permutation", "Kadane's Algorithm", "Merge Overlapping Intervals"
- Row hover: `hover:bg-muted/40 transition-colors cursor-pointer`

---

## Section 2 — Stats Bar

`bg-card border-y border-border py-12`

4 stats in a horizontal row with `divide-x divide-border`:

| Number | Label                     |
| ------ | ------------------------- |
| 500+   | Problems                  |
| 1,000+ | Active Users              |
| 20+    | Mock Interviews Conducted |
| 10+    | Curated DSA Sheets        |

Numbers: `text-4xl font-bold font-mono text-white`. Labels: `text-sm text-muted-foreground mt-1`.

Count-up animation on scroll entry:

```tsx
function useCounter(target: number, inView: boolean, duration = 1400) {
  // useEffect + setInterval incrementing toward target when inView flips true
}
// trigger with framer-motion useInView
```

---

## Section 3 — Features Grid

**Header (centered):**

- `Badge`: "Platform Features"
- `H2`: "Everything you need to crack the interview"
- Subtext: "No more switching between 5 tabs."

**6-card grid** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16`

Each: Shadcn `Card p-6` with `hover:border-orange-500/30 transition-colors duration-300` and `whileHover={{ y: -2 }}`.

```
[orange icon in bg-orange-500/10 p-2.5 rounded-lg]
[Title — text-lg font-semibold mt-4]
[Description — text-sm text-muted-foreground mt-2 leading-relaxed]
```

Cards — tied to actual platform capabilities:

1. **Structured DSA Sheets** `<LayoutGrid />` — "Blind 75, NeetCode 150, Striver's SDE Sheet — topic-ordered, difficulty-ramped, and cross-linked to real problems."
2. **SM-2 Spaced Repetition** `<BrainCircuit />` — "The same algorithm powering Anki. Based on your confidence after each problem, BaseCase schedules exactly when to resurface it."
3. **AI Voice Mock Interviews** `<Mic />` — "Voice-first sessions powered by Gemini. Adaptive follow-ups, real-time Sarvam TTS responses, and a structured feedback report after every session."
4. **Radar Analytics** `<BarChart3 />` — "Visualize your topic-wise strengths and blind spots. Know where to focus before your next round — not after."
5. **AI-Generated Roadmaps** `<Map />` — "Describe your target company and timeline. BaseCase generates a personalized step-by-step roadmap with real problem checkpoints."
6. **Gemini-Powered Mentor** `<Bot />` — "Problem-scoped hints, complexity coaching, and debug help — backed by conversation history per problem via Redis, so context is never lost."

---

## Section 4 — How It Works

**Header (centered):**

- `Badge`: "Get Started"
- `H2`: "Go from zero to interview-ready in 3 steps"

**3-column layout** `grid grid-cols-1 md:grid-cols-3 gap-8 mt-16`. Desktop: dashed connector line `border-t-2 border-dashed border-border` absolutely positioned at step midpoint.

Each step:

- Decorative number: `text-8xl font-mono font-bold text-orange-500/15` (background)
- Orange Lucide icon
- `H3` bold title
- `p text-muted-foreground text-sm`

Steps — tied to actual user flow:

1. **Pick a Sheet** `<LayoutGrid />` — "Choose Blind 75, Striver's SDE Sheet, NeetCode 150, or use the Custom Sheet Builder to curate your own list."
2. **Track with Confidence Levels** `<CheckCircle />` — "Mark problems solved, rate your confidence, and add notes. The SM-2 engine builds your review schedule automatically."
3. **Run an AI Mock Interview** `<Mic />` — "Start a voice session — DSA, System Design, HR, or Behavioral. Gemini asks, adapts, and delivers your report when you're done."

---

## Section 5 — Sheet Preview ("See it in action")

**2-col layout** `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`

**Left — text:**

- `Badge`: "Live Preview"
- `H2`: "A smarter way to track your DSA progress"
- Body: "Every problem has a status, difficulty, confidence level, and personal notes. The SM-2 algorithm surfaces what to review next — so the patterns actually stick."
- 4 bullet points with `✓` in `text-orange-500`:
  - "500+ hand-curated problems across sheets"
  - "Confidence-rated spaced repetition scheduling"
  - "Topic-wise, difficulty, and status filtering"
  - "Persistent revision notes per problem"
- CTA: `Button` "Open a Sheet →"

**Right — Sheet mockup card:**
Dark `bg-card border border-border rounded-xl` card:

- Header: "Striver's SDE Sheet · 191 problems · 42 solved"
- `Progress value={22}` with orange fill
- Section label: "Arrays — Step 1"
- 5 rows (same as hero visual), each with: status icon + title + difficulty `Badge` + confidence tag (`Confident` in muted green, `Shaky` in muted yellow, `—`)
- Notes `<FileText />` icon at row end
- Row hover `hover:bg-muted/50 transition-colors`

---

## Section 6 — Mock Interview Feature Highlight

`bg-card border-y border-border` full-width band. **Reversed 2-col** (visual left, text right).

**Left — Interview-in-progress UI:**
Centered column:

- Animated pulse avatar: outer `animate-ping bg-orange-500/20 rounded-full absolute`, inner static circle with `<Bot />` icon
- "AI Interviewer" label `text-sm text-muted-foreground`
- Waveform: 7 divs of varying heights `bg-orange-500 rounded-full animate-pulse` with staggered `animation-delay`
- Status: `Badge` "● Recording..." with orange dot

**Right — text:**

- `Badge`: "Mock Interviews"
- `H2`: "Practice like it's the real thing"
- Body: "Powered by Gemini with Sarvam TTS voice output — our AI interviewer listens, adapts follow-ups to your answer, and delivers a structured report on confidence, depth, and technical accuracy."
- 4 bullets with Lucide icons:
  - `<Mic />` Voice-first, hands-free sessions
  - `<BrainCircuit />` Gemini-powered adaptive questioning
  - `<FileText />` Detailed post-session feedback report
  - `<TrendingUp />` Track score improvements over time
- Mode chips: `Badge variant="secondary"` — DSA · System Design · Technical · HR · Behavioral
- CTA: "Start a Mock Interview →"

---

## Section 7 — Roadmap Feature

**2-col** (text left, visual right).

**Left — text:**

- `Badge`: "Learning Roadmaps"
- `H2`: "Your personal path to the offer"
- Body: "Describe your target role and timeline. BaseCase's AI generates a step-by-step roadmap — or follow a community-built one. Every checkpoint links to real problems and tracks exactly where you are."
- 4 bullets:
  - Public and private roadmaps
  - AI-generated or community-built
  - Every step links to real problems
  - Credit-based generation with instant output
- CTA: "Generate My Roadmap →"

**Right — Roadmap timeline card:**
Dark card, vertical layout. 4 nodes connected by dashed `border-l-2 border-dashed border-border ml-3`.

Each node: filled orange circle (complete) or empty gray circle (upcoming) + label + % badge:

- "Arrays Fundamentals · 100%" — orange filled dot
- "Binary Search · 60%" — orange partial ring
- "Dynamic Programming · 0%" — gray empty
- "Graph Theory · 0%" — gray empty

Animate line drawing: Framer Motion `scaleY` from 0→1 `transformOrigin: "top"` on scroll entry.

---

## Section 8 — Testimonials

**Header (centered):**

- `Badge`: "Community"
- `H2`: "Developers who made the switch"
- Subtext: "Real feedback from engineers who prepped on BaseCase."

**3-card grid** `grid grid-cols-1 md:grid-cols-3 gap-6 mt-12`

Each: Shadcn `Card p-6` with `whileHover={{ y: -2 }}`:

- `★★★★★` in `text-orange-500`
- Bold headline quote in `font-semibold`
- Body quote in italic `text-muted-foreground text-sm leading-relaxed`
- Footer: avatar circle (initials, `bg-orange-500/15 text-orange-400`) + name + role

Testimonials:

1. **"The spaced repetition actually works."** — "I was doing random LeetCode for 4 months and retaining nothing. Three weeks on BaseCase with SM-2 and I can actually recall patterns mid-interview. Flipkart call came in last week." — _Rohan M., SDE Intern_

2. **"The mock interview feedback is brutally honest."** — "My first session score was rough. The report broke down exactly where I lost points on depth and follow-ups. Two weeks later I cleared the Razorpay technical round." — _Priya S., Final Year CSE_

3. **"Finally a platform that doesn't overwhelm you."** — "The AI roadmap feature got me. I gave it my target company and timeline, it generated a full plan with checkpoints. Felt like having a senior guiding me." — _Arjun K., Backend Engineer_

---

## Section 9 — Pricing

**Header (centered):**

- `Badge`: "Pricing"
- `H2`: "Simple, honest pricing"
- Subtext: "Start free. Upgrade when you're ready."

**2-card layout** `max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6`

**Free card** — standard `Card border-border`:

- Title: "Free" | Price: `₹0 / forever` in `font-mono text-3xl font-bold`
- Features with `✓` checkmarks:
  - Access to all DSA sheets
  - Problem tracking and confidence notes
  - Basic analytics dashboard
  - Community roadmaps
  - 3 AI mock interview sessions / month
- CTA: `Button variant="outline"` "Get Started Free"

**Pro card** — `border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.10)]`:

- "Most Popular" `Badge` top-right in orange
- Title: "Pro" | Price: `₹299` with strikethrough `₹599` + `/ month`
- Features with orange `✓`:
  - Everything in Free
  - Unlimited mock interviews
  - Full AI feedback reports with scoring breakdown
  - Company-specific question patterns
  - Priority SM-2 recommendations
  - Radar analytics with topic heatmaps
- CTA: `Button` "Upgrade to Pro"

---

## Section 10 — FAQ

`H2`: "Frequently asked questions" — centered `max-w-2xl mx-auto`

Shadcn `Accordion type="single" collapsible`:

1. **Is BaseCase free?** — Yes. All DSA sheets, problem tracking, and 3 mock interviews/month are completely free.
2. **How is this different from LeetCode?** — LeetCode is a judge. BaseCase is a learning system with structure, spaced repetition, and AI interview practice — not just a problem list.
3. **What is SM-2 spaced repetition?** — The algorithm behind Anki. Based on your confidence rating after each problem, we schedule the next review to maximize long-term retention.
4. **How does the AI mock interview actually work?** — You join a voice session. Gemini asks a question via Sarvam TTS, listens to your response, asks adaptive follow-ups, then generates a structured feedback report at the end.
5. **Can I build my own problem sheet?** — Yes. The Custom Sheet Builder lets you create, reorder, tag, and optionally publish your own curated lists.
6. **Is there a mobile app?** — A React Native companion app is in development — quiz engine, roadmap tracking, and community features coming soon.

---

## Section 11 — Final CTA Banner

`background: radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 70%)`

Centered:

- `H2`: "Ready to stop grinding randomly?" — `font-mono font-bold text-5xl md:text-6xl tracking-tight`
- Subtext: "Join 1,000+ engineers who prep smarter with BaseCase."
- `Button size="lg"` "Start for Free →" + `Button variant="outline" size="lg"` "Browse Sheets"

---

## Footer

`grid grid-cols-2 md:grid-cols-4 gap-8`

- **Col 1 — Brand**: Logo + "DSA learning and interview prep for engineers who want structure, not noise." + GitHub / X / LinkedIn Lucide icons
- **Col 2 — Product**: DSA Sheets, Problems, Roadmaps, Mock Interviews, Analytics
- **Col 3 — Resources**: Blog, Changelog, GitHub, Documentation
- **Col 4 — Company**: About, Contact, Privacy Policy, Terms

Bottom bar `border-t border-border mt-8 pt-6 flex justify-between text-xs text-muted-foreground`:

- "© 2026 BaseCase. Built for engineers, by engineers."
- "Made with ♥ in India"

---

## Shadcn Components to Import

```
Badge, Button, Card, CardContent, CardHeader, CardTitle,
Progress, Accordion, AccordionItem, AccordionTrigger, AccordionContent,
Sheet, SheetContent, SheetTrigger
```

---

## Anti-Patterns — Hard No

- ❌ Purple/blue gradient text
- ❌ Glassmorphism blur cards everywhere
- ❌ Generic "rocket to success" copy
- ❌ All sections in the same 3-col icon grid layout
- ❌ `animate-bounce` on anything
- ❌ Stock-illustration-style mockups
- ❌ Rainbow gradient borders
- ✅ Vary layouts per section (centered → 2-col → reversed 2-col → full-width band)

---

## In-Depth Landing Page Description (Product + UX)

This landing page is designed as a **guided conversion journey**, not a static marketing page. Every section has one job: reduce uncertainty, prove product depth, and move users from curiosity to activation.

### 1) Core Narrative Arc

The story progresses in this order:

1. **Pain articulation**: "Stop grinding randomly." (emotional hook)
2. **System promise**: "Start learning with structure." (clear value proposition)
3. **Proof of substance**: realistic product mockups, concrete features, real workflows
4. **Proof of outcomes**: stats, testimonials, structured process, roadmap visibility
5. **Risk reduction**: transparent pricing and FAQ
6. **Action lock-in**: repeated, high-clarity CTAs with minimal friction

This sequence intentionally mirrors a candidate's interview prep mindset: confusion -> evaluation -> trust -> commitment.

### 2) Experience Strategy by Section

#### Navbar

- Acts as an always-available control layer with sticky behavior.
- Includes anchor navigation for fast scanning and deep-linking into sections.
- Adds utility interactions:
  - **Command palette** (`Ctrl/Cmd + K`) for power-user navigation.
  - **Announcement bar** with dismissal persistence (`localStorage`) so repeat visitors are not annoyed.
  - **Auth-aware actions**: if logged in, user sees clear **Log out** action; if logged out, sees **Sign In / Get Started**.

#### Hero

- Uses short, strong copy to identify the user's current pain.
- Supports it with a rotating typewriter subline to communicate breadth without overwhelming text.
- Dual CTA model:
  - Primary: immediate account creation.
  - Secondary: browse sheets before committing.
- Social proof (user count + avatars) lowers first-click hesitation.
- Floating dashboard mockup demonstrates product seriousness with realistic UI density.

#### Stats + Difficulty Distribution

- Stats answer "Is this real and active?"
- Difficulty bars answer "Is the content balanced and credible?"
- Together they establish the platform as both active and academically structured.

#### Features Grid

- Converts abstract claims into **capabilities mapped to known tools/workflows**:
  - Sheets, SM-2, AI interviews, analytics, roadmaps, mentor context.
- Copy is implementation-aware, which increases technical trust for developer audiences.

#### How It Works

- Reduces cognitive load by compressing onboarding into 3 actionable steps.
- The linear visual connector reinforces progression and completion psychology.

#### Sheet Preview + Interview + Roadmap

- These three sections represent the platform's high-value loop:
  1. Practice (Sheet)
  2. Simulate (Interview)
  3. Plan (Roadmap)
- Each section pairs **benefit copy** with a **UI artifact**, ensuring claims are visibly grounded in product behavior.

#### Built in Public + Live Feed

- "Built in public" section creates transparency and founder credibility.
- Recently solved feed introduces ambient activity cues, making the page feel alive.
- Both are trust multipliers that work without heavy copy.

#### Pricing + FAQ + Final CTA

- Pricing removes ambiguity with direct feature boundaries.
- FAQ resolves predictable objections.
- Final CTA repeats the value promise with high-contrast buttons and minimal distraction.

### 3) Conversion Mechanics Embedded in the UI

- **Multiple CTA surfaces** across scroll depth:
  - Hero CTA
  - Mid-page action buttons (sheets, interviews, roadmaps)
  - Mobile fixed CTA bar
  - Final CTA banner
- **Auth-state adaptation** avoids showing irrelevant actions and reduces friction.
- **Active section indicator** in navbar helps orientation on long-scroll pages.
- **High-contrast button styling** ensures action visibility even under dark theme conditions.

### 4) Interaction Design Principles

- Motion is intentional and restrained:
  - fade-up reveals for hierarchy
  - subtle hover lift for affordance
  - no attention-breaking spring/bounce gimmicks
- Visual rhythm alternates layouts (centered, 2-col, reversed, banded) to avoid template fatigue.
- Accent orange is used as a semantic signal (status, action, progress), not decorative noise.

### 5) Accessibility and Readability Expectations

- Maintain strong contrast for all actionable controls, especially outline buttons on dark backgrounds.
- Ensure every icon-only control has an accessible label.
- Keep primary headings concise and scannable.
- Preserve touch-friendly sizing on mobile fixed CTA controls.
- Avoid motion that blocks comprehension; all animations should be non-essential and interrupt-safe.

### 6) Technical Composition Map

The landing is modularized into dedicated components, each with a clear responsibility:

- `LandingNav`: sticky nav, announcement, command palette, auth actions, section tracking
- `HeroSection`: headline hook, typewriter message, primary conversion CTA, product mockup
- `TickerSection` + `DifficultyDistribution`: credibility and dataset framing
- `ProblemsSection`: capability overview
- `TagsBanner`: ambient topic coverage marquee
- `SheetsSection` + `EditorSection`: workflow onboarding + product preview
- `GamificationSection`: AI interview simulation value
- `ActivitySection`: roadmap planning and progress visualization
- `BuiltInPublicSection`: transparency and repo trust signal
- `CTASection`: social proof, pricing clarity, FAQ, final conversion push
- `RecentlySolvedFeed`: live social activity cue
- `MobileBottomCTA`: persistent mobile conversion bar

This modular architecture allows iterative UX improvements without rewriting the whole page.

### 7) SEO and Metadata Intent

The landing metadata should consistently communicate:

- **What it is**: structured DSA learning + AI interview prep
- **Who it is for**: interview-focused engineers/students
- **Why now**: avoid random prep, follow a retention-driven system

Open Graph and Twitter metadata should reflect the same positioning language as the hero to keep ad/social previews message-aligned.

### 8) Quality Bar for Final Iteration

A release-ready landing should satisfy all of the following:

- All primary/secondary buttons are clearly visible in both default and hover states.
- Auth actions are correct for logged-in and logged-out users.
- No fake or misleading social metrics (for example, fabricated star counts).
- Section anchors, keyboard navigation, and scroll-state cues work predictably.
- Mobile bottom CTA does not overlap content and remains readable.
- No client/server boundary errors (`"use client"` where hooks are used).
- Diagnostics pass cleanly on all touched components.

When these are true, the page is not just visually polished; it is product-trustworthy and conversion-ready.

- ✅ Copy uses real product names: Gemini, Sarvam TTS, SM-2, Judge0, BullMQ
- ✅ Orange accent only on meaningful elements — not dumped everywhere
- ✅ Hero mockup looks like actual BaseCase product UI, not a generic "app screenshot"
- ✅ Every AI feature tied to the real tech: Gemini = mentor + interview turns, OpenAI Agents = planning + analysis, Sarvam = voice output
