"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { BeforeMount, EditorProps, OnMount } from "@monaco-editor/react";

const SKELETON_WIDTHS = [62, 38, 50, 26, 46, 34, 58];

/** Lightweight placeholder shown while the Monaco bundle boots. */
function EditorSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col gap-3 bg-surface p-6"
      aria-busy="true"
      aria-label="Loading editor"
    >
      {SKELETON_WIDTHS.map((w, i) => (
        <div key={i} className="skeleton h-3" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// Client-only: Monaco touches `window`/`self` at import time.
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> },
);

const LOADING_NODE = <EditorSkeleton />;
const THEME_LIGHT = "basecase-paper";
const THEME_DARK = "basecase-dark";

// Module-level constant: `@monaco-editor/react` calls `editor.updateOptions`
// every time this object changes identity, so it must never be inline.
const EDITOR_OPTIONS: NonNullable<EditorProps["options"]> = {
  fontSize: 13,
  lineHeight: 22,
  fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 14, bottom: 14 },
  cursorBlinking: "smooth",
  smoothScrolling: true,
  renderLineHighlight: "gutter",
  automaticLayout: true,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
};

/** Paper (light) + warm dark themes matching the tokens in globals.css. */
const defineThemes: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(THEME_LIGHT, {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b645a", fontStyle: "italic" },
      { token: "keyword", foreground: "2b4c7e" },
      { token: "string", foreground: "1f7a4f" },
      { token: "number", foreground: "b36b00" },
      { token: "type", foreground: "7a3558" },
      { token: "type.identifier", foreground: "7a3558" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#2a2622",
      "editorGutter.background": "#ffffff",
      "editorLineNumber.foreground": "#b9b0a0",
      "editorLineNumber.activeForeground": "#6b645a",
      "editor.lineHighlightBackground": "#fbf8f1",
      "editor.lineHighlightBorder": "#00000000",
      "editorCursor.foreground": "#e4572e",
      "editor.selectionBackground": "#f3d36b80",
      "editor.inactiveSelectionBackground": "#f3d36b40",
      "editorIndentGuide.background1": "#efe9dc",
      "editorIndentGuide.activeBackground1": "#d9d2c3",
      "editorBracketMatch.border": "#e4572e80",
      "editorBracketMatch.background": "#e4572e1a",
      "editorWidget.background": "#fbf8f1",
      "editorWidget.border": "#d9d2c3",
      "editorSuggestWidget.background": "#fbf8f1",
      "editorSuggestWidget.selectedBackground": "#e4572e22",
      "editorHoverWidget.background": "#fbf8f1",
      "scrollbarSlider.background": "#14110f1f",
      "scrollbarSlider.hoverBackground": "#14110f38",
      "scrollbarSlider.activeBackground": "#14110f4d",
      "scrollbar.shadow": "#00000000",
      focusBorder: "#e4572e80",
    },
  });
  monaco.editor.defineTheme(THEME_DARK, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "968f82", fontStyle: "italic" },
      { token: "keyword", foreground: "8db4f0" },
      { token: "string", foreground: "7fd1a3" },
      { token: "number", foreground: "f0b45a" },
      { token: "type", foreground: "c583a6" },
      { token: "type.identifier", foreground: "c583a6" },
    ],
    colors: {
      "editor.background": "#1f1b17",
      "editor.foreground": "#d8d2c6",
      "editorGutter.background": "#1f1b17",
      "editorLineNumber.foreground": "#5c554b",
      "editorLineNumber.activeForeground": "#968f82",
      "editor.lineHighlightBackground": "#27221e",
      "editor.lineHighlightBorder": "#00000000",
      "editorCursor.foreground": "#ff6b3d",
      "editor.selectionBackground": "#ff6b3d40",
      "editor.inactiveSelectionBackground": "#ff6b3d20",
      "editorIndentGuide.background1": "#2e2923",
      "editorIndentGuide.activeBackground1": "#46403a",
      "editorBracketMatch.border": "#ff6b3d80",
      "editorBracketMatch.background": "#ff6b3d20",
      "editorWidget.background": "#27221e",
      "editorWidget.border": "#2e2923",
      "editorSuggestWidget.background": "#27221e",
      "editorSuggestWidget.selectedBackground": "#ff6b3d26",
      "editorHoverWidget.background": "#27221e",
      "scrollbarSlider.background": "#f2eee41f",
      "scrollbarSlider.hoverBackground": "#f2eee438",
      "scrollbarSlider.activeBackground": "#f2eee44d",
      "scrollbar.shadow": "#00000000",
      focusBorder: "#ff6b3d80",
    },
  });
};

export interface CodeEditorProps {
  /** Initial contents. The editor is uncontrolled afterwards – read the latest value via `onChange`. */
  defaultValue?: string;
  language: string;
  onChange?: (value: string) => void;
  /** Invoked on Cmd/Ctrl+Enter inside the editor. */
  onRun?: () => void;
  className?: string;
}

/**
 * Monaco wrapper that never re-mounts or re-subscribes on parent renders:
 * options / loading node are module constants and callbacks go through refs.
 */
const CodeEditor = memo(function CodeEditor({
  defaultValue = "// Start coding here",
  language,
  onChange,
  onRun,
  className,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
  });

  const handleChange = useCallback((value: string | undefined) => {
    onChangeRef.current?.(value ?? "");
  }, []);

  const handleMount = useCallback<OnMount>((editor, monaco) => {
    // Use the next/font JetBrains Mono face (exposed as a CSS variable on <body>).
    const family = getComputedStyle(document.body)
      .getPropertyValue("--font-jetbrains-mono")
      .trim();
    if (family) {
      editor.updateOptions({
        fontFamily: `${family}, 'JetBrains Mono', ui-monospace, monospace`,
      });
      document.fonts?.ready
        .then(() => monaco.editor.remeasureFonts())
        .catch(() => {});
    }
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
      onRunRef.current?.(),
    );
  }, []);

  return (
    <MonacoEditor
      height="100%"
      className={className}
      defaultValue={defaultValue}
      language={language}
      theme={resolvedTheme === "dark" ? THEME_DARK : THEME_LIGHT}
      options={EDITOR_OPTIONS}
      beforeMount={defineThemes}
      onMount={handleMount}
      onChange={handleChange}
      loading={LOADING_NODE}
    />
  );
});

export default CodeEditor;
