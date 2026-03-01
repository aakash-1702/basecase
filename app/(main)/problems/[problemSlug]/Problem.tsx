"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  CheckCircle,
  Cloud,
  Loader2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ArrowLeft,
  Bot,
  Send,
  RotateCcw,
  Lightbulb,
  Code2,
  Gauge,
  GitBranch,
  Bug,
  Terminal,
  Sparkles,
  Bold,
  Italic,
  List,
  ListOrdered,
  Highlighter,
  Underline,
  Type,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Trophy,
  Target,
  FileText,
  StickyNote,
} from "lucide-react";
import { Problem, UserProblem } from "@/generated/prisma/client";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import HighlightExt from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

type ConfidenceV2 = "LOW" | "MEDIUM" | "HIGH";
interface Message {
  role: "user" | "assistant";
  content: string;
}
interface ProgressState {
  solved: boolean;
  confidenceV2: ConfidenceV2 | null;
  solvedAt?: string | null;
  notes: string;
  bookmark: boolean;
}

const CONF: Record<
  ConfidenceV2,
  { label: string; color: string; bg: string; border: string }
> = {
  LOW: {
    label: "Low",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.09)",
    border: "rgba(239,68,68,0.28)",
  },
  MEDIUM: {
    label: "Med",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.09)",
    border: "rgba(245,158,11,0.28)",
  },
  HIGH: {
    label: "High",
    color: "#10b981",
    bg: "rgba(16,185,129,0.09)",
    border: "rgba(16,185,129,0.28)",
  },
};

function parseLines(raw?: string | null) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
function parseEditorial(raw?: string | null) {
  const lines = parseLines(raw);
  if (!lines.length) return { insight: null, points: [] as string[] };
  const [insight, ...points] = lines;
  return { insight, points };
}

