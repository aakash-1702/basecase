"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, SearchX } from "lucide-react";
import Container from "@/components/shared/Container";
import EmptyState from "@/components/shared/EmptyState";
import PageHero from "@/components/shared/PageHero";
import Reveal from "@/components/shared/Reveal";
import SearchFilterBar, { type FilterConfig } from "@/components/shared/SearchFilterBar";
import SectionHeader from "@/components/shared/SectionHeader";
import SheetCard, { SheetCardSkeleton } from "@/components/sheets/SheetCard";
import type { SheetListItem } from "@/components/sheets/types";

const PAGE_SIZE = 12;

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All levels" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function SheetsPage() {
  const [sheets, setSheets] = useState<SheetListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  // Fetch all sheets once (aborted if the page unmounts mid-flight).
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/sheets", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load sheets");
        const json = (await res.json()) as { data?: SheetListItem[] | null };
        if (controller.signal.aborted) return;
        setSheets(json.data ?? []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load sheets");
      }
    })();

    return () => controller.abort();
  }, [retryTick]);

  const retry = useCallback(() => {
    setSheets(null);
    setError(null);
    setRetryTick((t) => t + 1);
  }, []);

  // ── Client-side filtering over the *full* list ───────────────────────────
  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    const list = sheets ?? [];
    return list.filter((sheet) => {
      const matchesSearch =
        !query ||
        sheet.title.toLowerCase().includes(query) ||
        (sheet.description ?? "").toLowerCase().includes(query);
      const matchesDifficulty =
        difficulty === "all" ||
        (sheet.difficulty ?? "").toLowerCase() === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [sheets, query, difficulty]);

  // Only offer the difficulty filter when the API actually provides difficulties.
  const hasDifficulty = useMemo(
    () => (sheets ?? []).some((s) => Boolean(s.difficulty)),
    [sheets],
  );

  const filters = useMemo<FilterConfig[]>(
    () =>
      hasDifficulty
        ? [
            {
              key: "difficulty",
              placeholder: "Difficulty",
              value: difficulty,
              options: DIFFICULTY_OPTIONS,
              onChange: setDifficulty,
              width: "w-40",
            },
          ]
        : [],
    [hasDifficulty, difficulty],
  );

  // ── Synchronous "load more" (no fake network delay) ──────────────────────
  const filterKey = `${query}|${difficulty}`;
  const [visible, setVisible] = useState({ key: "", count: PAGE_SIZE });
  const visibleCount = visible.key === filterKey ? visible.count : PAGE_SIZE;
  const shown = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const loadMore = useCallback(() => {
    setVisible((v) => ({
      key: filterKey,
      count: (v.key === filterKey ? v.count : PAGE_SIZE) + PAGE_SIZE,
    }));
  }, [filterKey]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "240px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // `visibleCount` re-arms the observer after each batch so a still-visible
    // sentinel keeps loading until the viewport is filled.
  }, [hasMore, loadMore, visibleCount]);

  const loading = sheets === null && !error;

  return (
    <div className="pb-8">
      <PageHero
        eyebrow="Sheets"
        title="Curated"
        highlight="sheets"
        description="Structured topic-wise lists of handpicked problems, built to accelerate your progress."
        chips={[
          sheets ? `${sheets.length} sheets` : "Topic-wise lists",
          "Handpicked problems",
          "Updated regularly",
        ]}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sheets (Heap, Graph, Blind 75…)"
        filters={filters}
      />

      <Container className="py-12 md:py-16">
        <SectionHeader
          eyebrow="Library"
          title="Explore all sheets"
          description={
            sheets && !loading
              ? `${filtered.length} of ${sheets.length} sheets`
              : undefined
          }
        />

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <SheetCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Couldn't load sheets"
              description={error}
              action={
                <button type="button" onClick={retry} className="btn btn-secondary btn-sm">
                  Try again
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-5 w-5" />}
              title="No sheets match"
              description="Try a different search term or clear the filters."
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shown.map((sheet, idx) => (
                  <Reveal key={sheet.id} delay={(idx % 4) * 70}>
                    <SheetCard sheet={sheet} />
                  </Reveal>
                ))}
              </div>

              {hasMore ? (
                <div ref={sentinelRef} className="flex justify-center py-12">
                  <button type="button" onClick={loadMore} className="btn btn-secondary">
                    Load more sheets
                  </button>
                </div>
              ) : (
                <p className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
                  You&apos;ve reached the end — keep grinding
                </p>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
