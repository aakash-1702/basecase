# BaseCase v2 — Feature Roadmap

This document outlines the full phased roadmap for BaseCase v2, including what needs to be built, what is required technically, and who gets access (Free or Plus).

---

## Tier Legend

| Symbol | Meaning |
|--------|---------|
| 🟢 Free | Available to all users |
| 🔵 Plus | Available to Plus subscribers only |
| 🔄 Upgrade | Was limited in v1, expanded in v2 |

---

## Phase 1 — Retention Foundation
> Goal: Give free users a reason to come back every day. Ship before any Plus features.

---

### 1.1 Daily Streak Engine 🟢 Free

**What it does:**
Tracks consecutive days a user solves at least one problem. Resets at midnight (timezone-aware). Shows current streak and longest streak on dashboard.

**What you need to build:**
- `streakCount` and `lastActiveDate` fields on the `User` model (Prisma migration)
- A streak update function that runs on every problem solve (`PATCH /api/problems/:id/progress`)
- Timezone-safe date comparison logic (store dates in UTC, convert per user timezone)
- Streak display component on dashboard and profile

**Schema changes:**
```prisma
model User {
  streakCount     Int       @default(0)
  longestStreak   Int       @default(0)
  lastActiveDate  DateTime?
}
```

---

### 1.2 Problem of the Day (POTD) 🟢 Free

**What it does:**
One featured problem surfaces daily on the homepage and dashboard. Solving it counts toward streak. An archive lets users see past POTDs.

**What you need to build:**
- `ProblemOfTheDay` model with `date` and `problemId` fields
- A seeding script or cron job to assign POTDs in advance
- `GET /api/potd` route that returns today's problem
- POTD banner component on dashboard
- Archive page: `GET /api/potd/archive`

**Schema changes:**
```prisma
model ProblemOfTheDay {
  id        String   @id @default(cuid())
  date      DateTime @unique
  problemId String
  problem   Problem  @relation(fields: [problemId], references: [id])
}
```

---

### 1.3 Markdown Notes 🟢 Free (Upgrade from v1)

**What it does:**
Users can write notes per problem in Markdown with live preview. Previously notes were plain text.

**What you need to build:**
- Swap the notes textarea for a split-pane Markdown editor (use `react-markdown` + `@uiw/react-md-editor`)
- Notes are already stored in `UserProblem.notes` — no schema change needed
- Add a rendered view mode for reading saved notes

**Dependencies:**
```bash
npm install @uiw/react-md-editor react-markdown
```

---

### 1.4 Bookmarks / Revisit Later 🟢 Free

**What it does:**
A lightweight flag separate from `solved`. Users can bookmark problems to come back to without marking them solved.

**What you need to build:**
- `bookmarked` boolean field on `UserProblem`
- Bookmark toggle button on problem rows
- Filtered view: `GET /api/problems?status=bookmarked`

**Schema changes:**
```prisma
model UserProblem {
  bookmarked Boolean @default(false)
}
```

---

## Phase 2 — Intelligence Layer (AI Features)
> Goal: Ship the primary Plus value proposition. Your Gemini API key is already wired in.

---

### 2.1 AI Hint System 🔵 Plus

**What it does:**
Per-problem tiered hints powered by Gemini. Three levels: nudge (what to think about), approach (which algorithm/pattern), partial walkthrough (no full code). Users unlock one level at a time.

**What you need to build:**
- `POST /api/problems/:id/hint` route
- Prompt engineering: pass problem title, difficulty, tags, and hint level to Gemini
- Hint level state stored client-side (not persisted — resets per session)
- Hint UI component with "unlock next hint" flow
- Plus gate: middleware check on the route

**Gemini prompt structure:**
```
You are a DSA tutor. The problem is: {title} ({difficulty}).
Tags: {tags}. 
Give a Level {1|2|3} hint only. 
Level 1 = conceptual nudge only. Level 2 = algorithm/pattern name + why. Level 3 = step-by-step approach, no code.
Do not reveal the full solution.
```