// ── RICH EDITOR (TipTap) ──
function RichEditor({
  initialValue,
  onChange,
  disabled = false,
}: {
  initialValue: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  // Track what WE last sent out so we don't fight with our own updates
  const lastEmittedRef = useRef(initialValue || "");

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
      }),
      UnderlineExt,
      HighlightExt.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder: "Key insights, edge cases, patterns, what tripped you up…",
      }),
    ],
    content: initialValue || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "re",
        dir: "ltr",
      },
    },
  });

  // Sync editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // Sync content ONLY when initialValue changes from EXTERNAL source (e.g., rollback)
  // Skip if the change is from our own typing (lastEmittedRef matches initialValue)
  useEffect(() => {
    if (editor && initialValue !== lastEmittedRef.current) {
      editor.commands.setContent(initialValue || "");
      lastEmittedRef.current = initialValue || "";
    }
  }, [initialValue, editor]);

  if (!editor) return null;

  const tools = [
    {
      icon: <Type size={12} />,
      label: "H",
      fn: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold size={12} />,
      label: "B",
      fn: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: <Italic size={12} />,
      label: "I",
      fn: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: <Underline size={12} />,
      label: "U",
      fn: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
      div: true,
    },
    {
      icon: <Highlighter size={12} />,
      label: "HL",
      fn: () => editor.chain().focus().toggleHighlight().run(),
      active: editor.isActive("highlight"),
    },
    {
      icon: <List size={12} />,
      label: "UL",
      fn: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
      div: true,
    },
    {
      icon: <ListOrdered size={12} />,
      label: "OL",
      fn: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
  ];

  return (
    <div style={{ opacity: disabled ? 0.5 : 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginBottom: 10,
        }}
      >
        {tools.map((t) => (
          <React.Fragment key={t.label}>
            {(t as any).div && (
              <div
                style={{
                  width: 1,
                  height: 13,
                  background: "#1c1f26",
                  margin: "0 3px",
                }}
              />
            )}
            <button
              type="button"
              title={t.label}
              onMouseDown={(e) => {
                e.preventDefault();
                t.fn();
              }}
              className="re-tool"
              style={{
                padding: "5px 7px",
                borderRadius: 5,
                border: "none",
                cursor: disabled ? "default" : "pointer",
                color: t.active ? "#f97316" : "#6b7280",
                background: t.active ? "rgba(249,115,22,0.1)" : "transparent",
                transition: "color .15s, background .15s",
              }}
              disabled={disabled}
            >
              {t.icon}
            </button>
          </React.Fragment>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

// ── EDITORIAL ──
function EditorialBlock({
  editorial,
  aiHintLines,
}: {
  editorial: { insight: string | null; points: string[] };
  aiHintLines: string[];
}) {
  const [open, setOpen] = useState(false);
  if (!editorial.insight && !editorial.points.length && !aiHintLines.length)
    return null;
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="editorial-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: open ? "rgba(249,115,22,0.03)" : "none",
          border: "none",
          cursor: "pointer",
          padding: open ? "12px 14px" : "12px 14px",
          borderRadius: 8,
          marginBottom: open ? 12 : 0,
          transition: "background .2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Terminal
            size={15}
            className="et-icon"
            style={{
              color: open ? "#f97316" : "#6b7280",
              transition: "color .2s",
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              fontWeight: 600,
              color: open ? "#f97316" : "#9ca3b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color .2s",
            }}
          >
            Editorial &amp; Approach
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10,
              color: open ? "#f97316" : "#6b7280",
              transition: "color .2s",
            }}
          >
            {open ? "hide" : "reveal"}
          </span>
          {open ? (
            <ChevronUp size={14} color={open ? "#f97316" : "#6b7280"} />
          ) : (
            <ChevronDown size={14} color="#6b7280" />
          )}
        </div>
      </button>
      {open && (
        <div
          style={{
            borderTop: "1px solid #1c1f26",
            paddingTop: 20,
            animation: "fadeSlideIn .22s ease-out",
          }}
        >
          {editorial.insight && (
            <div
              style={{
                marginBottom: 20,
                paddingLeft: 14,
                borderLeft: "2px solid rgba(249,115,22,0.4)",
              }}
            >
              <p
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#f97316",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Key Insight
              </p>
              <p
                style={{
                  fontSize: 13.5,
                  color: "#c9d1e0",
                  lineHeight: 1.78,
                  fontWeight: 500,
                }}
              >
                {editorial.insight}
              </p>
            </div>
          )}
          {editorial.points.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9ca3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Approach
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {editorial.points.map((pt, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#f97316",
                        minWidth: 18,
                        paddingTop: 3,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <p
                      style={{
                        fontSize: 13.5,
                        color: "#c9d1e0",
                        lineHeight: 1.78,
                      }}
                    >
                      {pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {aiHintLines.length > 0 && (
            <div>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9ca3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Hints
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {aiHintLines.map((hint, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <Lightbulb
                      size={13}
                      color="#fbbf24"
                      style={{ marginTop: 3, flexShrink: 0 }}
                    />
                    <p
                      style={{
                        fontSize: 13.5,
                        color: "#c9d1e0",
                        lineHeight: 1.75,
                      }}
                    >
                      {hint}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SIMPLE TIPTAP INPUT (for AI chat) ──
function TipTapInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything…",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    },
    editorProps: {
      attributes: {
        class: "ai-input",
        dir: "ltr",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          onSubmitRef.current();
          return true;
        }
        return false;
      },
    },
  });

  // Clear editor when value becomes empty (after submit)
  useEffect(() => {
    if (editor && value === "" && editor.getText() !== "") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}

// ── AI MENTOR ──
function AIMentor({
  title,
  aiHintLines,
  isPremium,
}: {
  title: string;
  aiHintLines: string[];
  isPremium: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAI = useCallback(async () => {
    const msg = aiInput.trim();
    if (!msg || aiLoading) return;
    setAiInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setAiLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const reply =
        aiHintLines.length > 0
          ? aiHintLines[Math.floor(Math.random() * aiHintLines.length)]
          : `Consider the constraints for "${title}". What data structure gives O(1) lookup?`;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, aiLoading, title, aiHintLines]);

  const starters = [
    "Give me a hint without spoiling",
    "What pattern does this follow?",
    "How can I optimize my approach?",
    "Walk me through the complexity",
  ];

  if (!isPremium)
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: "1px solid #1c1f26",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bot size={15} color="#f97316" />
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 11,
                fontWeight: 600,
                color: "#9ca3b8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              AI Mentor
            </span>
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 9,
              color: "#f97316",
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.22)",
              borderRadius: 4,
              padding: "2px 8px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Plus
          </span>
        </div>
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              background:
                "linear-gradient(to bottom, transparent 10%, #0d0f14 95%)",
              pointerEvents: "none",
            }}
          />
          {[
            { role: "user", text: "Any hint on optimizing brute force?" },
            {
              role: "ai",
              text: "Think about the inner loop — you're searching for a value. What data structure gives O(1) lookup?",
            },
            { role: "user", text: "A hash map?" },
            {
              role: "ai",
              text: "Exactly. What should you store as the key vs. value?",
            },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                fontSize: 12.5,
                lineHeight: 1.65,
                padding: "8px 12px",
                marginBottom: 6,
                borderRadius: 6,
                color: m.role === "user" ? "#7a8496" : "#5a6478",
                background:
                  m.role === "user" ? "rgba(249,115,22,0.04)" : "transparent",
                border:
                  m.role === "user" ? "1px solid rgba(249,115,22,0.1)" : "none",
                marginLeft: m.role === "user" ? 20 : 0,
                marginRight: m.role === "ai" ? 20 : 0,
              }}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 5,
            marginBottom: 16,
          }}
        >
          {[
            { icon: <Lightbulb size={11} />, label: "Smart Hints" },
            { icon: <Code2 size={11} />, label: "Approach Review" },
            { icon: <Gauge size={11} />, label: "Complexity Coach" },
            { icon: <GitBranch size={11} />, label: "Pattern Matcher" },
            { icon: <Bug size={11} />, label: "Debug Assistant" },
            { icon: <Sparkles size={11} />, label: "Unlimited Chats" },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 9px",
                borderRadius: 6,
                background: "rgba(249,115,22,0.03)",
                border: "1px solid #1c1f26",
              }}
            >
              <span style={{ color: "#f97316", opacity: 0.7 }}>{f.icon}</span>
              <span style={{ fontSize: 11, color: "#9ca3b8" }}>{f.label}</span>
            </div>
          ))}
        </div>
        <button
          className="btn-og"
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <Zap size={12} /> Unlock AI Mentor · Upgrade to Plus
        </button>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: "1px solid #1c1f26",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 6px #10b981",
            }}
          />
          <Bot size={14} color="#f97316" />
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              fontWeight: 600,
              color: "#9ca3b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            AI Mentor
          </span>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="btn-ghost-sm">
            <RotateCcw size={10} /> Clear
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
        {messages.length === 0 ? (
          <div>
            <p
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 11,
                color: "#6b7280",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Suggested
            </p>
            {starters.map((s, i) => (
              <button
                key={i}
                onClick={() => setAiInput(s)}
                className="starter-btn"
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  marginBottom: 4,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  borderRadius: 6,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  padding: "9px 12px",
                  borderRadius: 7,
                  background:
                    m.role === "user" ? "rgba(249,115,22,0.06)" : "transparent",
                  color: m.role === "user" ? "#c9d1e0" : "#7a8496",
                  marginLeft: m.role === "user" ? 16 : 0,
                  marginRight: m.role === "assistant" ? 16 : 0,
                  border:
                    m.role === "user"
                      ? "1px solid rgba(249,115,22,0.15)"
                      : "none",
                }}
              >
                {m.content}
              </div>
            ))}
            {aiLoading && (
              <div
                style={{
                  fontSize: 12,
                  color: "#9ca3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 12px",
                }}
              >
                <Loader2 size={12} className="spin" /> Thinking…
              </div>
            )}
            <div ref={chatEnd} />
          </div>
        )}
      </div>
      <div style={{ borderTop: "1px solid #1c1f26", paddingTop: 12 }}>
        <div style={{ position: "relative" }}>
          <TipTapInput
            value={aiInput}
            onChange={setAiInput}
            onSubmit={handleAI}
            placeholder="Ask anything…"
            disabled={aiLoading}
          />
          <button
            onClick={handleAI}
            disabled={!aiInput.trim() || aiLoading}
            style={{
              position: "absolute",
              right: 8,
              bottom: 8,
              padding: "6px 7px",
              borderRadius: 6,
              background: aiInput.trim()
                ? "linear-gradient(135deg,#f97316,#ea580c)"
                : "#1c1f26",
              border: "none",
              cursor: aiInput.trim() ? "pointer" : "default",
              color: aiInput.trim() ? "#000" : "#3f4756",
              boxShadow: aiInput.trim()
                ? "0 0 10px rgba(249,115,22,0.35)"
                : "none",
              transition: "all .2s",
            }}
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProblemPage({
  problem: p,
  userProblem,
}: {
  problem: Problem;
  userProblem?: UserProblem | null;
}) {
  const isPremium = true;
  const editorial = parseEditorial(p.editorial);
  const aiHintLines = parseLines(p.aiHints);

  const toState = (up?: UserProblem | null): ProgressState => ({
    solved: up?.solved ?? false,
    confidenceV2: (up?.confidenceV2 as ConfidenceV2 | null) ?? null,
    solvedAt: up?.solvedAt?.toString() ?? null,
    notes: up?.notes ?? "",
    bookmark: up?.bookmark ?? false,
  });

  // `progress` = local draft; `committed` = last DB-confirmed state
  const [progress, setProgress] = useState<ProgressState>(() =>
    toState(userProblem),
  );
  const [committed, setCommitted] = useState<ProgressState>(() =>
    toState(userProblem),
  );
  const [saving, setSaving] = useState(false);
  const isDirty = JSON.stringify(progress) !== JSON.stringify(committed);

  // per-field pending indicators
  const pendingBookmark = progress.bookmark !== committed.bookmark;
  const pendingSolved = progress.solved !== committed.solved;
  const pendingConfidence = progress.confidenceV2 !== committed.confidenceV2;
  const pendingNotes = progress.notes !== committed.notes;

  useEffect(() => {
    const s = toState(userProblem);
    setProgress(s);
    setCommitted(s);
  }, [userProblem]); // eslint-disable-line

  const diffColor =
    p.difficulty === "easy"
      ? "#10b981"
      : p.difficulty === "hard"
        ? "#ef4444"
        : "#f59e0b";
  const examples = [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] == 9",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "nums[1] + nums[2] == 6",
    },
  ];

  const TOAST_ID = `save-progress-${p.slug}`;

  const handleSave = useCallback(async () => {
    if (saving) return;
    const snapshot = { ...progress };
    setSaving(true);
    toast.loading("Saving progress…", { id: TOAST_ID });
    try {
      const res = await fetch(`/api/problems/${p.slug}/problem`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          solved: snapshot.solved,
          confidenceV2: snapshot.confidenceV2,
          notes: snapshot.notes,
          bookmark: snapshot.bookmark,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "Save failed");

      // Pessimistic commit: use server-returned state as source of truth
      const up = json?.data as UserProblem | undefined;
      const persisted = up ? toState(up) : snapshot;
      setProgress(persisted);
      setCommitted(persisted);

      toast.success("Progress saved", { id: TOAST_ID });
    } catch (err: any) {
      // Rollback draft to last committed state
      setProgress({ ...committed });
      toast.error(err?.message ?? "Save failed — changes rolled back", {
        id: TOAST_ID,
      });
    } finally {
      setSaving(false);
    }
  }, [progress, committed, saving, p.slug, TOAST_ID]); // eslint-disable-line

  const handleSolve = useCallback(() => {
    if (saving || progress.solved) return;
    setProgress((prev) => ({
      ...prev,
      solved: true,
      solvedAt: new Date().toISOString(),
    }));
  }, [saving, progress.solved]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080a0e; }

        .page {
          font-family: 'IBM Plex Sans', sans-serif;
          background: #080a0e;
          min-height: 100vh;
          color: #7a8496;
        }

        /* Orange-tinted grid */
        .page::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          z-index: 0;
        }
        /* Orange ambient glow at top */
        .page::after {
          content: '';
          position: fixed; top: 0; left: 0; right: 0; height: 300px;
          background: radial-gradient(ellipse 55% 45% at 50% -5%, rgba(249,115,22,0.09), transparent 70%);
          pointer-events: none; z-index: 0;
        }

        .mono { font-family: 'IBM Plex Mono', monospace; }

        /* Card */
        .card {
          background: linear-gradient(180deg, #0d0f14 0%, #0a0c10 100%);
          border: 1px solid #1c1f26;
          position: relative;
          transition: border-color .25s, box-shadow .25s;
        }
        .card:hover {
          border-color: rgba(249,115,22,0.15);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        /* Orange top line on every card */
        .card::before {
          content: '';
          position: absolute; top: 0; left: 8%; right: 8%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.35), transparent);
          pointer-events: none;
        }

        /* Card title - prominent section header */
        .card-title {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #f3f4f6;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(249,115,22,0.12);
        }
        .card-title-icon {
          color: #f97316;
        }

        /* Section label */
        .slabel {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #6b7280;
          display: flex; align-items: center; gap: 6px;
        }
        .slabel-icon {
          color: #f97316;
          opacity: 0.7;
        }

        /* Section header - more prominent */
        .section-header {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 15px; font-weight: 600;
          color: #e5e7eb;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .section-header::before {
          content: '';
          width: 3px; height: 16px;
          background: linear-gradient(180deg, #f97316, #ea580c);
          border-radius: 2px;
        }

        /* Notice */
        .notice {
          background: rgba(249,115,22,0.04);
          border-bottom: 1px solid rgba(249,115,22,0.1);
        }

        /* ── PRIMARY ORANGE BUTTON ── */
        .btn-og {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          border: none; cursor: pointer; border-radius: 7px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #000;
          box-shadow: 0 0 18px rgba(249,115,22,0.3);
          transition: box-shadow .2s, transform .15s, filter .15s;
        }
        .btn-og:hover {
          box-shadow: 0 0 30px rgba(249,115,22,0.55);
          transform: translateY(-1px);
          filter: brightness(1.07);
        }
        .btn-og:active { transform: translateY(0); box-shadow: 0 0 14px rgba(249,115,22,0.3); }

        /* ── GHOST BUTTON ── */
        .btn-ghost {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: transparent; border: 1px solid #1c1f26;
          border-radius: 6px; color: #6b7280; cursor: pointer;
          padding: 5px 11px;
          display: flex; align-items: center; gap: 5px;
          transition: border-color .18s, color .18s, background .18s;
        }
        .btn-ghost:hover {
          border-color: rgba(249,115,22,0.35);
          color: #f97316;
          background: rgba(249,115,22,0.05);
        }

        /* ── GHOST SMALL ── */
        .btn-ghost-sm {
          font-family: 'IBM Plex Mono', monospace; font-size: 9px;
          color: #6b7280; background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          padding: 3px 6px; border-radius: 5px; transition: color .15s;
        }
        .btn-ghost-sm:hover { color: #f97316; }

        /* ── MARK SOLVED ── */
        .btn-solve {
          width: 100%; padding: 11px 0; border-radius: 7px;
          background: rgba(249,115,22,0.06);
          border: 1px solid rgba(249,115,22,0.22);
          color: #f97316;
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background .2s, border-color .2s, box-shadow .2s, transform .15s;
        }
        .btn-solve:hover {
          background: rgba(249,115,22,0.13);
          border-color: rgba(249,115,22,0.45);
          box-shadow: 0 0 20px rgba(249,115,22,0.18);
          transform: translateY(-1px);
        }
        .btn-solve:active { transform: translateY(0); }

        /* ── SAVE PROGRESS ── */
        .btn-save {
          width: 100%; padding: 10px 0; border-radius: 7px;
          background: rgba(249,115,22,0.07);
          border: 1px solid rgba(249,115,22,0.22);
          color: #f97316;
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background .2s, border-color .2s, box-shadow .2s, transform .15s;
        }
        .btn-save:hover {
          background: rgba(249,115,22,0.14);
          border-color: rgba(249,115,22,0.45);
          box-shadow: 0 0 18px rgba(249,115,22,0.2);
          transform: translateY(-1px);
        }
        .btn-save:active { transform: translateY(0); }

        /* ── CONFIDENCE BUTTONS ── */
        .conf-btn {
          background: transparent; border: 1px solid #1c1f26; border-radius: 6px;
          padding: 8px 0; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280;
          transition: border-color .18s, color .18s, background .18s, transform .12s, box-shadow .18s;
        }
        .conf-btn:hover:not(.conf-active) {
          border-color: rgba(249,115,22,0.28);
          color: rgba(249,115,22,0.7);
          background: rgba(249,115,22,0.05);
          transform: translateY(-1px);
        }
        .conf-btn:active { transform: translateY(0) !important; }

        /* ── BOOKMARK ── */
        .btn-bookmark {
          display: flex; align-items: center; gap: 6px; padding: 5px 11px;
          border-radius: 6px; background: transparent; border: 1px solid #1c1f26;
          cursor: pointer;
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280;
          transition: border-color .18s, color .18s, background .18s;
        }
        .btn-bookmark:hover, .btn-bookmark.active {
          border-color: rgba(249,115,22,0.35);
          color: #f97316;
          background: rgba(249,115,22,0.07);
        }

        /* ── HEADER SAVE (compact) ── */
        .btn-save-hdr {
          display: flex; align-items: center; gap: 6px; padding: 5px 12px;
          border-radius: 6px; border: 1px solid rgba(249,115,22,0.25);
          background: rgba(249,115,22,0.07); color: #f97316; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          transition: background .2s, border-color .2s, box-shadow .2s, transform .15s;
        }
        .btn-save-hdr:hover {
          background: rgba(249,115,22,0.14);
          border-color: rgba(249,115,22,0.45);
          box-shadow: 0 0 14px rgba(249,115,22,0.2);
          transform: translateY(-1px);
        }
        .btn-save-hdr:active { transform: translateY(0); }

        /* ── CODE BLOCK ── */
        .code {
          font-family: 'IBM Plex Mono', monospace; font-size: 12.5px;
          background: #0d0f14; border: 1px solid rgba(249,115,22,0.12); border-radius: 6px;
          padding: 10px 14px; color: #9ca3b8; line-height: 1.6;
        }

        /* ── RICH EDITOR ── */
        .re {
          outline: none; min-height: 130px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13.5px; color: #9ca3b8; line-height: 1.78;
          caret-color: #f97316; padding: 12px 0;
          border-top: 1px solid rgba(249,115,22,0.15);
          transition: border-color .2s;
          direction: ltr !important;
          unicode-bidi: embed !important;
          text-align: left !important;
        }
        .re * {
          direction: ltr !important;
          unicode-bidi: embed !important;
          text-align: left !important;
        }
        .re:focus { border-top-color: rgba(249,115,22,0.35); }
        .re h3 { font-size: .95rem; font-weight: 700; color: #e5e7eb; margin: .5rem 0 .25rem; }
        .re p  { margin: .2rem 0; }
        .re ul { list-style: disc; padding-left: 1.25rem; margin: .25rem 0; }
        .re ol { list-style: decimal; padding-left: 1.25rem; margin: .25rem 0; }
        .re li { margin: .15rem 0; }
        .re b, .re strong { color: #e5e7eb; font-weight: 600; }
        .re mark { background: rgba(249,115,22,0.22); color: inherit; border-radius: 2px; padding: 0 2px; }
        .re p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #4b5563;
          pointer-events: none;
          font-style: italic;
          float: left;
          height: 0;
        }

        /* ── RE TOOL HOVER ── */
        .re-tool:hover { color: #f97316 !important; background: rgba(249,115,22,0.09) !important; }

        /* ── AI TEXTAREA ── */
        .ai-textarea {
          font-family: 'IBM Plex Sans', sans-serif;
          width: 100%; resize: none;
          background: rgba(249,115,22,0.03); border: 1px solid #1c1f26;
          border-radius: 7px; padding: 9px 42px 9px 12px;
          font-size: 13px; color: #94a3b8; outline: none; line-height: 1.5;
          transition: border-color .2s;
        }
        .ai-textarea:focus { border-color: rgba(249,115,22,0.3); }
        .ai-textarea::placeholder { color: #4b5563; }

        /* ── AI TIPTAP INPUT ── */
        .ai-input {
          font-family: 'IBM Plex Sans', sans-serif;
          width: 100%; min-height: 44px;
          background: rgba(249,115,22,0.03); border: 1px solid #1c1f26;
          border-radius: 7px; padding: 9px 42px 9px 12px;
          font-size: 13px; color: #94a3b8; outline: none; line-height: 1.5;
          transition: border-color .2s;
          direction: ltr !important;
          text-align: left !important;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .ai-input:focus { border-color: rgba(249,115,22,0.3); }
        .ai-input p { margin: 0; white-space: pre-wrap; }
        .ai-input p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #4b5563;
          pointer-events: none;
          float: left;
          height: 0;
        }

        /* TipTap ProseMirror base styles */
        .ProseMirror {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .ProseMirror:focus {
          outline: none;
        }

        /* ── STARTER BUTTONS ── */
        .starter-btn {
          font-family: 'IBM Plex Sans', sans-serif;
          color: #5a6478; background: rgba(249,115,22,0.025);
          border: 1px solid #1c1f26; cursor: pointer;
          transition: color .15s, border-color .15s, background .15s, transform .12s;
        }
        .starter-btn:hover {
          color: #f97316;
          border-color: rgba(249,115,22,0.28);
          background: rgba(249,115,22,0.06);
          transform: translateX(2px);
        }

        /* ── EDITORIAL BUTTON HOVER ── */
        .editorial-btn:hover .et-icon { color: #f97316 !important; }

        /* ── STICKY SIDEBAR ── */
        .sticky-sidebar { position: sticky; top: 49px; }

        /* ── DISCUSSION ── */
        .disc-item { border-bottom: 1px solid #1c1f26; padding: 16px 0; }
        .disc-item:last-child { border-bottom: none; }
        .avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: rgba(249,115,22,0.7); font-weight: 700; flex-shrink: 0;
          font-family: 'IBM Plex Mono', monospace;
        }

        /* ── SCROLLBAR ── */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1c1f26; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.35); }

        /* ── ANIMATIONS ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes solvedPop { 0%{transform:scale(.9);opacity:0} 55%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        .solved-pop { animation: solvedPop .32s ease-out; }
      `}</style>

      <div className="page">
        {/* ── NOTICE BAR ── */}
        <div
          className="notice"
          style={{ padding: "8px 24px", position: "relative", zIndex: 10 }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Info size={12} color="rgba(249,115,22,0.55)" />
              <span style={{ fontSize: 12, color: "rgba(249,115,22,0.45)" }}>
                <strong
                  style={{ fontWeight: 600, color: "rgba(249,115,22,0.65)" }}
                >
                  BaseCase is a progress tracker.
                </strong>{" "}
                Solve on LeetCode → return here to log mastery.
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: "rgba(249,115,22,0.4)",
                  letterSpacing: "0.07em",
                }}
              >
                1 · Solve on LeetCode
              </span>
              <ChevronRight size={11} color="rgba(249,115,22,0.2)" />
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: "#10b981",
                  letterSpacing: "0.07em",
                }}
              >
                2 · Log here
              </span>
            </div>
          </div>
        </div>

        {/* ── HEADER ── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(8,10,14,0.95)",
            borderBottom: "1px solid #1c1f26",
            backdropFilter: "blur(14px)",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 24px",
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
              }}
            >
              <button className="btn-ghost">
                <ArrowLeft size={12} /> Back
              </button>
              <div style={{ width: 1, height: 16, background: "#1c1f26" }} />
              <h1
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#c9d1e0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.title}
              </h1>
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: diffColor,
                  flexShrink: 0,
                  padding: "2px 7px",
                  borderRadius: 4,
                  background: `${diffColor}14`,
                  border: `1px solid ${diffColor}28`,
                }}
              >
                {p.difficulty}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() =>
                  !saving &&
                  setProgress((prev) => ({ ...prev, bookmark: !prev.bookmark }))
                }
                disabled={saving}
                className={`btn-bookmark${progress.bookmark ? " active" : ""}`}
              >
                {progress.bookmark ? (
                  <BookmarkCheck size={12} />
                ) : (
                  <Bookmark size={12} />
                )}
                {progress.bookmark ? "Bookmarked" : "Bookmark"}
                {pendingBookmark && (
                  <span
                    title="Pending — not yet saved to DB"
                    style={{
                      marginLeft: 4,
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#f97316",
                      boxShadow: "0 0 5px #f97316",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
              {isDirty && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-save-hdr"
                >
                  {saving ? (
                    <>
                      <Loader2 size={11} className="spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Cloud size={11} /> Save
                    </>
                  )}
                </button>
              )}
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 6,
                  background: "#ffa116",
                  color: "#000",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "IBM Plex Mono, monospace",
                  textDecoration: "none",
                  boxShadow: "0 0 12px rgba(255,161,22,0.4)",
                  transition: "box-shadow .2s, transform .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "0 0 24px rgba(255,161,22,0.6)";
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "0 0 12px rgba(255,161,22,0.4)";
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    "translateY(0)";
                }}
              >
                <ExternalLink size={11} /> LeetCode
              </a>
            </div>
          </div>
        </header>

        <main
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "28px 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* ════════════════════════════════════════════
              LAYER 1 — INTAKE   75% / 25%
          ════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 316px",
              gap: 14,
              marginBottom: 14,
            }}
          >
            {/* Problem */}
            <div
              className="card"
              style={{ borderRadius: 10, padding: "28px 32px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 22,
                }}
              >
                {p.tags.map((t: string) => (
                  <span
                    key={t}
                    className="mono"
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(249,115,22,0.07)",
                      border: "1px solid rgba(249,115,22,0.18)",
                      color: "rgba(249,115,22,0.7)",
                    }}
                  >
                    {t}
                  </span>
                ))}
                {p.companies.map((c: string) => (
                  <span
                    key={c}
                    className="mono"
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(139,92,246,0.08)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      color: "rgba(139,92,246,0.7)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* 60% constraint */}
              <div style={{ maxWidth: "65%" }}>
                <p
                  style={{
                    fontSize: 14.5,
                    color: "#9ca3b8",
                    lineHeight: 1.9,
                    whiteSpace: "pre-line",
                  }}
                >
                  {p.description}
                </p>
              </div>

              {/* Examples */}
              <div
                style={{
                  marginTop: 28,
                  paddingTop: 22,
                  borderTop: "1px solid rgba(249,115,22,0.12)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 18,
                  }}
                >
                  <Code2 size={14} color="#f97316" style={{ opacity: 0.7 }} />
                  <span className="slabel" style={{ color: "#6b7280" }}>
                    Examples
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    maxWidth: "60%",
                  }}
                >
                  {examples.map((ex, i) => (
                    <div key={i}>
                      <p
                        className="mono"
                        style={{
                          fontSize: 9,
                          color: "#6b7280",
                          marginBottom: 9,
                          letterSpacing: "0.08em",
                        }}
                      >
                        EXAMPLE {i + 1}
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        <div>
                          <p className="slabel" style={{ marginBottom: 5 }}>
                            Input
                          </p>
                          <div className="code">{ex.input}</div>
                        </div>
                        <div>
                          <p className="slabel" style={{ marginBottom: 5 }}>
                            Output
                          </p>
                          <div className="code" style={{ color: "#7a8496" }}>
                            {ex.output}
                          </div>
                        </div>
                      </div>
                      {ex.explanation && (
                        <p
                          style={{
                            fontSize: 12.5,
                            color: "#7a8496",
                            marginTop: 8,
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ color: "#9ca3b8", fontWeight: 500 }}>
                            Explanation:{" "}
                          </span>
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mastery HUD */}
            <div className="sticky-sidebar">
              <div
                className="card"
                style={{ borderRadius: 10, padding: "22px 20px" }}
              >
                <div className="card-title">
                  <Trophy size={16} className="card-title-icon" />
                  Your Progress
                </div>

                {/* Solve */}
                <div
                  style={{
                    marginBottom: 18,
                    paddingBottom: 18,
                    borderBottom: "1px solid #1c1f26",
                  }}
                >
                  {progress.solved ? (
                    <div
                      className="solved-pop"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "10px 13px",
                        background: "rgba(16,185,129,0.06)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: 7,
                      }}
                    >
                      <CheckCircle size={14} color="#10b981" />
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#10b981",
                          }}
                        >
                          Solved
                        </p>
                        {progress.solvedAt && (
                          <p
                            className="mono"
                            style={{
                              fontSize: 10,
                              color: "#6b7280",
                              marginTop: 2,
                            }}
                          >
                            {new Date(progress.solvedAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </p>
                        )}
                      </div>
                      {pendingSolved && (
                        <span
                          title="Pending — not yet saved to DB"
                          style={{
                            fontFamily: "'IBM Plex Mono',monospace",
                            fontSize: 9,
                            color: "#f97316",
                            letterSpacing: "0.05em",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: "#f97316",
                              boxShadow: "0 0 5px #f97316",
                              display: "inline-block",
                            }}
                          />
                          pending
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleSolve}
                      disabled={saving}
                      className="btn-solve"
                    >
                      <CheckCircle size={13} /> Mark Solved
                    </button>
                  )}
                </div>

                {/* Confidence */}
                <div
                  style={{
                    marginBottom: 18,
                    paddingBottom: 18,
                    borderBottom: "1px solid #1c1f26",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <p className="slabel">
                      <Target size={12} className="slabel-icon" />
                      Confidence
                    </p>
                    {pendingConfidence && (
                      <span
                        title="Pending — not yet saved to DB"
                        style={{
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: 9,
                          color: "#f97316",
                          letterSpacing: "0.05em",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#f97316",
                            boxShadow: "0 0 5px #f97316",
                            display: "inline-block",
                          }}
                        />
                        pending
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 5,
                    }}
                  >
                    {(["LOW", "MEDIUM", "HIGH"] as ConfidenceV2[]).map(
                      (level) => {
                        const cfg = CONF[level];
                        const active = progress.confidenceV2 === level;
                        return (
                          <button
                            key={level}
                            disabled={saving}
                            onClick={() =>
                              !saving &&
                              setProgress((prev) => ({
                                ...prev,
                                confidenceV2: level,
                              }))
                            }
                            className={`conf-btn${active ? " conf-active" : ""}`}
                            style={
                              active
                                ? {
                                    color: cfg.color,
                                    background: cfg.bg,
                                    border: `1px solid ${cfg.border}`,
                                    transform: "translateY(-1px)",
                                  }
                                : {}
                            }
                          >
                            {cfg.label}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <p className="slabel">
                      <StickyNote size={12} className="slabel-icon" />
                      Notes
                    </p>
                    {pendingNotes ? (
                      <span
                        title="Pending — not yet saved to DB"
                        style={{
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: 9,
                          color: "#f97316",
                          letterSpacing: "0.05em",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#f97316",
                            boxShadow: "0 0 5px #f97316",
                            display: "inline-block",
                          }}
                        />
                        pending
                      </span>
                    ) : progress.notes ? (
                      <span
                        className="mono"
                        style={{
                          fontSize: 9,
                          color: "#10b981",
                          letterSpacing: "0.06em",
                        }}
                      >
                        saved
                      </span>
                    ) : null}
                  </div>
                  <RichEditor
                    initialValue={progress.notes}
                    disabled={saving}
                    onChange={(html) =>
                      setProgress((prev) => ({ ...prev, notes: html }))
                    }
                  />
                </div>

                {isDirty && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-save"
                    style={{ marginTop: 14 }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={12} className="spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Cloud size={12} /> Save Progress
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════
              LAYER 2 — INSIGHT   40% / 60%
          ════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 3fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div
              className="card"
              style={{ borderRadius: 10, padding: "22px 24px" }}
            >
              <EditorialBlock editorial={editorial} aiHintLines={aiHintLines} />
            </div>
            <div
              className="card"
              style={{ borderRadius: 10, padding: "22px 24px", minHeight: 340 }}
            >
              <AIMentor
                title={p.title}
                aiHintLines={aiHintLines}
                isPremium={isPremium}
              />
            </div>
          </div>

          {/* ════════════════════════════════════════════
              LAYER 3 — SOCIAL
          ════════════════════════════════════════════ */}
          <div style={{ paddingTop: 14 }}>
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(249,115,22,0.18) 30%, rgba(249,115,22,0.18) 70%, transparent)",
                marginBottom: 22,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <p className="slabel">Discussion</p>
              <span
                className="mono"
                style={{ fontSize: 10, color: "#6b7280" }}
              ></span>
            </div>
            <div
              style={{
                maxWidth: 640,
                color: "#6b7280",
                fontSize: 14,
                fontStyle: "italic",
              }}
            >
              Coming Soon...
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
