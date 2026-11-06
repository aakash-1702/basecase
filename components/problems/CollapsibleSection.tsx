"use client";

import { memo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  rightExtra?: ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  /** Mount children on first open instead of eagerly (for heavy content). */
  lazy?: boolean;
  children: ReactNode;
}

/**
 * Collapsible card animated purely in CSS (`grid-template-rows: 0fr → 1fr`),
 * so there is no scrollHeight measuring or state syncing on every render.
 */
const CollapsibleSection = memo(function CollapsibleSection({
  id,
  icon,
  title,
  rightExtra,
  isOpen,
  onToggle,
  lazy = false,
  children,
}: CollapsibleSectionProps) {
  // Once the header has been used, keep lazy content mounted across toggles.
  const [touched, setTouched] = useState(false);
  const mounted = !lazy || isOpen || touched;
  const contentId = `${id}-content`;

  return (
    <section
      id={id}
      className="card-base animate-fade-in overflow-hidden transition-colors hover:border-accent/20"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => {
          setTouched(true);
          onToggle(id);
        }}
        className="flex w-full items-center justify-between px-[22px] py-[18px] text-left transition-colors hover:bg-fg/[0.02]"
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex transition-colors",
              isOpen ? "text-accent" : "text-fg-muted",
            )}
          >
            {icon}
          </span>
          <span
            className={cn(
              "font-mono text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors",
              isOpen ? "text-fg-secondary" : "text-fg-muted",
            )}
          >
            {title}
          </span>
        </span>
        <span className="flex items-center gap-2">
          {rightExtra}
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-300",
              isOpen ? "rotate-180 text-accent" : "text-fg-muted",
            )}
          />
        </span>
      </button>

      <div
        id={contentId}
        inert={!isOpen}
        className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line px-[22px] pb-[22px] pt-5">
            {mounted ? children : null}
          </div>
        </div>
      </div>
    </section>
  );
});

export default CollapsibleSection;
