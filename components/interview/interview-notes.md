# Interview Feature — Top-Level & Landing Notes

> **Scope:** `components/interview/` (top-level files), `components/interview/landing/`, and `app/(main)/interview/` route files.

---

## 1. Components Overview

| Component | File | Type | Purpose |
|---|---|---|---|
| `InterviewLanding` (CommandCenter) | `landing/CommandCenter.tsx` | Client (`"use client"`) | **Main interview dashboard** (~1356 lines). Fetches and displays all interviews (pending, processing, completed). Premium/free gate logic. Credits display. Delete functionality. |
| `StartInterviewModal` | `StartInterviewModal.tsx` | Client | Configuration modal for new sessions — mode (DSA/Technical/HR), company, difficulty, question count, resume upload. Calls `/api/interview/new-interview`. |
| `PremiumGateOverlay` | `PremiumGateOverlay.tsx` | Client | Paywall overlay shown to free users. Expandable feature list, pricing CTA. |
| `BlurredReportPreview` | `PremiumGateOverlay.tsx` | Client | Blurred mock-report visual used alongside the premium gate to tease the AI feedback reports. |
| `InterviewLanding` (legacy) | `InterviewLanding.tsx` | Client | Older landing page with hero, company ticker, feature highlights. Uses mock data (`Interview` type from `lib/mockData`). |
| `InterviewDetail` | `InterviewDetail.tsx` | Client | Post-interview detail view with performance metrics (SVG circular gauges), strong/weak areas, collapsible transcript. Uses mock data. |
| `InterviewClient` | `InterviewClient.tsx` | Client | Standalone speech-to-text test component — inline styles, waveform animation. Likely a prototype/test page. |
| `InterviewCard` | `InterviewCard.tsx` | Client | Reusable card for past interview sessions — score bar, metadata, topic tags. |
| `AIOrb` | `AIOrb.tsx` | Client | Reusable animated orb representing the AI interviewer. State-driven animation speeds (idle/asking/processing/evaluating). |

### Sub-directories

| Directory | Contains | Notes |
|---|---|---|
| `room/` | Live interview room components | See `interview-room-notes.md` |
| `landing/` | CommandCenter dashboard | Main production landing |
| `report/` | InterviewReport component | See section below |

---

## 2. CommandCenter — Architecture Deep Dive

### Conditional Rendering Based on User Status

The component renders entirely different UIs based on `isPremium` and `initialCredits`:

```typescript
// Line 217 — PROMO PAGE branch
if (!premium && interviewCredits === 0) {
  return (/* Full promotional landing page with CTAs to /subscription */);
}

// Line 461 — MAIN DASHBOARD branch (premium OR has credits)
return (/* Full interview dashboard with sessions, stats */);
```

**Three CTA states:**
1. **Has credits** → Active "Start New Session" button, opens `StartInterviewModal`
2. **Not premium, no credits** → Full promo page with upgrade CTAs
3. **Premium, credits exhausted** → Disabled CTA + info card with renewal date + "View higher plans" link

### Data Fetching Pattern

```typescript
// Client-side fetch on mount
useEffect(() => {
  fetchInterviews(); // GET /api/interview
}, []);

// Polling for processing interviews (15s interval)
useEffect(() => {
  if (processingInterviews.length === 0) return;
  const interval = setInterval(fetchInterviews, 15000);
  return () => clearInterval(interval);
}, [processingInterviews.length]);
```

**Why client-side fetching here?** The page.tsx Server Component fetches user data (premium/credits) via Prisma, but interview list is fetched client-side. This is because:
1. The list needs to refresh (after creating/deleting interviews) without a full page reload
2. Processing interviews need polling every 15s
3. Optimistic updates on delete need local state

### Interview Categorization

```typescript
const pendingInterviews = interviews.filter(i => i.status === "notStarted");
const processingInterviews = interviews.filter(i => i.status === "processing");
const pastInterviews = interviews.filter(i => i.status !== "notStarted" && i.status !== "processing");
```

Each category renders in its own section with different card styles:
- **Pending** → Amber pulse dot, "Join Room" CTA
- **Processing** → Animated pulse, "Your feedback report is being generated…"
- **Completed** → Score ring, metric bars, "Report" link

### Delete Pattern

```typescript
const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

// AlertDialog from shadcn/ui - controlled by deleteTargetId
<AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && !isDeleting && setDeleteTargetId(null)}>
```

**Why this pattern?**
- Only one delete target at a time
- Dialog prevented from closing while DELETE request is in-flight
- Optimistic local state update: `setInterviews(prev => prev.filter(i => i.id !== deleteTargetId))`
- Toast notifications for success/error feedback

---

## 3. StartInterviewModal — Form Architecture

### State Design
```typescript
const [mode, setMode] = useState<InterviewMode>("technical"); // "dsa" | "technical" | "hr"
const [company, setCompany] = useState("Google");
const [difficulty, setDifficulty] = useState<Difficulty>("senior");
const [questionCount, setQuestionCount] = useState(8);
const [resume, setResume] = useState<File | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Conditional UI
- **DSA mode** hides question count selector + shows warning about needing an IDE
- **Technical mode** shows resume upload (optional)
- **HR mode** standard config only

### Navigation After Creation
```typescript
const interviewId = json.data;
const params = new URLSearchParams({
  interviewId, mode, company, difficulty,
  questions: questionCount.toString(),
});
router.push(`/interview/new-session?${params.toString()}`);
// Don't call onClose() — keep modal open with loading state
```

**Why keep modal open?** Route change triggers unmount naturally. Closing the modal first would briefly flash the underlying page, creating a jarring transition.

---

## 4. AIOrb — Animation System

```typescript
type OrbState = "idle" | "asking" | "processing" | "evaluating";

