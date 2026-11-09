"use client";

import { memo, useCallback, useRef, useState, type ChangeEvent } from "react";
import { FileText, Loader2, Play, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import CodeEditor from "./CodeEditor";
import ResizableSplit from "./ResizableSplit";
import TestcasePanel from "./TestcasePanel";
import ResultsPanel, { VerdictChip } from "./ResultsPanel";
import { LANGUAGE_OPTIONS, fileExtension, initialStdin } from "./problem-utils";
import type {
  EditorLanguage,
  IoTab,
  RunOutput,
  SubmitOutput,
  SubmitResultItem,
  TestCase,
} from "./types";

const DEFAULT_CODE = "// Start coding here";
const IO_TABS: readonly IoTab[] = ["testcase", "output"];
const JSON_HEADERS = { "Content-Type": "application/json" };

interface ExecuteResponse {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  status?: string;
  error?: string;
  message?: string;
}

interface RawSubmitResult {
  passed?: boolean;
  isPublic?: boolean;
  input?: string | null;
  displayInput?: string | null;
  expected?: string | null;
  displayOutput?: string | null;
  got?: string | null;
  status?: string;
  error?: string | null;
}

interface SubmitResponse {
  accepted?: boolean;
  compileError?: string | null;
  total?: number;
  results?: RawSubmitResult[];
  message?: string;
}

export interface AcceptedSummary {
  passed: number;
  total: number;
}

interface EditorPanelProps {
  slug: string;
  testCases: TestCase[];
  onAccepted: (summary: AcceptedSummary) => void;
}

/**
 * Right pane: toolbar + Monaco + resizable test-case / output strip.
 * Owns all execution state so typing in the editor never re-renders the page.
 */
const EditorPanel = memo(function EditorPanel({
  slug,
  testCases,
  onAccepted,
}: EditorPanelProps) {
  const [language, setLanguage] = useState<EditorLanguage>("cpp");
  const [stdin, setStdin] = useState(() => initialStdin(testCases));
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<IoTab>("testcase");
  const [runOutput, setRunOutput] = useState<RunOutput | null>(null);
  const [submitOutput, setSubmitOutput] = useState<SubmitOutput | null>(null);

  // Latest inputs live in refs: Run/Submit never close over stale values and
  // Monaco keystrokes don't touch React state at all.
  const codeRef = useRef(DEFAULT_CODE);
  const langRef = useRef<EditorLanguage>("cpp");
  const stdinRef = useRef(stdin);
  const busyRef = useRef(false);

  const handleCodeChange = useCallback((value: string) => {
    codeRef.current = value;
  }, []);

  const handleLanguageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value as EditorLanguage;
      langRef.current = next;
      setLanguage(next);
    },
    [],
  );

  const handleStdinChange = useCallback((value: string) => {
    stdinRef.current = value;
    setStdin(value);
  }, []);

  const handleRun = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setRunning(true);
    setRunOutput(null);
    setSubmitOutput(null);
    setActiveTab("output");

    const fail = (stdout: string, errorType: RunOutput["errorType"]) =>
      setRunOutput({ stdout, outputType: "error", errorType });

    try {
      const res = await fetch(`/api/problems/${slug}/problem/execute`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          code: codeRef.current,
          language: langRef.current,
          stdin: stdinRef.current,
        }),
      });
      const data: ExecuteResponse = await res.json();

      if (data.error) {
        fail(data.error, "Runtime Error");
        return;
      }
      if (!res.ok) {
        fail(data.message || "Execution failed", "Runtime Error");
        return;
      }

      const status = (data.status || "").toLowerCase();
      if (status.includes("compilation error")) {
        fail(data.compile_output || "Compilation failed", "Compile Error");
      } else if (
        status.includes("error") ||
        status.includes("time limit") ||
        status.includes("memory limit")
      ) {
        fail(data.stderr || data.stdout || status, "Runtime Error");
      } else {
        setRunOutput({
          stdout: data.stdout ?? "",
          outputType: "success",
          errorType: null,
        });
      }
    } catch {
      fail("Something went wrong. Try again.", "Runtime Error");
    } finally {
      busyRef.current = false;
      setRunning(false);
    }
  }, [slug]);

  const handleSubmit = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setSubmitting(true);
    setRunOutput(null);
    setSubmitOutput(null);
    setActiveTab("output");

    try {
      const res = await fetch(`/api/problems/${slug}/problem/submit`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ code: codeRef.current, language: langRef.current }),
      });
      const data: SubmitResponse = await res.json();

      if (data.compileError || !res.ok) {
        setSubmitOutput({
          accepted: false,
          passed: 0,
          total: data.total || 0,
          compileError: data.compileError || data.message || "Submission failed",
          results: [],
        });
        return;
      }

      const results: SubmitResultItem[] = (data.results ?? []).map((r) => ({
        passed: Boolean(r.passed),
        isPublic: r.isPublic ?? true,
        input: r.input || null,
        displayInput: r.displayInput || null,
        expected: r.expected || null,
        displayOutput: r.displayOutput || null,
        got: r.got || null,
        status: r.status || (r.passed ? "Accepted" : "Wrong Answer"),
        error: r.error || null,
      }));
      const passed = results.filter((r) => r.passed).length;
      const output: SubmitOutput = {
        accepted: data.accepted ?? passed === results.length,
        passed,
        total: results.length,
        results,
      };
      setSubmitOutput(output);
      if (output.accepted) onAccepted({ passed, total: results.length });
    } catch {
      setSubmitOutput({
        accepted: false,
        passed: 0,
        total: 0,
        compileError: "Something went wrong. Try again.",
        results: [],
      });
    } finally {
      busyRef.current = false;
      setSubmitting(false);
    }
  }, [slug, onAccepted]);

  const busy = running || submitting;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-fg/[0.04] px-[18px]">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-fg-muted" />
          <span className="font-mono text-[11px] text-fg-muted">
            solution.{fileExtension(language)}
          </span>
          <select
            aria-label="Language"
            value={language}
            onChange={handleLanguageChange}
            className="input-base h-7 w-auto rounded-md border-line bg-fg/[0.03] px-2.5 py-0 font-mono text-[11px] text-fg-secondary hover:border-accent/30"
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={busy}
            title="Run (⌘↵)"
            className="btn btn-sm border border-success/25 bg-success/10 font-mono text-[11px] text-success hover:bg-success/15"
          >
            {running ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            {running ? "Running…" : "Run"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="btn btn-sm btn-primary font-mono text-[11px]"
          >
            {submitting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Zap size={12} />
            )}
            {submitting ? "Submitting…" : "Submit"}
          </button>
          <kbd className="ml-1 font-mono text-[9px] text-fg-muted/60">⌘↵</kbd>
        </div>
      </div>

      <ResizableSplit
        initialSize={220}
        minSize={100}
        maxRatio={0.6}
        bottomClassName="bg-fg/[0.03]"
        top={
          <CodeEditor
            defaultValue={DEFAULT_CODE}
            language={language}
            onChange={handleCodeChange}
            onRun={handleRun}
          />
        }
        bottom={
          <>
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-line px-3.5">
              <div className="flex gap-1.5" role="tablist" aria-label="Editor panels">
                {IO_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "rounded-md border px-2.5 py-[3px] font-mono text-[9px] font-bold uppercase transition-colors",
                      activeTab === tab
                        ? "border-accent/30 bg-accent-soft text-accent"
                        : "border-transparent text-fg-muted hover:text-fg-secondary",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div>
                {activeTab === "output" && runOutput && !submitOutput && (
                  <VerdictChip output={runOutput} />
                )}
                {activeTab === "output" && submitOutput && (
                  <span className="font-mono text-[10px] text-fg-muted">
                    {submitOutput.passed}/{submitOutput.total} passed
                  </span>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
              {activeTab === "testcase" ? (
                <TestcasePanel value={stdin} onChange={handleStdinChange} />
              ) : (
                <ResultsPanel
                  running={running}
                  submitting={submitting}
                  runOutput={runOutput}
                  submitOutput={submitOutput}
                />
              )}
            </div>
          </>
        }
      />
    </div>
  );
});

export default EditorPanel;
