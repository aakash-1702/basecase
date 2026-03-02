"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  CheckCircle,
  Cloud,
  Loader2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
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
  ChevronDown,
  ChevronUp,
  Zap,
  Trophy,
  Target,
  StickyNote,
  Copy,
  Check,
} from "lucide-react";
import { Problem, UserProblem } from "@/generated/prisma/client";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import HighlightExt from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

// ── TYPES ──
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

// ── HELPERS ──
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
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^[\*\-]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\.\s+(.+)$/gm, "<li class='numbered'>$1</li>")
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n(?!<)/g, "<br/>")
    .replace(/(<br\/>){2,}/g, "<br/><br/>");
}

// ── RICH EDITOR ──
function RichEditor({
  initialValue,
  onChange,
  disabled = false,
}: {
  initialValue: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const lastEmittedRef = useRef(initialValue || "");
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [3] } }),
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
    editorProps: { attributes: { class: "re", dir: "ltr" } },
  });

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);
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
          padding: "12px 14px",
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
            <ChevronUp size={14} color="#f97316" />
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

// ── COPY BUTTON ──
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="copy-btn" title="Copy message">
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

// ── MESSAGE BUBBLE ──
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`bubble-row ${isUser ? "bubble-row--user" : "bubble-row--ai"}`}
    >
      {!isUser && (
        <div className="bubble-avatar">
          <Bot size={12} />
        </div>
      )}
      <div className={`bubble ${isUser ? "bubble--user" : "bubble--ai"}`}>
        {isUser ? (
          <p className="bubble-text">{msg.content}</p>
        ) : (
          <div
            className="bubble-text bubble-text--ai"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
          />
        )}
        <div className="bubble-footer">
          <CopyButton text={msg.content} />
        </div>
      </div>
    </div>
  );
}

// ── CHAT TIPTAP INPUT ──
function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
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
      Placeholder.configure({ placeholder: "Ask about your approach…" }),
    ],
    content: "",
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getText()),
    editorProps: {
      attributes: { class: "chat-input", dir: "ltr" },
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

  useEffect(() => {
    if (editor && value === "" && editor.getText() !== "")
      editor.commands.clearContent();
  }, [value, editor]);
  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}

