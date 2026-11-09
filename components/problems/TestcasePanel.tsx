"use client";

import { memo, useCallback, type ChangeEvent } from "react";

interface TestcasePanelProps {
  value: string;
  onChange: (value: string) => void;
}

const TestcasePanel = memo(function TestcasePanel({
  value,
  onChange,
}: TestcasePanelProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
    [onChange],
  );

  return (
    <div>
      <label
        htmlFor="pp-stdin"
        className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-fg-muted"
      >
        Input
      </label>
      <textarea
        id="pp-stdin"
        value={value}
        onChange={handleChange}
        spellCheck={false}
        className="input-base h-auto min-h-20 resize-y rounded-lg bg-fg/[0.02] px-3 py-2.5 font-mono text-xs leading-relaxed"
      />
      <p className="mt-1.5 font-mono text-[9px] italic text-fg-dim">
        Edit input above to test custom cases
      </p>
    </div>
  );
});

export default TestcasePanel;
