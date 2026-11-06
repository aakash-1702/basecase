"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

/** three.js is ~150 KB gzipped — load it after the page is interactive. */
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => null });

let webglSupport: boolean | null = null;
function canRenderScene() {
  if (webglSupport === null) {
    try {
      const c = document.createElement("canvas");
      const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
      webglSupport =
        Boolean(c.getContext("webgl2") || c.getContext("webgl")) && !nav.connection?.saveData;
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
const subscribeNoop = () => () => {};

export default function HeroSceneLazy({ className }: { className?: string }) {
  // false on the server, real capability check after hydration. Only mount the
  // canvas when WebGL exists and the user isn't on a data-saver connection.
  const enabled = useSyncExternalStore(subscribeNoop, canRenderScene, () => false);
  const { resolvedTheme } = useTheme();

  if (!enabled) return null;
  return <HeroScene className={className} dark={resolvedTheme === "dark"} />;
}
