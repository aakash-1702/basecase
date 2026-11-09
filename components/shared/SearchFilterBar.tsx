"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  placeholder: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  width?: string;
}

/**
 * Sticky search + select filter row used across list pages.
 * No backdrop-filter: uses a solid surface so scrolling stays cheap.
 */
export default function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  sticky = true,
  className,
  trailing,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  sticky?: boolean;
  className?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-b border-line bg-bg/95",
        sticky && "sticky top-14 z-30",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <label className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-base h-10 pl-9"
          />
        </label>

        {(filters.length > 0 || trailing) && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <Select key={f.key} value={f.value} onValueChange={f.onChange}>
                <SelectTrigger
                  className={cn("h-10 bg-surface border-line-strong", f.width ?? "w-36")}
                >
                  <SelectValue placeholder={f.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}