---

### 2.2 AI Code Review 🔵 Plus

**What it does:**
User pastes their solution. Gemini reviews time/space complexity, identifies bugs, suggests improvements. No code execution required.

**What you need to build:**
- Code input textarea on the problem page (with language selector)
- `POST /api/problems/:id/review` route — sends code + problem context to Gemini
- Structured response rendering: complexity badge, issues list, suggestions
- Rate limit: 5 reviews per day per Plus user (store count in Redis or DB)

**Schema changes (optional, for rate limiting):**
```prisma
model UserDailyUsage {
  id           String   @id @default(cuid())
  userId       String
  date         DateTime
  codeReviews  Int      @default(0)
  aiHints      Int      @default(0)
  user         User     @relation(fields: [userId], references: [id])
  @@unique([userId, date])
}
```

---

### 2.3 AI Editorial Explainer 🔵 Plus

**What it does:**
For problems that have an editorial or approach note stored, users can ask Gemini follow-up questions: "Why is a monotonic stack used here?" or "What if the array has duplicates?"

**What you need to build:**
- Optional `editorial` field on `Problem` model
- Conversational chat UI on the problem detail page (message history in component state)
- `POST /api/problems/:id/explain` route — passes editorial + conversation history to Gemini
- Session-scoped conversation (no DB persistence needed)

---

## Phase 3 — Analytics & Visualization
> Goal: Make progress feel real and motivating. Mix of free and Plus.

---

### 3.1 30-Day Activity Heatmap 🟢 Free

**What it does:**
A GitHub-style heatmap showing the last 30 days of solve activity. Color intensity = number of problems solved that day.

**What you need to build:**
- Aggregate query: group `UserProblem.solvedAt` by day for last 30 days
- `GET /api/analytics/heatmap?range=30` route
- Heatmap grid component (can use `react-activity-calendar` or build with CSS grid)

---

### 3.2 Full Year Heatmap 🔵 Plus

**What it does:**
Same as above but shows the full trailing 365 days. Plus users get the long-view of their consistency.

**What you need to build:**
- Same route, add `range=365` support
- Plus gate on the frontend: show 30-day free, prompt upgrade for full year

---

### 3.3 Topic Weakness Radar Chart 🔵 Plus

**What it does:**
A radar/spider chart showing solve rate by topic (Arrays, DP, Trees, Graphs, etc.). Makes it obvious which areas need work.

**What you need to build:**
- Aggregate query: solved/total per tag or sheet
- `GET /api/analytics/topics` route
- Radar chart component using `recharts` (already available in most Next.js setups)

---

### 3.4 Consistency Score 🔵 Plus

**What it does:**
A single numerical score (0–100) representing overall consistency — combines streak, solve frequency, topic breadth, and revisit rate.

**What you need to build:**
- Scoring algorithm (define weights for each factor)
- Computed on `GET /api/dashboard` for Plus users
- Score display card with breakdown tooltip

---

## Phase 4 — Structured Learning Features
> Goal: Deepen the learning workflow beyond just marking problems solved.

---

### 4.1 Spaced Repetition Queue 🔵 Plus

**What it does:**
Problems resurface for revision based on when they were solved and the user's confidence rating. Low-confidence or long-unseen problems appear first. Daily revision queue of 5–10 problems.

**What you need to build:**
- Interval calculation function using SM-2 algorithm (or a simpler custom version):
  - `confident` → resurface in 7 days
  - `neutral` → resurface in 3 days  
  - `shaky` → resurface tomorrow
- `nextReviewDate` field on `UserProblem`
- `GET /api/revision/queue` route — returns today's due problems
- Revision queue UI on dashboard (distinct from POTD)

**Schema changes:**
```prisma
model UserProblem {
  nextReviewDate DateTime?
  reviewInterval Int       @default(1)
}
```

---

### 4.2 Mock Interview Mode 🔵 Plus