const speeds = {
  idle: { ring1: "14s", ring2: "20s", breathe: "4s" },       // Slow, ambient
  asking: { ring1: "5s", ring2: "7s", breathe: "2s" },       // Active, engaged
  processing: { ring1: "3s", ring2: "4s", breathe: "1.5s" }, // Fast, working
  evaluating: { ring1: "10s", ring2: "14s", breathe: "3s" }, // Calm, deliberate
};
```

**Visual structure:** Three concentric layers:
1. **Core** — Radial gradient sphere with glow
2. **Inner ring** — Spinning border with orbital dot (reverse direction)
3. **Outer ring** — Spinning border with orbital dot
4. **Processing shimmer** — Extra ring only visible during `processing` state

**Design principle:** Animation speed communicates AI state without text labels.

---

## 5. Route Pages — Server vs Client Pattern

### Server Components (auth + data fetch → render client component)

| Route | Rendering | Data Fetch | Renders |
|---|---|---|---|
| `interview/page.tsx` | Server | Prisma `user.findFirst` (premium, credits, expiresAt) | `<InterviewLanding>` |
| `interview/[id]/page.tsx` | Server | Prisma `interview.findFirst` + `feedback` | Smart redirect (lobby or report) |
| `interview/[id]/report/page.tsx` | Server | Prisma `interview.findFirst` | `<InterviewReport>` |
| `interview/result/[id]/page.tsx` | Server | Auth guard only, uses mock data | Static result layout |

### Client Components (full pages)

| Route | Why Client? |
|---|---|
| `interview/new-session/page.tsx` | Manages view state machine (lobby/browser-gate/preparing/room), navigation guards, audio/speech APIs |
| `interview/session/[id]/page.tsx` | Demo/mock session with recording toggle, timer, simulated transcript |

### `new-session/page.tsx` — State Machine

```typescript
type View = "lobby" | "browser-gate" | "preparing" | "room";

// Flow:
// lobby → (check speech support) → browser-gate (if unsupported)
//                                → preparing (fire join request)
//                                  → room (on ready)
```

**Config from URL params:**
```typescript
const interviewId = searchParams.get("interviewId") || "";
const config: InterviewConfig = {
  company: searchParams.get("company") || "Google",
  mode: searchParams.get("mode") || "technical",
  difficulty: searchParams.get("difficulty") || "senior",
};
```

**Why URL params?** The interview config is set in `StartInterviewModal` and needs to survive the route change. URL params are the simplest way to pass data across a client-side navigation without a shared store.

---

## 6. Next.js Patterns

### Layout-Level UI Control
```tsx
// interview/layout.tsx — Server Component
<style>{`
  body:has([data-interview-room="active"]) footer,
  body:has([data-interview-room="active"]) nav {
    display: none !important;
  }
`}</style>
```

### Skeleton Loading
```tsx
// interview/loading.tsx — matches the CommandCenter layout shape
<div className="animate-pulse">
  <div className="h-3 w-36 rounded bg-white/5 mb-8" />
  <div className="h-10 w-72 rounded bg-white/5" />
  ...
</div>
```

### Error Boundary
```tsx
// interview/error.tsx — required "use client"
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  // Minimal UI with retry button
}
```

### Metadata
```typescript
export const metadata: Metadata = {
  title: "Interview",
  description: "Practice with an AI interviewer...",
  openGraph: { ... }
};
```

---

## 7. ScoreRing — SVG Data Visualization

```typescript
function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 10) * circumference;
  // SVG circle with stroke-dasharray/dashoffset trick for progress ring
}
```

**Color thresholds:** `≥8 → green`, `≥6 → amber`, `≥4 → orange`, `<4 → rose`

Used in `CompletedInterviewCard` to show overall scores in a compact, visual format.

---

## 8. Interview Talking Points

### "How does the interview landing handle different user states?"
> "The CommandCenter uses an early-return pattern with two distinct UIs. If the user isn't premium and has zero credits, it returns a full promotional page with feature highlights, interview mode cards, and upgrade CTAs. Otherwise, it returns the full dashboard with credits banner, pending/processing/completed interview sections, and the ability to start new sessions. Within the dashboard, the CTA button has three states: active (has credits), disabled with info card (premium, exhausted), or hidden (handled by the promo branch)."

### "Why is the interview list fetched client-side?"
> "The page Server Component fetches user data (premium status, credits) directly from Prisma. But the interview list is fetched client-side via `useEffect` because it needs three capabilities: (1) refresh without full page reload after creating or deleting interviews, (2) 15-second polling for processing interviews — we check `processingInterviews.length` and only poll when there are interviews being processed, (3) optimistic updates on delete so the UI feels instant."

### "How does the StartInterviewModal handle the transition?"
> "After the API call succeeds, we build a URLSearchParams with the interview config and `router.push` to the new-session page. Critically, we don't close the modal — we keep it open with a loading spinner. The route change will unmount the page naturally. If we closed the modal first, the user would briefly see the dashboard flash before navigating, which feels broken."

### "Explain the polling mechanism"
> "We poll only when there are interviews in 'processing' state — that's when the backend is generating the AI feedback report. The effect watches `processingInterviews.length` in its dependency array. When it drops to 0 (all reports finished), the interval is cleared automatically via cleanup. The 15-second interval balances freshness against API load."
