# Dashboard — Deep Dive Notes

> **Scope:** `app/(main)/dashboard/page.tsx` and `app/(main)/dashboard/DashBoard.tsx`

---

## 1. Components Overview

| Component | File | Type | Purpose |
|---|---|---|---|
| `DashboardPage` | `page.tsx` | **Server Component** | Auth guard → fetch dashboard data via internal API → pass to client component. |
| `Dashboard` | `DashBoard.tsx` | Client (`"use client"`) | Main dashboard UI: greeting, revision banner, weakest sheet, overall progress ring, sheet progress table, recent submissions, daily tip, quick links. |
| `ProgressRing` | (inline in DashBoard.tsx) | Client | SVG circular progress ring with gradient stroke. |

---

## 2. Server Component — Data Fetching Pattern

```typescript
// page.tsx — Server Component
const dashBoardData = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard`,
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie: (await headers()).get("cookie") ?? "", // Forward session cookie
    },
    cache: "no-store",  // Always fresh data
  },
);

const data = await dashBoardData.json();
data.data.name = session.user.name; // Inject user name from auth session
```

**Why fetch via HTTP instead of direct Prisma call?**
- The `/api/dashboard` route contains aggregation logic (solved counts, progress percentages, revision schedule)
- Reusing the API route avoids duplicating this business logic
- **Cookie forwarding is critical** — Server Components don't automatically include cookies in fetch requests to their own API. The cookie header must be explicitly forwarded.

**Why `cache: "no-store"`?** Dashboard data changes frequently (problems solved, revision schedule). Stale data would be confusing.

---

## 3. Dashboard Props Interface

```typescript
interface DashboardProps {
  data: {
    success: boolean;
    data: {
      easy: number; medium: number; hard: number;
      easySolved: number; mediumSolved: number; hardSolved: number;
      easyProgress: number; mediumProgress: number; hardProgress: number;
      completion: number;
      sheetProgress: Array<{
        id: string; slug: string; title: string;
        total: number; solved: number; progress: number;
      }>;
      recentSubmission: Array<{
        id: string; solvedAt: string | null; updatedAt: string;
        problem: { title: string; difficulty: string; slug: string; link: string; };
      }>;
      name: string;
      problemsToRevise: Array<{
        id: string; nextAttempt: string | null;
        problem: { title: string; difficulty: string; slug: string; link: string; };
      }>;
      totalDue: number;
    };
  };
}
```

**All data is server-fetched and passed as props.** The Dashboard client component is purely presentational — zero `useEffect`, zero `useState`, zero `fetch`.

---

## 4. Layout Architecture

The dashboard uses a 4-section grid layout:

```
[P1] Revision Banner (full width)
[P2] Two-column grid: Weakest Sheet | Overall Progress
[P3] Sheets Progress Table (full width)
[P4] Two-column grid: Recent Submissions | Side column (Tip + Quick Links)
```

All styled via a single `<style>` tag with CSS class names (not Tailwind). This is the only component that uses this pattern.

**Why inline CSS instead of Tailwind?** The dashboard was likely built as a standalone component with its own design system. The CSS defines local variables:
```css
:root {
  --surface: rgba(23, 23, 23, 0.6);
  --border: rgba(255,255,255,0.06);
  --accent: #f59e0b;
  /* ... */
}
```

### Responsive Breakpoint
```css
@media (max-width:900px) {
  .p2-grid, .bottom-grid { grid-template-columns: 1fr; }
  .sheet-row { grid-template-columns: 1fr 56px 40px; }
  .sheet-frac { display: none; }
}
```
Collapses 2-column grids to single column. Hides fraction column in sheet table.

---

## 5. Key UI Sections

### Revision Banner
- Shows problems due for spaced repetition
- Uses `getDueLabel(date)` → "Due today" / "1 day overdue" / "3 days overdue"
- Empty state: "✅ No problems due right now"
- Each item links to the problem's external URL (LeetCode)

### Weakest Sheet
- Sorts `sheetProgress` by `progress` ascending, takes first
- Shows name, solved/total, progress bar, "Practice {title} →" CTA
- Red color scheme to draw attention

### Overall Progress
- `ProgressRing` SVG component with gradient stroke
- Per-difficulty bars (easy=green, medium=yellow, hard=red)
- `totalSolved / totalProblems` summary

### Sheet Progress Table
- Grid layout: `1fr 72px 100px 52px` (name, bar, fraction, percentage)
- Color-coded progress: `<30% → red`, `<70% → yellow`, `≥70% → green`
- Each row links to `/sheets/{slug}`

### Recent Submissions
- List of recently solved problems
- `getRelativeTime(date)` → "Just now" / "3h ago" / "Yesterday" / "5d ago"
- Difficulty badge with color map

### Side Column
- **Daily Tip** — Problem-solving tip with highlighted keywords (`dangerouslySetInnerHTML`)
- **Quick Jump** — 4-button grid linking to Sheets, Problems, Interview, Revisions

---

## 6. CSS Animations

```css
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes barGrow { from { width: 0; } }
@keyframes ringDraw { from { stroke-dashoffset: 226; } }
```

Each section has staggered animation delays:
- Greeting: `0s`
- Revision banner: `0.05s`
- P2 grid: `0.1s`
- Sheets card: `0.15s`
- Bottom grid: `0.2s`

---

## 7. Helper Functions

| Function | Implementation | Notes |
|---|---|---|
| `getRelativeTime(date)` | Calculates hours/days diff from now | Returns "Just now" / "Xh ago" / "Yesterday" / "Xd ago" |
| `getDueLabel(date)` | Calculates days overdue | Returns "Due today" / "X days overdue" |

---

## 8. Interview Talking Points

### "How does data flow into the Dashboard?"
> "The dashboard uses a Server Component → Client Component pattern. The page Server Component authenticates the user, then fetches aggregated data from our `/api/dashboard` endpoint. There's a key detail — since Server Components don't automatically include cookies in fetch requests, I explicitly forward the cookie header from the incoming request. The API response contains everything: problem counts, progress per difficulty, sheet progress, recent submissions, and revision schedule. All of this is passed as a single `data` prop to the Dashboard client component, which is purely presentational — no hooks, no effects, no client-side fetching."

### "Why does the Dashboard use inline CSS instead of Tailwind?"
> "The Dashboard component has its own CSS custom properties and class-based styling rather than Tailwind utilities. This was a design choice for this particular component — the complex grid layouts, animations with staggered delays, and hover interactions are easier to maintain with named CSS classes. It defines local CSS variables like `--surface`, `--border`, `--accent` that match the overall design system but are scoped to this component. The tradeoff is less consistency with the rest of the codebase, but more readability for the complex layout logic."

### "How does the revision system work on the frontend?"
> "The backend implements SM-2 spaced repetition — each problem has a `nextAttempt` date. The dashboard shows a 'Due for Revision' banner by filtering problems where `nextAttempt` is in the past. Each card shows how overdue it is using `getDueLabel()`. The data comes from the server — the frontend doesn't calculate revision schedules, it just displays them. This keeps the revision algorithm purely server-side and ensures consistency."
