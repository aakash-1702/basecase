"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

/** sonner toaster that follows the active (paper / dark) theme. */
export default function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "var(--font-sans)",
          borderRadius: 8,
        },
      }}
    />
  );
}
