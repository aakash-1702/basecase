// components/PageChange.tsx — pagination controls themed with design-system tokens
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

type PageToken = number | "ellipsis";

/** 1 … (current-1) current (current+1) … last */
function getPageNumbers(currentPage: number, totalPages: number): PageToken[] {
  const pages: PageToken[] = [1];

  if (currentPage > 3) pages.push("ellipsis");

  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("ellipsis");

  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

const pageBtn =
  "btn btn-secondary btn-sm min-w-9 px-2.5 font-mono text-xs tabular-nums";

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const pages = getPageNumbers(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Go to previous page"
        disabled={isFirst}
        onClick={() => !isFirst && onPageChange(currentPage - 1)}
        className={cn(pageBtn, "px-3 font-sans")}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {pages.map((page, idx) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            aria-hidden
            className="px-1 font-mono text-xs text-fg-muted"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Go to page ${page}`}
            onClick={() => onPageChange(page)}
            className={cn(
              pageBtn,
              page === currentPage &&
                "border-accent/40 bg-accent-soft text-accent-hover hover:border-accent/40 hover:bg-accent-soft",
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Go to next page"
        disabled={isLast}
        onClick={() => !isLast && onPageChange(currentPage + 1)}
        className={cn(pageBtn, "px-3 font-sans")}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
