# Problems Page — Deep Dive Notes

> **Scope:** `app/(main)/problems/page.tsx`, `app/(main)/problems/Problems.tsx`, and `components/problems/ProblemsTable.tsx`

---

## 1. Components Overview

| Component | File | Type | Purpose |
|---|---|---|---|
| `ProblemsPage` (route) | `page.tsx` | **Server Component** | Auth guard → renders `<ProblemsTable />`. No data fetching at this level. |
| `ProblemsPage` (client) | `Problems.tsx` | Client (`"use client"`) | Main page with hero section, sticky filter bar, problems table, and pagination. Handles all data fetching + filter state. |
| `ProblemsTable` | `components/problems/ProblemsTable.tsx` | Client | Table component that renders the actual problem rows. |
| `PaginationControls` | `components/PageChange.tsx` | Client | Reusable prev/next pagination buttons. |

---

## 2. State Management

```typescript
const [problems, setProblems] = useState<any[]>([]);
const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [search, setSearch] = useState("");
const [difficultyFilter, setDifficultyFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");
```

**No external state management** — all state is local to this page.

---

## 3. Data Fetching — The Debounced Search Pattern

```typescript
// Primary fetch function — memoized with useCallback
const fetchProblems = useCallback(async () => {
  const params = new URLSearchParams({
    page: String(pagination.page),
    limit: "5",
    difficulty: difficultyFilter,
    status: statusFilter,
    ...(search ? { search } : {}),
  });
  
  const res = await fetch(`/api/problems?${params}`, {
    credentials: "include",
    cache: "no-store",
  });
  // ... handle response
}, [pagination.page, difficultyFilter, statusFilter, search]);

// Trigger fetch whenever dependencies change
useEffect(() => {
  fetchProblems();
}, [fetchProblems]);

// Debounce search — reset to page 1 after 400ms idle
useEffect(() => {
  const timeout = setTimeout(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, 400);
  return () => clearTimeout(timeout);
}, [search]);
```

### How the debounce works:
1. User types in search input → `search` state updates on every keystroke
2. The search debounce `useEffect` runs, sets a 400ms timeout to reset page to 1
3. Each keystroke cancels the previous timeout (via cleanup `clearTimeout`)
4. After 400ms of no typing, page resets to 1
5. `pagination.page` change triggers `fetchProblems` via its dependency chain

**Tradeoff:** The `fetchProblems` `useCallback` has `search` in its dependencies, so it technically re-creates on every keystroke. But the actual fetch only fires when `useEffect([fetchProblems])` detects a new reference. Since `useCallback` recreates when `search` changes, this means the fetch fires on every keystroke. The debounce only controls the page reset, not the fetch itself.

**Improvement opportunity:** The debounce could be moved *inside* `fetchProblems` or a `useDebouncedValue` hook could wrap `search` to prevent unnecessary API calls during typing.

### Error Handling
```typescript
if (res.status === 401) {
  toast.error("Session expired. Please log in again.");
  return;
}
if (!res.ok) {
  const err = await res.json();
  toast.error(err.message || "Failed to fetch problems");
  setError(err.message || "Failed to fetch problems");
  return;
}
```
Special handling for 401 (session expired) separate from general errors.

---

## 4. UI Architecture

### Hero Section
- Gradient text title ("Master **DSA** Problems")
- Animated blur glow background (amber, pulsing)
- Badge row: "1,200+ Problems", "85% Solved by Top 1%", "Updated Daily"

### Sticky Filter Bar
```tsx
<section className="sticky top-0 z-40 backdrop-blur-xl">
```
- Search input with debounced behavior
- Difficulty select: All / Easy / Medium / Hard
- Status select: All / Solved / Unsolved
- "More Filters" button (placeholder)
- Resets pagination to page 1 on any filter change

### Table + Pagination
- `ProblemsTable` renders the actual rows
- `PaginationControls` shown only when `totalPages > 1`
- Loading state: pulsing text "Loading problems..."
- Error state: rose-colored error message

---

## 5. Next.js Patterns

### Server Component (page.tsx)
```typescript
export const metadata: Metadata = {
  title: "Problems",
  description: "Practice curated DSA problems...",
  openGraph: { ... },
};

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");
  return <ProblemsTable />;
};
```

The Server Component's job is minimal: authenticate and render. All data fetching happens client-side because filters are interactive.

### Why Client-Side Fetching?
Unlike the Dashboard (server-rendered data), Problems needs:
- Real-time filter changes without page reload
- Debounced search
- Pagination without full-page navigation
- Authentication cookie forwarding (`credentials: "include"`)

---

## 6. Filter State Flow

```
User types → search state updates → debounce timeout (400ms) → page resets to 1
                                                             → useCallback recreates
                                                             → useEffect triggers fetch
                                                             → API call with filters as query params

User changes difficulty → difficultyFilter updates → page resets to 1 (inline)
                                                   → useCallback recreates
                                                   → useEffect triggers fetch

User clicks pagination → pagination.page updates → useCallback recreates
                                                  → useEffect triggers fetch
```

---

## 7. Interview Talking Points

### "How do you handle search and filtering?"
> "The Problems page manages filters as local state — search text, difficulty, and solved status. All filter values are serialized as URL query parameters to the API: `/api/problems?page=1&limit=5&difficulty=easy&status=solved&search=two+sum`. When any filter changes, pagination resets to page 1. The search input has a 400ms debounce using `useEffect` with cleanup — each keystroke clears the previous timeout, and only after the user stops typing for 400ms does the page reset and fetch fire. One thing I'd improve: the current debounce only controls pagination reset, not the fetch itself. Moving to a `useDebouncedValue` pattern would prevent unnecessary API calls during typing."

### "Why is the Problems page client-rendered vs Dashboard being server-rendered?"
> "The Dashboard is server-rendered because its data is relatively static — it shows aggregated stats and recent activity. The data doesn't change based on user interaction within the page. Problems, on the other hand, needs real-time interactivity: search, difficulty/status filters, and pagination. These require client-side state and fetch. Doing this server-side would mean a full page reload for every filter change, which would kill the UX."
