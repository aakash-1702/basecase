// app/sheets/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  BookOpen,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Add these keyframes to your globals.css (or tailwind config)
const keyframes = `
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.2); }
  50%      { box-shadow: 0 0 20px 8px rgba(245, 158, 11, 0.1); }
}
.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}
`;

export default function SheetsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [sheets, setSheets] = useState<any[]>([]);
  const [displayedSheets, setDisplayedSheets] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);

  // Fetch all sheets once
  useEffect(() => {
    const fetchSheets = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/sheets", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load sheets");
        const json = await res.json();
        const data = json.data || [];
        setSheets(data);
        // Initial display: first 12
        setDisplayedSheets(data.slice(0, 12));
        setHasMore(data.length > 12);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSheets();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasMore, loadingMore, sheets]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    // Simulate network delay
    setTimeout(() => {
      const start = page * 12;
      const end = start + 12;
      const newSheets = sheets.slice(start, end);

      if (newSheets.length > 0) {
        setDisplayedSheets((prev) => [...prev, ...newSheets]);
        setPage((p) => p + 1);
        setHasMore(end < sheets.length);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 800);
  };

  // Client-side filtering
  const filteredSheets = displayedSheets.filter((sheet) => {
    const matchesSearch =
      sheet.title.toLowerCase().includes(search.toLowerCase()) ||
      sheet.description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficulty === "all" || sheet.difficulty?.toLowerCase() === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 border-b border-neutral-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-amber-950/10 to-transparent pointer-events-none" />
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[600px] md:w-[900px] h-[400px] bg-amber-500/5 rounded-full blur-3xl animate-pulse-glow" />

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight animate-fade-in-up">
              Curated{" "}
              <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Sheets
              </span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Structured topic-wise lists • Handpicked problems • Built to
              accelerate your progress
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
              <Badge className="bg-amber-950/60 border-amber-700/50 text-amber-300 px-5 py-2 text-base">
                {sheets.length} Sheets
              </Badge>
              <Badge className="bg-amber-950/60 border-amber-700/50 text-amber-300 px-5 py-2 text-base">
                Updated Regularly
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/50 py-6">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search sheets (Heap, Graph, Blind 75...)"
                className="pl-10 bg-neutral-900 border-neutral-700 focus:border-amber-500/50 focus:ring-amber-500/30 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-44 bg-neutral-900 border-neutral-700">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="border-amber-600/50 text-amber-300 hover:bg-amber-950/40 transition-all"
              >
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid – 4 per row on xl */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in-up">
            Explore All <span className="text-amber-400">Sheets</span>
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSheets.map((sheet, idx) => (
              <div
                key={sheet.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-neutral-800/60",
                  "bg-neutral-900/60 backdrop-blur-sm transition-all duration-300",
                  "hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-900/20 hover:-translate-y-1",
                  "animate-fade-in-up",
                  `animation-delay-${(idx % 8) * 100}`,
                )}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {sheet.title}
                  </h3>

                  <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                    {sheet.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    <Badge
                      variant="secondary"
                      className="bg-neutral-800 text-neutral-300 text-xs"
                    >
                      {sheet.difficulty || "Mixed"}
                    </Badge>
                    {/* You can add more badges when backend provides tags */}
                  </div>

                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      {Math.floor(Math.random() * 80 + 40)} problems
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />~
                      {Math.floor(Math.random() * 40 + 20)} hrs
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-amber-600/50 text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 transition-all"
                  >
                    <Link href={`/sheets/${sheet.slug}`}>View Sheet →</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={observerRef} className="py-16 flex justify-center">
              <div className="inline-flex items-center gap-3 text-neutral-400">
                <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Loading more sheets...
              </div>
            </div>
          )}

          {!hasMore && displayedSheets.length > 0 && (
            <div className="py-16 text-center text-neutral-500 animate-fade-in-up">
              You've reached the end — keep grinding! 🔥
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {/* CTA – Signed-in users only */}
      <section className="py-20 md:py-24 border-t border-neutral-800/40 bg-gradient-to-b from-neutral-950 via-neutral-950 to-amber-950/5">
        <div className="mx-auto max-w-4xl px-5 text-center relative">
          {/* Very subtle background glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent animate-pulse-slow" />
          </div>

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 animate-fade-in-up">
              Keep the streak alive
            </h2>

            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-150">
              Pick your next sheet, mark problems as you solve them, and watch
              your weak topics turn into strengths.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in-up animation-delay-300">
              {/* Primary action – most likely next step */}
              <Button
                size="lg"
                className={cn(
                  "group relative h-12 px-9 text-base font-medium",
                  "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600",
                  "hover:from-amber-500 hover:via-amber-400 hover:to-orange-500",
                  "shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40",
                  "transition-all duration-400 hover:scale-[1.02] active:scale-[0.98]",
                )}
                asChild
              >
                <Link href="/sheets/featured">
                  <span className="relative z-10">
                    Continue where you left off
                  </span>
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                </Link>
              </Button>

              {/* Secondary action – discovery oriented */}
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "h-12 px-8 border-amber-700/60 text-amber-300 hover:text-amber-200",
                  "hover:bg-amber-950/40 hover:border-amber-600/60",
                  "transition-all duration-300 group",
                )}
                asChild
              >
                <Link href="/sheets?sort=popular">
                  Discover trending sheets
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Optional subtle progress hint – if you have user stats */}
            {/* Uncomment if you pass user data */}
            {/* <div className="mt-10 text-sm text-neutral-500 animate-fade-in-up animation-delay-500">
        You’ve solved <span className="text-amber-400 font-medium">142</span> problems across <span className="text-amber-400 font-medium">4</span> sheets this month.
      </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}
