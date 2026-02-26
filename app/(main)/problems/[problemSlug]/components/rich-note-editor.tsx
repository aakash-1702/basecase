"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Highlighter,
  Underline,
  Type,
} from "lucide-react";

interface RichNotesEditorProps {
  initialValue: string;
  onChange: (html: string) => void;
}

function isCommandActive(command: string): boolean {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

export function RichNotesEditor({
  initialValue,
  onChange,
}: RichNotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = initialValue || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const execCmd = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    try {
      document.execCommand(command, false, val ?? "");
    } catch (e) {
      console.warn(e);
    }
    setTick((n) => n + 1);
  }, []);

  const toggleHeading = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const node = sel.getRangeAt(0).commonAncestorContainer;
    const el =
      node.nodeType === 1 ? (node as Element) : (node as Text).parentElement;
    try {
      document.execCommand(
        "formatBlock",
        false,
        el?.closest("h3") ? "p" : "h3",
      );
    } catch (e) {
      console.warn(e);
    }
    setTick((n) => n + 1);
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChangeRef.current(editorRef.current.innerHTML);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!e.metaKey && !e.ctrlKey) return;
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        execCmd("bold");
      } else if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        execCmd("italic");
      }
    },
    [execCmd],
  );

  const refreshTick = useCallback(() => setTick((n) => n + 1), []);
  void tick;

  type Btn = {
    icon: React.ReactNode;
    label: string;
    onMouseDown: (e: React.MouseEvent) => void;
    active: boolean;
    dividerBefore?: boolean;
  };

  const TOOLBAR: Btn[] = [
    {
      icon: <Type className="h-3.5 w-3.5" />,
      label: "Heading",
      onMouseDown: (e) => {
        e.preventDefault();
        toggleHeading();
      },
      active: false,
    },
    {
      icon: <Bold className="h-3.5 w-3.5" />,
      label: "Bold",
      onMouseDown: (e) => {
        e.preventDefault();
        execCmd("bold");
      },
      active: isCommandActive("bold"),
    },
    {
      icon: <Italic className="h-3.5 w-3.5" />,
      label: "Italic",
      onMouseDown: (e) => {
        e.preventDefault();
        execCmd("italic");
      },
      active: isCommandActive("italic"),
    },
    {
      icon: <Underline className="h-3.5 w-3.5" />,
      label: "Underline",
      onMouseDown: (e) => {
        e.preventDefault();
        execCmd("underline");
      },
      active: isCommandActive("underline"),
    },
    {
      icon: <Highlighter className="h-3.5 w-3.5" />,
      label: "Highlight",
      onMouseDown: (e) => {
        e.preventDefault();
        execCmd("hiliteColor", "rgba(249,115,22,0.25)");
      },
      active: false,
      dividerBefore: true,
    },
    {
      icon: <List className="h-3.5 w-3.5" />,
      label: "Bullet List",
      onMouseDown: (e) => {
        e.preventDefault();
        execCmd("insertUnorderedList");
      },
      active: isCommandActive("insertUnorderedList"),
      dividerBefore: true,
    },
    {
      icon: <ListOrdered className="h-3.5 w-3.5" />,
      label: "Numbered List",
      onMouseDown: (e) => {
        e.preventDefault();
        execCmd("insertOrderedList");
      },
      active: isCommandActive("insertOrderedList"),
    },
  ];

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 p-1.5 rounded-xl flex-wrap"
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {TOOLBAR.map((tool) => (
          <React.Fragment key={tool.label}>
            {tool.dividerBefore && (
              <div
                className="w-px h-4 mx-1"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
            )}
            <button
              type="button"
              title={tool.label}
              onMouseDown={tool.onMouseDown}
              className="p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center"
              style={{
                color: tool.active ? "#f97316" : "#52525b",
                background: tool.active
                  ? "rgba(249,115,22,0.12)"
                  : "transparent",
                border: tool.active
                  ? "1px solid rgba(249,115,22,0.2)"
                  : "1px solid transparent",
              }}
            >
              {tool.icon}
            </button>
          </React.Fragment>
        ))}
        <span
          className="mono text-[8px] ml-auto pr-1"
          style={{ color: "#3f3f46" }}
        >
          ⌘B · ⌘I
        </span>
      </div>

      {/* Editor */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(249,115,22,0.2)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(255,255,255,0.06)";
        }}
      >
        <style>{`
          .rich-editor { outline: none; }
          .rich-editor h3 { font-size:0.95rem; font-weight:800; color:#e4e4e7; margin:0.5rem 0 0.25rem; font-family:'DM Sans',sans-serif; letter-spacing:-0.01em; }
          .rich-editor p { margin: 0.15rem 0; }
          .rich-editor ul { list-style:disc; padding-left:1.25rem; margin:0.25rem 0; }
          .rich-editor ol { list-style:decimal; padding-left:1.25rem; margin:0.25rem 0; }
          .rich-editor li { margin: 0.1rem 0; }
          .rich-editor b, .rich-editor strong { color: #e4e4e7; }
          .rich-editor u { text-decoration-color: rgba(249,115,22,0.5); }
          .rich-editor:empty:before { content: attr(data-placeholder); color: #3f3f46; pointer-events: none; }
        `}</style>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Key insights, edge cases, your approach, what tripped you up…"
          className="rich-editor sans text-sm text-zinc-300 leading-relaxed p-4 min-h-[160px] max-h-[320px] overflow-y-auto"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={refreshTick}
          onMouseUp={refreshTick}
        />
      </div>
    </div>
  );
}
