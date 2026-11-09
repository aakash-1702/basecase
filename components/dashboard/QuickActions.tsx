import Link from "next/link";
import { Code2, LayoutList, Mic, RotateCcw } from "lucide-react";
import GlowCard from "@/components/shared/GlowCard";

const QUICK_LINKS = [
  { icon: LayoutList, label: "My sheets", href: "/sheets" },
  { icon: Code2, label: "Problems", href: "/problems" },
  { icon: Mic, label: "Interview", href: "/interview" },
  { icon: RotateCcw, label: "Revisions", href: "/dashboard#revision" },
] as const;

export default function QuickActions() {
  return (
    <GlowCard hover={false} padding="sm">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
        Quick jump
      </span>
      <nav aria-label="Quick links" className="mt-3 grid grid-cols-2 gap-2">
        {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="btn btn-secondary btn-sm justify-start gap-2 px-3 font-medium text-fg-secondary hover:text-fg"
          >
            <Icon className="h-3.5 w-3.5 text-accent" />
            {label}
          </Link>
        ))}
      </nav>
    </GlowCard>
  );
}