// ── AI MENTOR ──
function AIMentor({
  problemId,
  title,
  isPremium,
}: {
  problemId: string;
  title: string;
  isPremium: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // fetch history on mount
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/ai-agent?problemId=${problemId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const mapped = data.data.map((m: { role: string; text: string }) => ({
            role: m.role === "model" ? "assistant" : "user",
            content: m.text,
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.log("Failed to fetch history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [problemId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ problemId, message: msg }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.data },
        ]);
      } else {
        throw new Error(data.message || "Failed to get AI response");
      }
    } catch (err) {
      console.log("Error fetching AI response:", err);
      toast.error("Failed to get AI response. Please try again.");
      // Remove the user message that failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [input, loading, problemId]);

  const starters = [
    "Is my approach correct?",
    "Give me a hint without spoiling",
    "What pattern does this follow?",
    "How can I optimize my solution?",
    "Walk me through the complexity",
  ];

  if (!isPremium)
    return (
      <div className="mentor-wrap">
        <div className="mentor-header">
          <div className="mentor-header__left">
            <Bot size={14} color="#f97316" />
            <span className="mentor-title">AI Mentor</span>
          </div>
          <span className="badge-plus">Plus</span>
        </div>
        <div className="paywall-preview">
          <div className="paywall-fade" />
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
            <div key={i} className={`paywall-msg paywall-msg--${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="paywall-features">
          {[
            { icon: <Lightbulb size={11} />, label: "Smart Hints" },
            { icon: <Code2 size={11} />, label: "Approach Review" },
            { icon: <Gauge size={11} />, label: "Complexity Coach" },
            { icon: <GitBranch size={11} />, label: "Pattern Matcher" },
            { icon: <Bug size={11} />, label: "Debug Assistant" },
            { icon: <Sparkles size={11} />, label: "Unlimited Chats" },
          ].map((f) => (
            <div key={f.label} className="paywall-feature">
              <span className="paywall-feature__icon">{f.icon}</span>
              <span className="paywall-feature__label">{f.label}</span>
            </div>
          ))}
        </div>
        <button className="btn-og paywall-cta">
          <Zap size={12} /> Unlock AI Mentor · Upgrade to Plus
        </button>
      </div>
    );

  return (
    <div className="mentor-wrap">
      <div className="mentor-header">
        <div className="mentor-header__left">
          <span className="online-dot" />
          <Bot size={14} color="#f97316" />
          <span className="mentor-title">AI Mentor</span>
        </div>
        {messages.length > 0 && (
          <button className="btn-ghost-sm" onClick={() => setMessages([])}>
            <RotateCcw size={10} /> Clear
          </button>
        )}
      </div>

      <div className="chat-scroll">
        {historyLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 0",
              color: "#4b5563",
            }}
          >
            <Loader2 size={13} className="spin" />
            <span
              style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10 }}
            >
              Restoring session…
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="starters">
            <p className="starters__label">Suggested</p>
            {starters.map((s, i) => (
              <button
                key={i}
                className="starter-btn"
                onClick={() => setInput(s)}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="messages">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {loading && (
              <div className="bubble-row bubble-row--ai">
                <div className="bubble-avatar">
                  <Bot size={12} />
                </div>
                <div className="bubble bubble--ai bubble--typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="chat-composer">
        <div className="chat-composer__inner">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`send-btn ${input.trim() ? "send-btn--active" : ""}`}
          >
            {loading ? (
              <Loader2 size={13} className="spin" />
            ) : (
              <Send size={13} />
            )}
          </button>
        </div>
        <p className="composer-hint">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ── PAGE ──
export default function ProblemPage({
  problem: p,
  userProblem,
  isPremium = false,
}: {
  problem: Problem;
  userProblem?: UserProblem | null;
  isPremium?: boolean;
}) {
  const editorial = parseEditorial(p.editorial);
  const aiHintLines = parseLines(p.aiHints);

  const toState = (up?: UserProblem | null): ProgressState => ({
    solved: up?.solved ?? false,
    confidenceV2: (up?.confidenceV2 as ConfidenceV2 | null) ?? null,
    solvedAt: up?.solvedAt?.toString() ?? null,
    notes: up?.notes ?? "",
    bookmark: up?.bookmark ?? false,
  });

  const [progress, setProgress] = useState<ProgressState>(() =>
    toState(userProblem),
  );
  const [committed, setCommitted] = useState<ProgressState>(() =>
    toState(userProblem),
  );
  const [saving, setSaving] = useState(false);
  const isDirty = JSON.stringify(progress) !== JSON.stringify(committed);

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
      const up = json?.data as UserProblem | undefined;
      const persisted = up ? toState(up) : snapshot;
      setProgress(persisted);
      setCommitted(persisted);
      toast.success("Progress saved", { id: TOAST_ID });
    } catch (err: any) {
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

  const PendingDot = () => (
    <span
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
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080a0e; }
        .page { font-family: 'IBM Plex Sans', sans-serif; min-height: 100vh; color: #7a8496; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .card { background: linear-gradient(180deg, #0d0f14 0%, #0a0c10 100%); border: 1px solid #1c1f26; position: relative; transition: border-color .25s, box-shadow .25s; }
        .card:hover { border-color: rgba(249,115,22,0.15); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
        .card::before { content: ''; position: absolute; top: 0; left: 8%; right: 8%; height: 1px; background: linear-gradient(90deg, transparent, rgba(249,115,22,0.35), transparent); pointer-events: none; }
        .card-title { font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; font-weight: 600; color: #f3f4f6; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(249,115,22,0.12); }
        .card-title-icon { color: #f97316; }
        .slabel { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; display: flex; align-items: center; gap: 6px; }
        .slabel-icon { color: #f97316; opacity: 0.7; }
        .btn-og { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border: none; cursor: pointer; border-radius: 7px; background: linear-gradient(135deg, #f97316, #ea580c); color: #000; box-shadow: 0 0 18px rgba(249,115,22,0.3); transition: box-shadow .2s, transform .15s, filter .15s; }
        .btn-og:hover { box-shadow: 0 0 30px rgba(249,115,22,0.55); transform: translateY(-1px); filter: brightness(1.07); }
        .btn-og:active { transform: translateY(0); }
        .btn-ghost { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; background: transparent; border: 1px solid #1c1f26; border-radius: 6px; color: #6b7280; cursor: pointer; padding: 5px 11px; display: flex; align-items: center; gap: 5px; transition: border-color .18s, color .18s, background .18s; }
        .btn-ghost:hover { border-color: rgba(249,115,22,0.35); color: #f97316; background: rgba(249,115,22,0.05); }
        .btn-ghost-sm { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #6b7280; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; padding: 3px 6px; border-radius: 5px; transition: color .15s; }
        .btn-ghost-sm:hover { color: #f97316; }
        .btn-solve { width: 100%; padding: 11px 0; border-radius: 7px; background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.22); color: #f97316; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background .2s, border-color .2s, box-shadow .2s, transform .15s; }
        .btn-solve:hover { background: rgba(249,115,22,0.13); border-color: rgba(249,115,22,0.45); box-shadow: 0 0 20px rgba(249,115,22,0.18); transform: translateY(-1px); }
        .btn-save { width: 100%; padding: 10px 0; border-radius: 7px; background: rgba(249,115,22,0.07); border: 1px solid rgba(249,115,22,0.22); color: #f97316; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background .2s, border-color .2s, box-shadow .2s, transform .15s; }
        .btn-save:hover { background: rgba(249,115,22,0.14); border-color: rgba(249,115,22,0.45); box-shadow: 0 0 18px rgba(249,115,22,0.2); transform: translateY(-1px); }
        .conf-btn { background: transparent; border: 1px solid #1c1f26; border-radius: 6px; padding: 8px 0; cursor: pointer; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; transition: border-color .18s, color .18s, background .18s, transform .12s; }
        .conf-btn:hover:not(.conf-active) { border-color: rgba(249,115,22,0.28); color: rgba(249,115,22,0.7); background: rgba(249,115,22,0.05); transform: translateY(-1px); }
        .btn-bookmark { display: flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 6px; background: transparent; border: 1px solid #1c1f26; cursor: pointer; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; transition: border-color .18s, color .18s, background .18s; }
        .btn-bookmark:hover, .btn-bookmark.active { border-color: rgba(249,115,22,0.35); color: #f97316; background: rgba(249,115,22,0.07); }
        .code { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; background: #0d0f14; border: 1px solid rgba(249,115,22,0.12); border-radius: 6px; padding: 10px 14px; color: #9ca3b8; line-height: 1.6; }
        .re { outline: none; min-height: 130px; font-family: 'IBM Plex Sans', sans-serif; font-size: 13.5px; color: #9ca3b8; line-height: 1.78; caret-color: #f97316; padding: 12px 0; border-top: 1px solid rgba(249,115,22,0.15); transition: border-color .2s; direction: ltr !important; unicode-bidi: embed !important; text-align: left !important; }
        .re * { direction: ltr !important; unicode-bidi: embed !important; text-align: left !important; }
        .re:focus { border-top-color: rgba(249,115,22,0.35); }
        .re h3 { font-size: .95rem; font-weight: 700; color: #e5e7eb; margin: .5rem 0 .25rem; }
        .re p { margin: .2rem 0; }
        .re ul { list-style: disc; padding-left: 1.25rem; margin: .25rem 0; }
        .re ol { list-style: decimal; padding-left: 1.25rem; margin: .25rem 0; }
        .re li { margin: .15rem 0; }
        .re b, .re strong { color: #e5e7eb; font-weight: 600; }
        .re mark { background: rgba(249,115,22,0.22); color: inherit; border-radius: 2px; padding: 0 2px; }
        .re p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #4b5563; pointer-events: none; font-style: italic; float: left; height: 0; }
        .re-tool:hover { color: #f97316 !important; background: rgba(249,115,22,0.09) !important; }
        .sticky-sidebar { position: sticky; top: 49px; }
        .editorial-btn:hover .et-icon { color: #f97316 !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1c1f26; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.35); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes solvedPop { 0%{transform:scale(.9);opacity:0} 55%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        .solved-pop { animation: solvedPop .32s ease-out; }

        /* ── CHAT STYLES ── */
        .mentor-wrap { display: flex; flex-direction: column; height: 100%; min-height: 520px; }
        .mentor-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #1c1f26; flex-shrink: 0; }
        .mentor-header__left { display: flex; align-items: center; gap: 8px; }
        .mentor-title { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; color: #9ca3b8; letter-spacing: 0.08em; text-transform: uppercase; }
        .online-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; }
        .badge-plus { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #f97316; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.22); border-radius: 4px; padding: 2px 8px; letter-spacing: 0.06em; text-transform: uppercase; }
        .chat-scroll { flex: 1; overflow-y: auto; padding: 16px 0; display: flex; flex-direction: column; }
        .messages { display: flex; flex-direction: column; gap: 14px; padding-bottom: 4px; }
        .bubble-row { display: flex; align-items: flex-end; gap: 8px; }
        .bubble-row--user { flex-direction: row-reverse; }
        .bubble-avatar { width: 26px; height: 26px; border-radius: 50%; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.18); display: flex; align-items: center; justify-content: center; color: rgba(249,115,22,0.7); flex-shrink: 0; margin-bottom: 20px; }
        .bubble { max-width: 82%; border-radius: 14px; padding: 10px 14px 6px; position: relative; }
        .bubble--user { background: rgba(249,115,22,0.09); border: 1px solid rgba(249,115,22,0.18); border-bottom-right-radius: 4px; }
        .bubble--ai { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); border-bottom-left-radius: 4px; }
        .bubble--typing { padding: 14px 18px; display: flex; align-items: center; gap: 5px; }
        .bubble-text { font-family: 'IBM Plex Sans', sans-serif; font-size: 13.5px; line-height: 1.72; color: #c9d1e0; margin: 0; }
        .bubble-text--ai { color: #b0bac9; }
        .bubble-text--ai strong { color: #e5e7eb; font-weight: 600; }
        .bubble-text--ai em { color: #9ca3b8; font-style: italic; }
        .bubble-text--ai code { font-family: 'IBM Plex Mono', monospace; font-size: 12px; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.15); border-radius: 4px; padding: 1px 6px; color: #f97316; }
        .bubble-text--ai ul { padding-left: 18px; margin: 8px 0; list-style: none; }
        .bubble-text--ai ul li { position: relative; padding-left: 14px; margin: 5px 0; color: #b0bac9; font-size: 13.5px; line-height: 1.65; }
        .bubble-text--ai ul li::before { content: '·'; position: absolute; left: 0; color: #f97316; font-size: 18px; line-height: 1.2; }
        .bubble-footer { display: flex; justify-content: flex-end; margin-top: 5px; }
        .copy-btn { display: flex; align-items: center; gap: 4px; padding: 3px 7px; border-radius: 5px; border: none; cursor: pointer; background: rgba(255,255,255,0.04); color: #4b5563; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.05em; transition: background .15s, color .15s; }
        .copy-btn:hover { background: rgba(249,115,22,0.08); color: #f97316; }
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #4b5563; animation: typingBounce 1.2s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: .2s; }
        .typing-dot:nth-child(3) { animation-delay: .4s; }
        @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-5px); opacity: 1; } }
        .starters { padding: 8px 0; }
        .starters__label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #4b5563; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
        .starter-btn { display: block; width: 100%; text-align: left; padding: 9px 12px; margin-bottom: 5px; font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; color: #5a6478; background: rgba(249,115,22,0.025); border: 1px solid #1c1f26; border-radius: 8px; cursor: pointer; transition: color .15s, border-color .15s, background .15s, transform .12s; }
        .starter-btn:hover { color: #f97316; border-color: rgba(249,115,22,0.28); background: rgba(249,115,22,0.055); transform: translateX(3px); }
        .chat-composer { flex-shrink: 0; border-top: 1px solid #1c1f26; padding-top: 12px; }
        .chat-composer__inner { position: relative; }
        .chat-input { font-family: 'IBM Plex Sans', sans-serif; width: 100%; min-height: 44px; max-height: 120px; overflow-y: auto; background: rgba(249,115,22,0.03); border: 1px solid #1c1f26; border-radius: 10px; padding: 11px 46px 11px 14px; font-size: 13.5px; color: #c9d1e0; outline: none; line-height: 1.55; transition: border-color .2s; direction: ltr !important; text-align: left !important; white-space: pre-wrap; word-wrap: break-word; }
        .chat-input p { margin: 0; }
        .chat-input p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #4b5563; pointer-events: none; float: left; height: 0; font-style: italic; }
        .ProseMirror { white-space: pre-wrap; word-wrap: break-word; }
        .ProseMirror:focus { outline: none; }
        .send-btn { position: absolute; right: 9px; bottom: 9px; width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; background: #1c1f26; color: #3f4756; transition: all .2s; }
        .send-btn--active { background: linear-gradient(135deg, #f97316, #ea580c); color: #000; box-shadow: 0 0 12px rgba(249,115,22,0.4); }
        .send-btn--active:hover { box-shadow: 0 0 20px rgba(249,115,22,0.55); transform: scale(1.05); }
        .composer-hint { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #374151; margin-top: 6px; letter-spacing: 0.05em; }
        .paywall-preview { position: relative; overflow: hidden; flex: 1; margin: 12px 0; min-height: 160px; }
        .paywall-fade { position: absolute; inset: 0; z-index: 2; background: linear-gradient(to bottom, transparent 10%, #0d0f14 92%); pointer-events: none; }
        .paywall-msg { font-size: 12.5px; line-height: 1.65; padding: 8px 12px; margin-bottom: 6px; border-radius: 8px; }
        .paywall-msg--user { color: #6b7280; background: rgba(249,115,22,0.04); border: 1px solid rgba(249,115,22,0.1); margin-left: 20px; }
        .paywall-msg--ai { color: #4b5563; margin-right: 20px; }
        .paywall-features { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 14px; }
        .paywall-feature { display: flex; align-items: center; gap: 7px; padding: 7px 9px; border-radius: 6px; background: rgba(249,115,22,0.03); border: 1px solid #1c1f26; }
        .paywall-feature__icon { color: #f97316; opacity: .7; }
        .paywall-feature__label { font-size: 11px; color: #9ca3b8; }
        .paywall-cta { width: 100%; padding: 11px 0; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 7px; }
      `}</style>

      <div className="page">
        <main
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "28px 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px solid rgba(249,115,22,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
                flex: 1,
              }}
            >
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#e5e7eb",
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
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: diffColor,
                  flexShrink: 0,
                  padding: "4px 10px",
                  borderRadius: 6,
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
                gap: 10,
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
                  <BookmarkCheck size={13} />
                ) : (
                  <Bookmark size={13} />
                )}
                {progress.bookmark ? "Bookmarked" : "Bookmark"}
              </button>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-og"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 16px",
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={12} /> Solve on LeetCode
              </a>
            </div>
          </div>

          {/* Layer 1: Problem + Progress */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 316px",
              gap: 14,
              marginBottom: 14,
            }}
          >
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

            <div className="sticky-sidebar">
              <div
                className="card"
                style={{ borderRadius: 10, padding: "22px 20px" }}
              >
                <div className="card-title">
                  <Trophy size={16} className="card-title-icon" />
                  Your Progress
                </div>
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
                      {pendingSolved && <PendingDot />}
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
                    {pendingConfidence && <PendingDot />}
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
                      <PendingDot />
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

          {/* Layer 2: Editorial + AI Mentor */}
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
              style={{ borderRadius: 10, padding: "22px 24px", minHeight: 500 }}
            >
              <AIMentor
                problemId={p.id}
                title={p.title}
                isPremium={isPremium}
              />
            </div>
          </div>

          {/* Layer 3: Discussion */}
          <div style={{ paddingTop: 14 }}>
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(249,115,22,0.18) 30%, rgba(249,115,22,0.18) 70%, transparent)",
                marginBottom: 22,
              }}
            />
            <p className="slabel" style={{ marginBottom: 18 }}>
              Discussion
            </p>
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
