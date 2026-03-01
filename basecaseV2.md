# BaseCase v2 — Feature Implementation Guide

> Concept-first, text-based breakdown of how to build each feature.
> No copy-paste code — just clear thinking so you understand what you're building and can explain it in interviews.

---

## Table of Contents

1. [Spaced Repetition Queue](#1-spaced-repetition-queue)
2. [Mock Interview Mode](#2-mock-interview-mode)
3. [AI Code Review](#3-ai-code-review)
4. [Topic Weakness Radar Chart](#4-topic-weakness-radar-chart)
5. [Custom Sheet Builder](#5-custom-sheet-builder)

---

---

# 1. Spaced Repetition Queue

> **Why it's impressive:** You're implementing an actual algorithm with stateful per-user progression, not just storing data. It shows you can model a learning system, not just CRUD.

---

## The Core Idea

Spaced repetition is about showing a user a problem again *just before they would forget it*. The more confident they are, the longer you wait before showing it again. The system tracks, for each solved problem, when it should next be reviewed.

Think of it like this: if you solved a problem and felt HIGH confidence, you probably don't need to see it for another 2 weeks. If you felt LOW confidence, you need to see it tomorrow.

---

## The Algorithm — SM-2 Simplified

You don't need to implement the full academic SM-2 formula. A simplified version works perfectly for a college project and is easier to explain.

The idea is simple: each problem has a **review interval** in days. When the user finishes a review session and rates their confidence, you apply a multiplier to that interval:

- **HIGH confidence** → multiply the current interval by 2.5 (minimum 7 days)
- **MEDIUM confidence** → multiply the current interval by 1.5 (minimum 3 days)
- **LOW confidence** → reset interval to 1 day (they need to re-study tomorrow)

The new review date is simply `today + new interval`.

When the user first solves a problem, set the interval to 1 and `nextReviewDate` to tomorrow. From then on, the interval grows based on their confidence.

---

## What You Need to Add to the Database

Two new fields on your `UserProblem` model:

- `nextReviewDate` — a nullable DateTime. If null, the problem has never been reviewed and is always eligible.
- `reviewInterval` — an integer, defaults to 1. Tracks the current interval in days.

That's it. No new tables needed.

---

## The Queue Logic (How to Query Due Problems)

A problem is "due for review" if:
- It is marked as solved, AND
- Its `nextReviewDate` is today or in the past (or null — never reviewed)

Sort the results by most overdue first (oldest `nextReviewDate` at the top), then by lowest confidence second. Cap the result at 10 problems so the user isn't overwhelmed.

The endpoint should be `GET /api/revision/queue`. It returns today's due problems for the logged-in user.

---

## The Review Endpoint

When a user finishes reviewing a problem and rates their confidence, call `PATCH /api/problems/:slug/review` with the confidence value.

This endpoint should:
1. Fetch the current `reviewInterval` for that user+problem pair
2. Apply the multiplier based on confidence to compute `nextInterval`
3. Set `nextReviewDate = today + nextInterval`
4. Save both `nextReviewDate` and `reviewInterval` back to the database
5. Also update `confidenceV2` so the confidence shown on the sheet page stays in sync

---

## Where to Trigger It

The review update should happen when a user updates their confidence on the problem page and hits "Save Progress". You already have a save endpoint — just extend it to also call the interval recalculation logic whenever `confidenceV2` changes.

---

## The UI

Keep it simple. A "Revision Queue" card on the dashboard that shows:
- How many problems are due today
- A list with problem title, difficulty, and how many days overdue it is
- A link to each problem page

After the user visits the problem, updates their confidence, and saves — the interval recalculates automatically and the problem disappears from tomorrow's queue.

---

## What to Say in an Interview

> "I implemented a spaced repetition system using a simplified SM-2 algorithm. Each solved problem has a review interval. When confidence is low, the interval resets to 1 day. For medium and high, I apply a 1.5× and 2.5× multiplier respectively. The queue endpoint filters for `nextReviewDate <= today`, orders by most overdue first, and caps at 10. The key design detail is normalizing dates to midnight UTC before comparison, so timezone differences don't cause a problem to become due at 11pm for some users."

---

---

# 2. Mock Interview Mode

> **Why it's impressive:** You're modeling a session lifecycle with a start state, an active state, and a terminal state. It mirrors real-world systems like checkout flows, exam sessions, or booking workflows.

---

## The Core Idea

The user picks a sheet and a time limit (30, 45, or 60 minutes). The app locks them into a focused mode — no hints, no notes visible, no editorial. A countdown timer runs. When time is up (or they submit early), the session closes and they see a summary of what they attempted vs. skipped.

---

## The Session Lifecycle

A session has three states: `active`, `completed`, and `abandoned`.

- **active** — created when the user hits "Start Session". Timer is running.
- **completed** — set when the user submits or the timer expires.
- **abandoned** — optional: if they navigate away and come back after time has expired without submitting.

The important design decision is: **the timer is computed from `startedAt`, not from the client.** This means if the user refreshes the page, the timer resumes correctly. The frontend computes `remainingSeconds = (startedAt + duration) - now()` on every render.

---

## What You Need in the Database

A new `MockSession` model with these fields:

- `userId` — who started it
- `sheetId` — which sheet they're practicing (optional, could be a topic filter)
- `duration` — the chosen time limit in minutes
- `startedAt` — when the session was created (defaults to now)
- `completedAt` — when it ended (null if still active)
- `status` — "active" | "completed" | "abandoned"
- `results` — a JSON array storing per-problem data (more on this below)

The `results` field stores an array of objects, one per problem, each containing: the problem ID, title, difficulty, whether it was `attempted`, whether it was `skipped`, and how many seconds were spent on it.

---

## The Three API Endpoints

**POST `/api/mock/start`**
Creates a new session. Before creating, check if the user already has an active session (return a 409 if so — you don't want concurrent sessions). Pre-populate the `results` JSON with all problems from the selected sheet, all marked as not attempted and not skipped.

**PATCH `/api/mock/:id/submit`**
Called when the user finishes. Updates `status` to "completed", sets `completedAt` to now, and writes the final `results` array (which the client has been tracking in state).

**GET `/api/mock/:id/result`**
Returns the session with computed summary stats: how many problems were attempted, skipped, not reached, total time taken, and average time per attempted problem.

---

## How the Timer Works

The client should never store the timer in component state using a countdown from an arbitrary number. Instead:

1. On session start, the server returns `startedAt` and `duration`
2. The client computes the end time: `endTime = startedAt + durationInMs`
3. Every second, the client recomputes `remaining = endTime - Date.now()`
4. If `remaining <= 0`, auto-submit

This makes the timer refresh-safe and prevents cheating via clock manipulation.

---

## How Problem Tracking Works

The client holds the `results` array in React state. When the user navigates to a problem, start a timer (just `Date.now()` stored in a ref). When they move to the next problem, compute elapsed time and add it to that problem's `timeSpentSeconds`. When they mark a problem as "attempted" or "skip", update the relevant booleans in state.

On submit, send the entire final `results` array to the server. The server is the source of truth only at session boundaries (start and submit) — everything in between lives in client state.

---

## The Results Page

After submit, show:
- Total session duration
- How many problems attempted vs. skipped vs. not reached
- Average time per attempted problem
- A table of all problems with their status and time spent

This is a great demo moment — it looks professional and tells a story.

---

## What to Say in an Interview

> "Mock Interview Mode has a proper session lifecycle with three states. The most interesting design decision was making the countdown timer server-anchored — it's computed from `startedAt`, not the client clock. So refreshing the page doesn't reset the timer. I also prevent concurrent sessions with a check on session start. Per-problem time tracking lives in client state during the session — the server only persists the final result on submit. This avoids unnecessary API calls every time the user clicks 'next problem'."

---

---

# 3. AI Code Review

> **Why it's impressive:** It's not just "call Gemini". The impressive part is structured output parsing, rate limiting, and usage tracking — which show you're thinking about production systems.

---

## The Core Idea

The user pastes their code and selects a language. You send it to Gemini along with the problem context. The AI returns a structured review — not a wall of text, but a typed response with complexity analysis, a list of issues, and suggestions. You render this as a proper UI with severity indicators.

---

## Why Structured Output Matters

The naive approach is to just dump the AI's response as text on screen. The impressive approach is to instruct the model to return JSON with a defined schema — `timeComplexity`, `spaceComplexity`, `issues` (an array with severity levels), `improvements`, `overallVerdict` — and then render each field as a distinct UI component.

This shows you understand that LLMs are just APIs, and good API design means having a contract with the response format.

Always strip markdown code fences from the Gemini response before `JSON.parse()`, because even with explicit instructions, the model sometimes wraps output in triple backticks.

---

## Rate Limiting — The Right Way

Create a `UserDailyUsage` table with a composite unique key of `[userId, date]`. Each row tracks how many code reviews (and AI hints) a user has used on a given calendar day.

When the endpoint is hit:
1. Upsert a row for `[userId, today]` — create it with zero counts if it doesn't exist
2. Read the current count for `codeReviews`
3. If it's at the limit (e.g., 5), return a 429 with a clear message
4. Otherwise, increment the count and proceed

Normalizing `date` to midnight UTC is important — otherwise `2025-01-01T23:59:00` and `2025-01-02T00:01:00` might incorrectly count as the same day for some users.

---

## Prompt Engineering

The quality of the prompt determines the quality of the review. Key things to include in the prompt:

- The problem title, difficulty, and tags (so the AI knows what a "correct" solution looks like)
- The user's code, labeled with their chosen language
- An explicit instruction to return only JSON, with no explanation outside it
- The exact JSON schema you expect, with field names, types, and constraints
- A rule like "do not reveal the full solution even if the code is incorrect" — otherwise the AI might just give them the answer

Temperature should be low (around 0.2) for consistent structured output.

---

## What to Say in an Interview

> "The code review feature has three things I'd highlight. First, I use a structured JSON prompt with an explicit schema, so I can always parse the response and render it as a typed UI — not raw text. Second, I have a `UserDailyUsage` table with a composite unique key on `[userId, date]` for rate limiting — this is a single upsert + increment, which handles race conditions cleanly. Third, I strip markdown fences from the Gemini response before parsing, because the model doesn't always respect the 'return only JSON' instruction even at low temperature."

---

---

# 4. Topic Weakness Radar Chart

> **Why it's impressive:** It requires aggregation queries, computed ratios, and data visualization. Recruiters can see the value immediately in a screenshot.

---

## The Core Idea

For each topic tag (Arrays, DP, Trees, etc.), compute what percentage of problems in that category the user has solved. Render this as a radar/spider chart. Instantly shows the user their weak spots.

---

## The Data You Need

You need two things per tag:
- **Total problems** with that tag on the platform
- **Solved problems** with that tag for the current user

The solve rate for each tag is `solved / total * 100`.

---

## How to Compute It

The cleanest approach for a moderate dataset:

1. Fetch all problems with their tags
2. Fetch all `UserProblem` records where `userId = currentUser` and `solved = true`
3. Build a set of solved problem IDs
4. Loop through every problem's tags, incrementing a `total` and `solved` counter per tag
5. Compute solve rate, sort by total problems descending, take the top 8

The reason you take only 8 tags is that radar charts look bad with too many axes — 6 to 8 is the visual sweet spot.

For large datasets, you'd do this with a raw SQL aggregation using `UNNEST` on the tags array and `GROUP BY tag`. Worth mentioning in an interview even if you don't implement it — it shows you're aware of the scaling concern.

---

## The Chart

Use `recharts` — it ships with a `RadarChart` component. The data format it expects is just an array of objects with a `tag` field and a `solveRate` number.

Style it to match your dark theme: dark background, orange stroke color, very low fill opacity so the axes remain visible.

---

## The Weakness Callout

Below the chart, add a simple callout: "Your weakest area is **Dynamic Programming** — only 23% solved." This is derived by just sorting the data by `solveRate` ascending and taking the first item. It makes the chart actionable, not just decorative.

---

## What to Say in an Interview

> "The radar chart required aggregating solve rates per tag. The naive approach fetches all problems and all user progress in two queries, then aggregates in JavaScript. For a production scale, I'd push this to a SQL aggregation using UNNEST on the tags array and GROUP BY, which brings it down to a single database round trip. The chart uses 8 axes because that's the visual maximum before it becomes unreadable. I also added a weakness callout below the chart to make it actionable."

---

---

# 5. Custom Sheet Builder

> **Why it's impressive:** Ownership and permissions, many-to-many modeling, drag-to-reorder, and public sharing links. It's a genuinely useful feature with interesting edge cases.

---

## The Core Idea

Plus users can create their own problem sheets by searching and selecting problems from the platform, setting an order, giving it a title, and optionally making it publicly shareable via a link. Anyone with the link can view the sheet (read-only). Only Plus users can create.

---

## Schema Changes

Add two fields to your existing `Sheet` model:
- `isCustom` — boolean to distinguish user-created sheets from system sheets
- `isPublic` — boolean for shareable link access
- `createdById` — a foreign key to the user who created it (nullable, null for system sheets)

No new junction tables needed — custom sheets reuse your existing `Section` and `SectionProblem` models.

---

## The Three API Routes

**POST `/api/sheets`** — Create a custom sheet. Accept a title, description, whether it's public, and an ordered array of problem IDs. Create the sheet, create one section (a custom sheet starts with a single section), and create `SectionProblem` records with sequential `order` values. Apply the Plus gate here.

**PATCH `/api/sheets/:slug/reorder`** — Save a new order after drag-to-reorder. Accept an array of `{ id, order }` pairs. Run all the updates in a database transaction so the order is always consistent. Always verify the requesting user owns the sheet before updating.

**GET `/api/sheets/:slug/public`** — Read-only access. Requires no auth. Only works if `isPublic = true`. Returns the full sheet with sections and problems. If `isPublic = false`, return 404 (don't reveal that the sheet exists).

---

## Drag-to-Reorder

Use `@dnd-kit` — it's the modern standard for drag-and-drop in React. The core idea:

1. Render the problem list wrapped in a `DndContext` and `SortableContext`
2. Each row is a `useSortable` item
3. On drag end, use `arrayMove` to reorder the local state array
4. Show a "Save Order" button that becomes active after any reorder
5. On save, send the full array of `{ id, order }` pairs to the reorder endpoint

The key thing: the drag-and-drop only updates local state. Nothing is persisted until the user explicitly clicks "Save Order". This prevents accidental reorders and reduces API calls.

---

## The Permission Model

Three layers of access control:

- **Create** — Plus users only (check on `POST /api/sheets`)
- **Edit/Reorder/Delete** — Only the user who created the sheet (check `createdById === session.user.id`)
- **View** — Anyone with the link, but only if `isPublic = true`. For private sheets, only the creator can view.

The public route should never reveal whether a private sheet exists. Return 404 for both "not found" and "not public" — don't return 403, which would confirm the sheet exists.

---

## Search for Problems

When building a sheet, the user needs to search for problems to add. Add a debounced search box that calls `GET /api/problems?q=two+sum` and returns matching problems. The user clicks a result to add it to their sheet. Store the selected problems in local state and only persist them when the user clicks "Create Sheet."

---

## What to Say in an Interview

> "The custom sheet builder has an interesting permission model. Create is gated to Plus users. Edit and reorder is gated to the owner by checking `createdById`. Public view access is ungated — but the public route returns 404 for both 'not found' and 'not public', so you can't probe for the existence of private sheets. Reordering is done optimistically in client state and only saved on explicit confirmation, which prevents unnecessary API calls and accidental saves. The reorder endpoint runs all order updates in a single database transaction to keep order values consistent."

---

---

## Quick Reference — Interview Talking Points

| Feature | Core Technical Concept | Key Design Decision |
|---|---|---|
| Spaced Repetition | SM-2 interval algorithm | Normalize dates to midnight UTC; cap queue at 10 |
| Mock Interview | Session lifecycle (active → completed) | Timer anchored to server `startedAt`, not client |
| AI Code Review | Structured JSON prompt engineering | Rate limit via `UserDailyUsage` upsert + increment |
| Radar Chart | Tag aggregation + solve rate computation | Cap at 8 axes; add weakness callout for actionability |
| Sheet Builder | Ownership + permissions + public sharing | 404 for both not-found and not-public (no information leak) |

---

## Build Order Recommendation

```
Spaced Repetition   ← most algorithmic, start here while your brain is fresh
       ↓
Mock Interview      ← session modeling, builds on your DB comfort
       ↓
AI Code Review      ← adds external API + rate limiting layer
       ↓
Radar Chart         ← data aggregation, relatively quick
       ↓
Sheet Builder       ← permissions + drag-and-drop, save for last
```