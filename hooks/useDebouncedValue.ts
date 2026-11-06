"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stopped changing for `delay` ms.
 * Use it to debounce the *value* that drives a fetch instead of the fetch
 * itself, so a request is only made for the settled input.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
