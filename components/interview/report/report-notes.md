# Interview Report — Deep Dive Notes

> **Scope:** `components/interview/report/InterviewReport.tsx` and `app/(main)/interview/[id]/report/page.tsx`

---

## 1. Components Overview

| Component | File | Type | Purpose |
|---|---|---|---|
| `InterviewReport` | `report/InterviewReport.tsx` | Client (`"use client"`) | Full feedback report page. Fetches report data client-side, renders overall score, 4-5 performance dimensions, strong/weak areas, recommendations. |
| `SectionHeading` | (inline in InterviewReport.tsx) | Client | Reusable heading with consistent DM Mono styling and `tracking-[0.2em]`. |
| `DimensionCard` | (inline in InterviewReport.tsx) | Client | Score card for each dimension — icon, label, score with bar visualization, and summary text. |
| `ReportSkeleton` | (inline in InterviewReport.tsx) | Client | Loading skeleton matching the report layout. |

**No Server Components in the report directory.** The parent route page (`[id]/report/page.tsx`) is a Server Component that handles auth + existence check, then passes only `interviewId` to the client component.

---

## 2. Data Architecture

### TypeScript Types
```typescript
interface ScoreDimension {
  score: number;   // 0-10
  summary: string; // AI-generated feedback text
}

interface ReportData {
  id: string;
  interviewId: string;
  overallScore: number;           // 0-10
  confidence: ScoreDimension;
  depthReview: ScoreDimension;
  englishQuality: ScoreDimension;
  technicalAccuracy: ScoreDimension;
  starStructure: ScoreDimension | null;  // Only for HR/Behavioural
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  createdAt: string;
  interview: InterviewMeta;
}
```

### Conditional Dimensions
```typescript
const dimensions = [
  { key: "confidence", label: "Confidence", icon: Mic, data: confidence },
  { key: "depth", label: "Depth of Knowledge", icon: Brain, data: depthReview },
  { key: "english", label: "Communication Quality", icon: MessageSquare, data: englishQuality },
  ...(technicalAccuracy ? [{ key: "technical", ... }] : []),
  ...(starStructure ? [{ key: "star", label: "STAR Structure", ... }] : []),
];
```

**Why conditional?** `technicalAccuracy` is present for Technical/DSA modes; `starStructure` is present for HR/Behavioural mode. The component adapts the grid layout automatically.

---

## 3. Data Fetching

```typescript
useEffect(() => {
  async function fetchReport() {
    const res = await fetch(`/api/interview/${interviewId}/report`);
    const json = await res.json();
    if (json.success && json.data) {
      setReport(json.data);
    } else {
      setError(json.message || "Failed to load report");
    }
    setLoading(false);
  }
  fetchReport();
}, [interviewId]);
```

**Why client-side fetch instead of Server Component prop passing?**
- The Server Component page could pass the data directly, but the report data structure is complex and deeply nested
- Client-side fetching keeps the Server Component thin (just auth + existence check)
- Enables future features like refreshing the report without full page reload

**Three states:** `loading → error | data`
- Loading → `ReportSkeleton`
- Error → Centered error message with back link
- Data → Full report layout

---

## 4. Visual Design Patterns

### Score Color System
```typescript
function scoreColor(score: number, max = 10): string {
  const pct = (score / max) * 100;
  if (pct >= 70) return "var(--emerald)";  // Green
  if (pct >= 40) return "var(--amber)";    // Amber
  return "var(--rose)";                    // Red
}
```

Uses CSS custom properties (`var(--emerald)`, `var(--amber)`, `var(--rose)`) for theme consistency.

### Score Label
```typescript
function scoreLabel(score: number): string {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Average";
  return "Needs Work";
}
```

### Score Bar (Progress Indicator)
```tsx
<div className="h-2 rounded-full overflow-hidden bg-(--text-dim)">
  <div
    className="h-full rounded-full"
    style={{ width: `${overallScore * 10}%`, background: scoreColor(overallScore) }}
  />
</div>
```

### DimensionCard — Icon Badge + Score + Bar + Summary
Each dimension has:
1. Colored icon badge (`background: ${color}15` — 15 is ~6% opacity hex)
2. Score number + `/10`
3. Hidden-on-mobile progress bar
4. AI-generated summary text

---

## 5. Helper Functions

| Function | Purpose |
|---|---|
| `scoreColor(score, max)` | Returns CSS variable name based on percentage threshold |
| `scoreLabel(score)` | Returns human-readable label (Excellent/Good/Average/Needs Work) |
| `formatDuration(start, end)` | Calculates duration from ISO timestamps → "12m 34s" |
| `formatDate(iso)` | Formats ISO string → "Mar 7, 2026" |

---

## 6. Interaction Design

### Hover Animations
Every card has:
```css
transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-(--bg-card-hover)
hover:shadow-[0_18px_50px_rgba(0,0,0,0.2)]
```

List items have:
```css
hover:translate-x-0.5 hover:bg-white/3
```

This creates a subtle "lift on hover" effect system-wide.

### Footer CTAs
```tsx
<Link href="/interview" className="... bg-(--amber) ...">
  <BookOpen /> Practice Again <ChevronRight />
</Link>
<Link href="/interview" className="... border ...">
  <ArrowLeft /> Dashboard
</Link>
```

Primary CTA (Practice Again) uses gradient background; secondary (Dashboard) uses outline style.

---

## 7. Interview Talking Points

### "How does the report page work?"
> "The route page is a Server Component that does auth verification and checks the interview exists in the database via Prisma. It passes only the `interviewId` to the `InterviewReport` client component. The client component then fetches the full report data from `/api/interview/{id}/report`. This separation keeps the Server Component thin and allows the client to manage its own loading/error states. The report adapts its dimension grid based on the interview mode — Technical interviews show Technical Accuracy, while HR interviews show STAR Structure scoring."

### "How do you handle the score visualization?"
> "Each score dimension uses a combination of a colored number, a progress bar (using width percentage), and an AI-generated summary. The colors follow a threshold system: ≥70% is green, ≥40% is amber, below that is red. These map to CSS custom properties for theme consistency. The overall score has an additional progress bar for quick visual scanning. All of this uses vanilla CSS transitions — no charting library needed."
