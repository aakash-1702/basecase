"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};

/** Light (paper) ⇄ dark toggle. Renders a neutral placeholder until mounted
 *  so server and client markup match. */
export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // true after hydration, false during SSR — no setState-in-effect needed
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface-2 text-fg-secondary transition-colors hover:border-accent/50 hover:text-accent",
        className,
      )}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
