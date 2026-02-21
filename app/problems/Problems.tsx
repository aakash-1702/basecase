// app/problems/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { Search, Filter, Code2 } from "lucide-react";
import ProblemsTable from "@/components/problems/ProblemsTable";
import PaginationControls from "@/components/PageChange";
import { ConfidenceLevel } from "@/components/problems/UpdateProgressDialog";
import { ConfigExtension } from "tailwind-merge";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/problems?page=${pagination.page}&limit=5&difficulty=${difficultyFilter}&status=${statusFilter}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );

        if (!res.ok) {
          const err = await res.json();
          alert(err.message);
          return;
        }

        const json = await res.json();

        setProblems(json.data?.problems || []);
        setPagination({
          page: json.data?.pagination?.page || 1,
          totalPages: json.data?.pagination?.totalPages || 1,
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unable to fetch problems");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [pagination.page, difficultyFilter, statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // ✅ Fixed: all three callbacks now wired up — call your API here to persist
  // const handleConfidenceChange = async (problemId: string, confidence: ConfidenceLevel) => {
  //   try {
  //     await fetch(`/api/problems/${problemId}/progress`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({ confidence }),
  //     });
  //   } catch (err) {
  //     console.error("Failed to save confidence:", err);
  //   }
  // };

  // const handleSolvedToggle = async (problemId: string, solved: boolean) => {
  //   try {
  //     await fetch(`/api/problems/${problemId}/progress`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({ solved }),
  //     });
  //   } catch (err) {
  //     console.error("Failed to save solved state:", err);
  //   }
  // };

  // const handleSaveNotes = async (problemId: string, notes: string) => {
  //   try {
  //     await fetch(`/api/problems/${problemId}/progress`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({ notes }),
  //     });
  //   } catch (err) {
  //     console.error("Failed to save notes:", err);
  //   }
  // };

  /* 
    i would be adding one single call to update the progress of the problem for the user
  */
 const handleSave = async(problemId : string, confidence : ConfidenceLevel , notes : string , solved : boolean) => {
    try {
      const res = await fetch(`/api/problems/${problemId}/progress`,{
        method : "PATCH",
        headers : {
          "Content-type" : "application/json",
        },
        credentials : "include",
        body : JSON.stringify({confidence , notes , solved})
      }) ;
      
      if(!res.ok){
        const err = await res.json();
        console.log("Error saving changes",err);
        alert(err.message);
        return;
      }

      const json = await res.json();

      alert("Changes saved successfully");
      return;
      
    } catch (error) {
      console.log("Error saving changes ",error);
      alert("Unable to mark the problem as solved");
      return;
    }
 }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 border-b border-neutral-800/50 overflow-hidden">
        <div className="absolute left-1/2 top-0 -z-10 h-96 w-[800px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl opacity-70 pointer-events-none animate-pulse" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Master{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                DSA
              </span>{" "}
              Problems
            </h1>
            <p className="mt-5 text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto">
              Handpicked problems • Real interview patterns • Track your
              progress • Crack top tech interviews with confidence
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Badge
                variant="outline"
                className="bg-amber-950/40 border-amber-700/40 text-amber-300 px-4 py-1.5 text-base"
              >
                1,200+ Problems
              </Badge>
              <Badge
                variant="outline"
                className="bg-amber-950/40 border-amber-700/40 text-amber-300 px-4 py-1.5 text-base"
              >
                85% Solved by Top 1%
              </Badge>
              <Badge
                variant="outline"
                className="bg-amber-950/40 border-amber-700/40 text-amber-300 px-4 py-1.5 text-base"
              >
                Updated Daily
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-neutral-800/40 bg-neutral-950/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search problems (e.g. two sum, sliding window...)"
                className="pl-10 bg-neutral-900 border-neutral-700 focus:border-amber-500/50 focus:ring-amber-500/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-36 bg-neutral-900 border-neutral-700">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-neutral-900 border-neutral-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="solved">Solved</SelectItem>
                  <SelectItem value="unsolved">Unsolved</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="border-amber-600/50 text-amber-300 hover:bg-amber-950/40"
              >
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Table + Pagination */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 min-h-[400px]">
          {loading ? (
            <div className="py-20 text-center text-neutral-400 animate-pulse">
              Loading problems...
            </div>
          ) : error ? (
            <div className="py-20 text-center text-rose-400">{error}</div>
          ) : (
            <>
              {/* ✅ Fixed: all three callbacks now passed in */}
              <ProblemsTable
                problems={problems}
                onSaveChanges = {handleSave}
              />

              {pagination.totalPages > 1 && (
                <PaginationControls
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  className="mt-10"
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-neutral-800/40 bg-gradient-to-b from-neutral-950 to-amber-950/10">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to <span className="text-amber-500">Level Up</span>?
          </h2>
          <p className="text-lg text-neutral-400 mb-8">
            Start solving curated problems and track real progress toward your
            dream offer.
          </p>
          <Button
            size="lg"
            className="h-12 px-10 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-900/30 hover:scale-[1.02] transition-all"
          >
            Start Practicing Now
            <Code2 className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}