"use client";

import { memo } from "react";
import { Bot, Lightbulb, StickyNote, Terminal, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionId } from "./types";

const ITEMS: ReadonlyArray<{ id: SectionId; label: string; Icon: LucideIcon }> = [
  { id: "editorial", label: "Editorial", Icon: Terminal },
  { id: "hints", label: "Hints", Icon: Lightbulb },
  { id: "notes", label: "Notes", Icon: StickyNote },
  { id: "ai-mentor", label: "AI Mentor", Icon: Bot },
];

interface ProblemSectionNavProps {
  open: Record<SectionId, boolean>;
  isPremium: boolean;
  onOpen: (id: SectionId) => void;
}

const ProblemSectionNav = memo(function ProblemSectionNav({
  open,
  isPremium,
  onOpen,
}: ProblemSectionNavProps) {
  return (
    <nav
      aria-label="Problem sections"
      className="shrink-0 border-b border-line bg-surface px-7"
    >
      <div className="flex items-center gap-1.5 py-2.5">
        {ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id)}
            className={cn(
              "btn btn-sm",
              open[id] ? "btn-outline-accent" : "btn-ghost",
            )}
          >
            <Icon size={14} />
            <span>{label}</span>
            {id === "ai-mentor" && !isPremium && (
              <span className="chip chip-accent px-1.5 py-0 text-[9px] uppercase">
                Plus
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
});

export default ProblemSectionNav;