**What it does:**
Timed problem session — user picks a sheet/topic and duration (30/45/60 min). No hints, no notes visible. Timer counts down. At the end, a summary shows time taken and which problems were attempted vs skipped.

**What you need to build:**
- `MockSession` model to store session config and results
- Session UI: fullscreen mode, countdown timer, problem navigation
- `POST /api/mock/start`, `PATCH /api/mock/:id/submit`, `GET /api/mock/:id/result` routes
- Session summary page with time breakdown

**Schema changes:**
```prisma
model MockSession {
  id          String   @id @default(cuid())
  userId      String
  sheetId     String?
  duration    Int      // minutes
  startedAt   DateTime
  completedAt DateTime?
  results     Json     // { problemId, attempted, timeSpent }[]
  user        User     @relation(fields: [userId], references: [id])
}
```

---

### 4.3 Custom Sheet Builder 🔵 Plus

**What it does:**
Plus users can create their own problem sheets — pick any problems from the platform, set order, add a title and description. Can share via a public link (anyone can view, only Plus can create).

**What you need to build:**
- `isCustom` and `createdBy` fields on `Sheet` model
- Sheet builder UI: search/filter problems, drag-to-reorder
- `POST /api/sheets` already exists — add custom sheet support
- Public share URL: `GET /api/sheets/:sheetId/public` (no auth required, read-only)
- Plus gate: only Plus users can create; anyone can view shared link

---

## Phase 5 — Social & Profile
> Goal: Make learning public and competitive. Mostly free.

---

### 5.1 Public Profile Page 🟢 Free

**What it does:**
A shareable profile URL (`/u/username`) showing: problems solved, current streak, sheets completed, and the 30-day heatmap.

**What you need to build:**
- `username` field on `User` (unique, user-set at signup or in settings)
- `GET /api/users/:username/public` route — returns only public-safe data
- Profile page at `/u/[username]`

---

### 5.2 Progress Export 🔵 Plus

**What it does:**
Export all solved problems, notes, confidence ratings, and dates as a CSV or JSON file.

**What you need to build:**
- `GET /api/export` route — streams a CSV response
- Export button in user settings
- No schema changes needed

---

## Summary Table

| Feature | Tier | Phase |
|---|---|---|
| Daily Streak Engine | 🟢 Free | 1 |
| Problem of the Day | 🟢 Free | 1 |
| Markdown Notes | 🟢 Free | 1 |
| Bookmarks / Revisit Later | 🟢 Free | 1 |
| AI Hint System | 🔵 Plus | 2 |
| AI Code Review | 🔵 Plus | 2 |
| AI Editorial Explainer | 🔵 Plus | 2 |
| 30-Day Heatmap | 🟢 Free | 3 |
| Full Year Heatmap | 🔵 Plus | 3 |
| Topic Weakness Radar | 🔵 Plus | 3 |
| Consistency Score | 🔵 Plus | 3 |
| Spaced Repetition Queue | 🔵 Plus | 4 |
| Mock Interview Mode | 🔵 Plus | 4 |
| Custom Sheet Builder | 🔵 Plus | 4 |
| Public Profile Page | 🟢 Free | 5 |
| Progress Export | 🔵 Plus | 5 |

---

## Recommended Build Order

```
Phase 1 (Streak + POTD + Markdown Notes + Bookmarks)
    ↓
Phase 2 (AI Hints → AI Code Review → AI Explainer)
    ↓
Phase 3 (Heatmaps → Radar Chart → Consistency Score)
    ↓
Phase 4 (Spaced Repetition → Mock Interview → Custom Sheets)
    ↓
Phase 5 (Public Profile → Export)
```

Start with Phase 1 entirely on free — it builds retention before monetization. Phase 2 is your Plus launch milestone. Everything after is iterative.

---

## Plus Paywall Strategy

Do not hard-block Plus features with an error. Instead:
- Show a greyed-out or blurred version of the feature
- Add a clear upgrade prompt inline
- Let free users see what they're missing (radar chart preview, locked hint button, etc.)

This drives conversion better than hiding features entirely.