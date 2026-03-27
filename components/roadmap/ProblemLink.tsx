"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemLinkProps {
  slug: string;
  isSolved: boolean;
  isAuthenticated: boolean;
}

export function ProblemLink({
  slug,
  isSolved,
  isAuthenticated,
}: ProblemLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/auth/sign-in");
    }
  };

  return (
    <Link
      href={`/problems/${slug}`}
      onClick={handleClick}
      className={cn(
        "group/link inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
        "transition-all duration-300",
        isSolved
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50"
          : "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/40",
      )}
    >
      {isSolved ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <Circle className="h-3 w-3 transition-all duration-300 group-hover/link:text-amber-400" />
      )}
      <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">
        {slug}
      </span>
    </Link>
  );
}
