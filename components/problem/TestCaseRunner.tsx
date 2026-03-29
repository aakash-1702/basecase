"use client";

import React from "react";
import { Loader2 } from "lucide-react";

type ActiveTab = "testcase" | "output";

type RunOutput = {
  stdout: string | null;
  outputType: "success" | "error";
  errorType: "Compile Error" | "Runtime Error" | null;
};

type SubmitOutput = {
  accepted: boolean;
  passed: number;
  total: number;
  compileError?: string | null;
  results: Array<{
    passed: boolean;
    isPublic: boolean;
    input: string | null;
    displayInput: string | null;
    expected: string | null;
    displayOutput: string | null;
    got: string | null;
    status: string;
    error: string | null;
  }>;
};

type TestCaseRunnerProps = {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  runOutput: RunOutput | null;
  submitOutput: SubmitOutput | null;
  running: boolean;
  submitting: boolean;
  stdinValue: string;
  setStdinValue: (value: string) => void;
};

export default function TestCaseRunner({
  activeTab,
  setActiveTab,
  runOutput,
  submitOutput,
  running,
  submitting,
  stdinValue,
  setStdinValue,
}: TestCaseRunnerProps) {
  return (
    <>
      <div
        style={{
          height: 36,
          borderBottom: "1px solid #1c1f26",
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {(["testcase", "output"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 5,
                border:
                  activeTab === tab
                    ? "1px solid rgba(249,115,22,0.3)"
                    : "1px solid transparent",
                background:
                  activeTab === tab ? "rgba(249,115,22,0.1)" : "transparent",
                color: activeTab === tab ? "#f97316" : "#4b5563",
                cursor: "pointer",
                transition: "all 180ms ease-out",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div>
          {activeTab === "output" && runOutput && !submitOutput && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: 4,
                display: "inline-block",
                ...(runOutput.outputType === "success"
                  ? {
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      color: "#10b981",
                    }
                  : {
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#ef4444",
                    }),
              }}
            >
              {runOutput.outputType === "success"
                ? "Accepted"
                : runOutput.errorType || "Error"}
            </span>
          )}
          {activeTab === "output" && submitOutput && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: "#6b7280",
              }}
            >
              {submitOutput.passed}/{submitOutput.total} passed
            </span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {activeTab === "testcase" ? (
          <div>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#4b5563",
                display: "block",
                marginBottom: 8,
              }}
            >
              Input
            </span>
            <textarea
              value={stdinValue}
              onChange={(e) => setStdinValue(e.target.value)}
              style={{
                width: "100%",
                minHeight: 80,
                resize: "vertical",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "10px 12px",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: "#c9d1e0",
                lineHeight: 1.6,
                outline: "none",
                transition: "border-color 200ms",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            />
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: "#374151",
                fontStyle: "italic",
                marginTop: 6,
              }}
            >
              Edit input above to test custom cases
            </p>
          </div>
        ) : (
          <div>
            {(running || submitting) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "24px 0",
                  color: "#4b5563",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                }}
              >
                <Loader2 size={13} className="spin" />{" "}
                {submitting ? "Submitting…" : "Running…"}
              </div>
            )}

            {!running && !submitting && !runOutput && !submitOutput && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 0",
                  color: "#374151",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontStyle: "italic",
                }}
              >
                Run your code to see output here
              </div>
            )}

            {!running && runOutput && !submitOutput && (
              <div>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: 4,
                    display: "inline-block",
                    marginBottom: 10,
                    ...(runOutput.outputType === "success"
                      ? {
                          background: "rgba(16,185,129,0.1)",
                          border: "1px solid rgba(16,185,129,0.25)",
                          color: "#10b981",
                        }
                      : {
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          color: "#ef4444",
                        }),
                  }}
                >
                  {runOutput.outputType === "success"
                    ? "Accepted"
                    : runOutput.errorType || "Error"}
                </span>
                <pre
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    lineHeight: 1.6,
                    color:
                      runOutput.outputType === "success"
                        ? "#10b981"
                        : "#ef4444",
                    whiteSpace: "pre-wrap",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {runOutput.stdout || "(no output)"}
                </pre>
              </div>
            )}

            {!submitting && submitOutput && (
              <div>
                {submitOutput.compileError && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.05)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      marginBottom: 12,
                    }}
                  >
                    <pre
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        color: "#ef4444",
                        whiteSpace: "pre-wrap",
                        margin: 0,
                      }}
                    >
                      {submitOutput.compileError}
                    </pre>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: submitOutput.accepted ? "#10b981" : "#ef4444",
                    }}
                  >
                    {submitOutput.accepted ? "Accepted" : "Wrong Answer"}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      color: "#6b7280",
                    }}
                  >
                    {submitOutput.passed} / {submitOutput.total} passed
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {submitOutput.results.map((r, i) => (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: r.passed ? "#10b981" : "#ef4444",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10,
                            color: r.passed ? "#10b981" : "#ef4444",
                          }}
                        >
                          {r.isPublic ? `Test ${i + 1}` : "Hidden test"} -{" "}
                          {r.passed
                            ? "Accepted"
                            : r.isPublic
                              ? r.status
                              : "Failed"}
                        </span>
                      </div>
                      {!r.passed && r.isPublic && (
                        <div style={{ paddingLeft: 14, marginTop: 4 }}>
                          <p
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 10,
                              color: "#6b7280",
                              margin: "2px 0",
                            }}
                          >
                            Input: {r.displayInput || r.input || "-"}
                          </p>
                          <p
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 10,
                              color: "#6b7280",
                              margin: "2px 0",
                            }}
                          >
                            Expected: {r.displayOutput || r.expected || "-"}
                          </p>
                          <p
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 10,
                              color: "#ef4444",
                              margin: "2px 0",
                            }}
                          >
                            Got: {r.got || "-"}
                          </p>
                        </div>
                      )}
                      {!r.passed && !r.isPublic && (
                        <p
                          style={{
                            paddingLeft: 14,
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10,
                            color: "#4b5563",
                            marginTop: 4,
                          }}
                        >
                          A hidden test case is failing. Check edge cases.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
