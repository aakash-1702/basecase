"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ProblemsTable from "@/components/problems/ProblemsTable";
import PaginationControls from "@/components/PageChange";
import Container from "@/components/shared/Container";
import EmptyState from "@/components/shared/EmptyState";
import PageHero from "@/components/shared/PageHero";
import SearchFilterBar from "@/components/shared/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 20;

type ProblemRow = React.ComponentProps<typeof ProblemsTable>["problems"][number];

interface ProblemsResponse {
  success: boolean;
  message?: string;
  data?: {
    problems?: ProblemRow[];
    pagination?: { page: number; limit: number; total: number; totalPages: number };
  };
}

interface Result {
  key: string;
  problems: ProblemRow[];
  page: number;
  totalPages: number;
  total: number;
}

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All levels" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "solved", label: "Solved" },
  { value: "unsolved", label: "Unsolved" },
];

function parsePage(raw: string | null) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function ProblemsSkeleton() {
  return (
    <div className="card-base overflow-hidden" aria-busy aria-label="Loading problems">
      <div className="flex items-center gap-4 border-b border-line px-4 py-3.5">
        <div className="skeleton h-3 w-12" />
        <div className="skeleton h-3 w-24" />
        <div className="skeleton ml-auto h-3 w-16" />
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0"
        >
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-3.5 w-full max-w-xs" />
          <div className="skeleton ml-auto h-5 w-16 rounded-full" />
          <div className="skeleton hidden h-3 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}

export default function ProblemsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parsePage(searchParams.get("page"));

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [retryTick, setRetryTick] = useState(0);

  // Latest successful response / error, tagged with the request they belong to.
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);

  const requestKey = `${page}|${difficulty}|${status}|${debouncedSearch}|${retryTick}`;
  const error = failure?.key === requestKey ? failure.message : null;
  const loading = !error && result?.key !== requestKey;

  /** Page lives in the URL so a refresh / back-nav keeps the position. */
  const setPage = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next > 1) params.set("page", String(next));
      else params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const lastSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    // A new (debounced) search term always restarts from page 1.
    if (lastSearchRef.current !== debouncedSearch) {
      lastSearchRef.current = debouncedSearch;
      if (page !== 1) {
        setPage(1);
        return; // the URL change re-runs this effect with page = 1
      }
    }

    const controller = new AbortController();
    const { signal } = controller;
    const key = requestKey;

    (async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          difficulty,
          status,
        });
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await fetch(`/api/problems?${params}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal,
        });
        if (signal.aborted) return;

        if (res.status === 401) {
          const msg = "Session expired. Please log in again.";
          toast.error(msg);
          setFailure({ key, message: msg });
          return;
        }

        const json = (await res.json().catch(() => null)) as ProblemsResponse | null;
        if (signal.aborted) return;

        if (!res.ok || !json?.success) {
          const msg = json?.message || "Failed to fetch problems";
          toast.error(msg);
          setFailure({ key, message: msg });
          return;
        }

        const pagination = json.data?.pagination;
        setResult({
          key,
          problems: json.data?.problems ?? [],
          page: pagination?.page ?? page,
          totalPages: Math.max(1, pagination?.totalPages ?? 1),
          total: pagination?.total ?? json.data?.problems?.length ?? 0,
        });
      } catch (err) {
        if (signal.aborted) return;
        const msg = err instanceof Error ? err.message : "Unable to fetch problems";
        console.error(err);
        toast.error(msg);
        setFailure({ key, message: msg });
      }
    })();

    return () => controller.abort();
  }, [page, difficulty, status, debouncedSearch, requestKey, setPage]);

  const handlePageChange = useCallback(
    (next: number) => {
      const totalPages = result?.totalPages ?? 1;
      if (next >= 1 && next <= totalPages && next !== page) setPage(next);
    },
    [result?.totalPages, page, setPage],
  );

  const filters = useMemo(
    () => [
      {
        key: "difficulty",
        placeholder: "Difficulty",
        value: difficulty,
        options: DIFFICULTY_OPTIONS,
        onChange: (v: string) => {
          setDifficulty(v);
          setPage(1);
        },
      },
      {
        key: "status",
        placeholder: "Status",
        value: status,
        options: STATUS_OPTIONS,
        width: "w-36",
        onChange: (v: string) => {
          setStatus(v);
          setPage(1);
        },
      },
    ],
    [difficulty, status, setPage],
  );

  const total = result?.total ?? 0;
  const chips = useMemo(
    () => [
      total > 0 ? `${total.toLocaleString()} problems` : "Handpicked problems",
      "Real interview patterns",
      "Progress synced",
    ],
    [total],
  );

  const rangeStart = result && result.problems.length > 0 ? (result.page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = result ? rangeStart + result.problems.length - 1 : 0;

  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Problem set"
        title="Master"
        highlight="DSA problems"
        description="Handpicked problems, real interview patterns and progress that follows you from sheet to editor."
        chips={chips}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search problems (e.g. two sum, sliding window…)"
        filters={filters}
      />

      <Container className="min-h-[400px] py-8">
        {loading ? (
          <ProblemsSkeleton />
        ) : error ? (
          <EmptyState
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Couldn't load problems"
            description={error}
            action={
              <button
                type="button"
                onClick={() => setRetryTick((t) => t + 1)}
                className="btn btn-secondary btn-sm"
              >
                Try again
              </button>
            }
          />
        ) : result ? (
          <>
            <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
              <span>
                {result.problems.length > 0
                  ? `Showing ${rangeStart}–${rangeEnd} of ${result.total}`
                  : "No results"}
              </span>
              <span>
                Page {result.page} / {result.totalPages}
              </span>
            </div>

            <div className="card-base overflow-hidden">
              <ProblemsTable problems={result.problems} />
            </div>

            {result.totalPages > 1 && (
              <PaginationControls
                currentPage={result.page}
                totalPages={result.totalPages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </>
        ) : null}
      </Container>
    </div>
  );
}
