"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("bc_announcement_dismissed_v3");
    if (stored !== "1") {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("bc_announcement_dismissed_v3", "1");
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      className="animate-slide-in-top relative flex items-center justify-center gap-2 px-12 py-2"
      style={{
        background: "rgba(240, 90, 40, 0.1)",
        borderBottom: "1px solid rgba(240, 90, 40, 0.2)",
        minHeight: 36,
        zIndex: 200,
      }}
    >
      <span className="text-xs sm:text-sm text-center" style={{ color: "#f05a28" }}>
        🎉&nbsp; BaseCase is now open source — Star us on GitHub and help us
        grow
      </span>
      <a
        href="https://github.com/aakash-1702/basecase"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ color: "#f05a28" }}
      >
        <ArrowRight className="w-3 h-3" />
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all hover:bg-white/10"
        style={{ color: "rgba(240, 90, 40, 0.8)", zIndex: 201 }}
        aria-label="Dismiss announcement"
        type="button"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
