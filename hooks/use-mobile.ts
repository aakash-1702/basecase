import * as React from "react";

// Defines the threshold width (in pixels) for what constitutes a "mobile" screen size
const MOBILE_BREAKPOINT = 768;

/**
 * Custom React hook that evaluates whether the current viewport width is below the mobile breakpoint.
 * It leverages `window.matchMedia` and resize event listeners to keep track of screen width changes.
 *
 * @returns {boolean} `true` if viewport width < `MOBILE_BREAKPOINT`, otherwise `false`.
 * Note: initially returns `false` (via `!!undefined`) on first render before client hooks run.
 */
export function useIsMobile() {
  // Local state to store whether we are currently displaying on mobile.
  // We start as undefined to avoid hydration mismatches between server and client.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Media query string setup (e.g., max-width 767px) to listen for browser resize across this breakpoint.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Callback function that will fire whenever the media query state changes (crossing the breakpoint).
    // Uses window.innerWidth strictly as the source of truth for immediate evaluation.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Attach listener for dynamic viewport resizing events
    mql.addEventListener("change", onChange);

    // Immediate evaluation once component has mounted on the client-side
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup: remove standard standard listener when the component using this hook unmounts
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array ensures this effect merely sets up listeners once on mount.

  // Converts the internal state boolean to a strict boolean (double negation).
  return !!isMobile;
}
