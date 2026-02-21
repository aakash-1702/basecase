// components/PageChange.tsx  (or PaginationControls.tsx)
"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils"; // ← shadcn/ui cn helper

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  // Helper to generate visible page numbers (with ellipsis logic)
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    pages.push(1);

    // Ellipsis before current range if needed
    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    // Show pages around current
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    // Ellipsis after current range if needed
    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    // Always show last page if more than 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <Pagination className={cn("mt-8", className)}>
      <PaginationContent className="flex-wrap justify-center gap-2 sm:gap-1.5">
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={cn(
              "border border-neutral-700 text-neutral-300 hover:bg-amber-950/40 hover:text-amber-300 hover:border-amber-700/50",
              "transition-all duration-200",
              currentPage === 1 && "opacity-50 pointer-events-none"
            )}
          />
        </PaginationItem>

        {/* Page numbers */}
        {pages.map((page, idx) => (
          <PaginationItem key={idx}>
            {page === "ellipsis" ? (
              <PaginationEllipsis className="text-neutral-500" />
            ) : (
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Number(page));
                }}
                className={cn(
                  "border border-neutral-700 text-neutral-300 hover:bg-amber-950/40 hover:text-amber-300 hover:border-amber-600/60",
                  "transition-all duration-200 min-w-[2.5rem] h-10",
                  page === currentPage &&
                    "bg-gradient-to-r from-amber-600/30 to-orange-600/20 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-900/40 font-semibold",
                  "focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                )}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={cn(
              "border border-neutral-700 text-neutral-300 hover:bg-amber-950/40 hover:text-amber-300 hover:border-amber-700/50",
              "transition-all duration-200",
              currentPage === totalPages && "opacity-50 pointer-events-none"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}