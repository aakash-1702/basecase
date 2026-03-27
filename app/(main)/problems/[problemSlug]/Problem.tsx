"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Cloud,
  Loader2,
  Bookmark,
  BookmarkCheck,
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
  Zap,
  StickyNote,
  Copy,
  Check,
  Play,
  FileText,
  ChevronRight,
  Info,
} from "lucide-react";
import { Problem, UserProblem } from "@/generated/prisma/client";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import HighlightExt from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import dynamic from "next/dynamic";
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false },
);

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

interface InputFormatItem {
  name: string;
  type: string;
  desc: string;
  sizeVar?: string;
}

// TestCase type for the problem
interface TestCase {
  id: string;
  input: string;
  displayInput?: string | null;
  displayOutput?: string | null;
  expectedOutput: string;
  order: number;
}

// Extend Problem type to include testCases
type ProblemWithTestCases = Problem & {
  inputFormat?: InputFormatItem[] | null;
  testCases?: TestCase[];
};

const CONF: Record<
  ConfidenceV2,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  LOW: {
    label: "Low",
    color: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.2)",
    glow: "rgba(248,113,113,0.15)",
  },
  MEDIUM: {
    label: "Med",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.2)",
    glow: "rgba(251,191,36,0.15)",
  },
  HIGH: {
    label: "High",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    glow: "rgba(16,185,129,0.15)",
  },
};

const DIFF_STYLES: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  easy: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
  },
  medium: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
  },
  hard: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.25)",
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
    .replace(/((<li.*<\/li>\n?)+)/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n(?!<)/g, "<br/>")
    .replace(/(<br\/>){2,}/g, "<br/><br/>");
}
const parseStdin = (example: string): string => {
  let s = example;
  s = s.replace(/input:/i, "");
  const cutAt = s.search(/→|output:/i);
  if (cutAt !== -1) s = s.substring(0, cutAt);
  return s.trim().replace(/\\n/g, "\n");
};

// ── INPUT FORMAT PARSING ──
interface TestCaseData {
  input: string;
  displayInput?: string | null;
}

function parseInputFormat(testCase?: TestCaseData): InputFormatItem[] {
  if (!testCase?.input) return [];

  const lines = testCase.input.split("\n").filter((l) => l.trim());
  const result: InputFormatItem[] = [];

  // Parse displayInput to extract variable names: "g = [1,2,3], s = [1,1]"
  const varMap: Record<string, { isArray: boolean; values: string[] }> = {};
  if (testCase.displayInput) {
    const assignments = testCase.displayInput.split(",").map((s) => s.trim());
    for (const assign of assignments) {
      const match = assign.match(/^(\w+)\s*=\s*(.+)$/);
      if (match) {
        const [, varName, value] = match;
        const isArray = value.startsWith("[");
        const values = isArray
          ? value
              .replace(/[\[\]]/g, "")
              .split(",")
              .map((v) => v.trim())
          : [value.trim()];
        varMap[varName] = { isArray, values };
      }
    }
  }

  const varNames = Object.keys(varMap);
  let varIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);
    const isArray = parts.length > 1;

    // Try to match with variable from displayInput
    let name = "";
    let desc = "";
    let sizeVar: string | undefined;

    if (varIndex < varNames.length) {
      const currentVar = varNames[varIndex];
      const varData = varMap[currentVar];

      if (!isArray && !varData.isArray) {
        // Single value - likely a size variable
        const nextVar = varNames[varIndex + 1];
        if (nextVar && varMap[nextVar]?.isArray) {
          name = `n`;
          desc = `size of array ${nextVar}`;
          // Don't increment varIndex yet - the array comes next
        } else {
          name = currentVar;
          desc = `value of ${currentVar}`;
          varIndex++;
        }
      } else if (isArray && varData.isArray) {
        // Array values
        name = currentVar;
        desc = `array ${currentVar}`;
        // Find the size variable (previous single value)
        if (result.length > 0) {
          const prevItem = result[result.length - 1];
          if (!prevItem.type.includes("[]")) {
            sizeVar = prevItem.name;
          }
        }
        varIndex++;
      } else if (!isArray && varData.isArray) {
        // Size before array
        name = `n`;
        desc = `size of array ${currentVar}`;
      } else {
        // Array without matching variable
        name = currentVar;
        desc = `array values`;
        varIndex++;
      }
    } else {
      // Fallback naming
      name = isArray ? `arr${i}` : `n${i}`;
      desc = isArray ? "array values" : "integer value";
    }

    result.push({
      name,
      type: isArray ? "int[]" : "int",
      desc,
      sizeVar,
    });
  }

  return result;
}

// ── INPUT FORMAT STRIP COMPONENT ──
function InputFormatStrip({ items }: { items: InputFormatItem[] }) {
  if (!items.length) return null;

  // Render description with variable names in code style
  const renderDesc = (desc: string, sizeVar?: string) => {
    let text = desc;
    if (sizeVar) {
      text += ` (${sizeVar} elements)`;
    }
    // Wrap variable names in code tags
    const parts = text.split(/(\b[a-z]\b|\b[a-z]\d*\b|\barr\d*\b)/gi);
    return parts.map((part, i) => {
      if (/^[a-z]\d*$|^arr\d*$/i.test(part) && part.length <= 4) {
        return (
          <code
            key={i}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              background: "rgba(255,255,255,0.08)",
              padding: "1px 4px",
              borderRadius: 3,
              color: "#9a9aaa",
            }}
          >
            {part}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="pp-input-format-strip">
      <div className="pp-input-format-header">
        <Info size={14} color="#606070" />
        <span className="pp-input-format-title">
          Input format — read in this order
        </span>
      </div>
      <div className="pp-input-format-rows">
        {items.map((item, i) => {
          const isArray = item.type.includes("[]");
          return (
            <div key={i} className="pp-input-format-row">
              <span className="pp-input-format-line">{i + 1}</span>
              <span
                className="pp-input-format-pill"
                style={{
                  background: isArray
                    ? "rgba(34, 197, 94, 0.12)"
                    : "rgba(168, 85, 247, 0.12)",
                  color: isArray ? "#4ade80" : "#c084fc",
                }}
              >
                {item.type} {item.name}
              </span>
              <span className="pp-input-format-arrow">→</span>
              <span className="pp-input-format-desc">
                {renderDesc(item.desc, item.sizeVar)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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
                  background: "rgba(255,255,255,0.06)",
                  margin: "0 4px",
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
                padding: "6px 8px",
                borderRadius: 6,
                border: "none",
                cursor: disabled ? "default" : "pointer",
                color: t.active ? "#f59e0b" : "#6b7280",
                background: t.active ? "rgba(245,158,11,0.1)" : "transparent",
                transition: "all .2s ease",
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

// ── CHAT INPUT ──
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
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/ai-agent?problemId=${problemId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setMessages(
            data.data.map((m: { role: string; text: string }) => ({
              role: m.role === "model" ? "assistant" : "user",
              content: m.text,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
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
      console.error("Error fetching AI response:", err);
      toast.error("Failed to get AI response. Please try again.");
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
            <Bot size={14} color="#f59e0b" />
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
        <Link href="/subscription" className="paywall-cta">
          <Zap size={12} /> Unlock AI Mentor · Upgrade to Plus
        </Link>
      </div>
    );

  return (
    <div className="mentor-wrap">
      <div className="mentor-header">
        <div className="mentor-header__left">
          <span className="online-dot" />
          <Bot size={14} color="#f59e0b" />
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
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
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

// ── COLLAPSIBLE SECTION ──
function CollapsibleSection({
  id,
  icon,
  title,
  rightExtra,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  rightExtra?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div id={id} className="collapsible-card">
      <button onClick={onToggle} className="collapsible-header">
        <div className="collapsible-header__left">
          <span
            className={`collapsible-icon ${isOpen ? "collapsible-icon--active" : ""}`}
          >
            {icon}
          </span>
          <span
            className={`collapsible-title ${isOpen ? "collapsible-title--active" : ""}`}
          >
            {title}
          </span>
        </div>
        <div className="collapsible-header__right">
          {rightExtra}
          <span
            className={`collapsible-toggle ${isOpen ? "collapsible-toggle--active" : ""}`}
          >
            <ChevronDown
              size={14}
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </span>
        </div>
      </button>
      <div
        className="collapsible-content-wrapper"
        style={{
          height: isOpen ? (height ?? "auto") : 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="collapsible-content">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── SOLVE DIALOG ──
function SolveDialog({
  problemTitle,
  passed,
  total,
  onClose,
  onSave,
}: {
  problemTitle: string;
  passed: number;
  total: number;
  onClose: () => void;
  onSave: (data: {
    difficulty: string;
    confidence: string;
    insight: string;
    enableReview: boolean;
  }) => Promise<void>;
}) {
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [insight, setInsight] = useState("");
  const [reviewEnabled, setReviewEnabled] = useState(true);
  const userToggledRef = useRef(false);
  const [confFlash, setConfFlash] = useState(false);
  const [phase, setPhase] = useState<"form" | "saving" | "saved">("form");

  const motivationalLines = [
    "Every problem solved is a step closer to mastery.",
    "Your future self will thank you for this grind.",
    "Consistency beats talent. Keep showing up.",
    "One more problem down. Unstoppable.",
    "You're building something incredible — one solve at a time.",
    "The best coders aren't born, they're forged.",
  ];
  const motiveRef = useRef(
    motivationalLines[Math.floor(Math.random() * motivationalLines.length)],
  );

  useEffect(() => {
    if (!difficulty) return;
    let autoConf: string;
    if (difficulty === "TOO_EASY" || difficulty === "EASY") autoConf = "HIGH";
    else if (difficulty === "JUST_RIGHT") autoConf = "MEDIUM";
    else autoConf = "LOW";
    setConfidence(autoConf);
    if (!userToggledRef.current) setReviewEnabled(autoConf !== "HIGH");
    setConfFlash(true);
    setTimeout(() => setConfFlash(false), 300);
  }, [difficulty]);

  const diffOpts = [
    { value: "TOO_EASY", label: "Too Easy" },
    { value: "EASY", label: "Easy" },
    { value: "JUST_RIGHT", label: "Just Right" },
    { value: "HARD", label: "Hard" },
    { value: "VERY_HARD", label: "Very Hard" },
  ];
  const confOpts = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  const diffSelectedStyle: Record<string, React.CSSProperties> = {
    TOO_EASY: {
      background: "rgba(16,185,129,0.08)",
      borderColor: "rgba(16,185,129,0.3)",
      color: "#10b981",
      boxShadow: "0 0 12px rgba(16,185,129,0.1)",
    },
    EASY: {
      background: "rgba(16,185,129,0.06)",
      borderColor: "rgba(16,185,129,0.25)",
      color: "#10b981",
    },
    JUST_RIGHT: {
      background: "rgba(249,115,22,0.08)",
      borderColor: "rgba(249,115,22,0.3)",
      color: "#f97316",
      boxShadow: "0 0 12px rgba(249,115,22,0.1)",
    },
    HARD: {
      background: "rgba(239,68,68,0.06)",
      borderColor: "rgba(239,68,68,0.25)",
      color: "#ef4444",
    },
    VERY_HARD: {
      background: "rgba(239,68,68,0.1)",
      borderColor: "rgba(239,68,68,0.35)",
      color: "#ef4444",
      boxShadow: "0 0 12px rgba(239,68,68,0.1)",
    },
  };
  const confSelectedStyle: Record<string, React.CSSProperties> = {
    LOW: {
      background: "rgba(239,68,68,0.08)",
      borderColor: "rgba(239,68,68,0.28)",
      color: "#ef4444",
    },
    MEDIUM: {
      background: "rgba(245,158,11,0.08)",
      borderColor: "rgba(245,158,11,0.28)",
      color: "#f59e0b",
    },
    HIGH: {
      background: "rgba(16,185,129,0.08)",
      borderColor: "rgba(16,185,129,0.28)",
      color: "#10b981",
    },
  };

  const btnBase: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "7px 14px",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 180ms ease-out",
    border: "1px solid #1c1f26",
    background: "rgba(255,255,255,0.02)",
    color: "#4b5563",
  };

  return (
    <>
      <style>{`
        @keyframes dialogEntrance {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes confPulse {
          0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; }
        }
        .sd-textarea::placeholder { color: #2a2d35 !important; }
        .sd-textarea:focus { border-color: rgba(249,115,22,0.35) !important; background: rgba(249,115,22,0.02) !important; }
        .sd-pill:hover:not([data-active="true"]) { border-color: #2a2d35 !important; color: #6b7280 !important; background: rgba(255,255,255,0.04) !important; }
        .sd-pill:active { transform: scale(0.96); }
        .sd-skip:hover { color: #6b7280 !important; text-decoration: underline; text-decoration-color: #2a2d35; }
        .sd-save:hover:not(:disabled) { box-shadow: 0 0 32px rgba(249,115,22,0.45) !important; transform: translateY(-1px); filter: brightness(1.05); }
        .sd-save:active:not(:disabled) { transform: translateY(0) !important; }
        @keyframes sdSpin { to { transform: rotate(360deg); } }
        @keyframes sdFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            background: "#0d0f14",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: 16,
            width: 520,
            maxWidth: "92vw",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            animation: "dialogEntrance 280ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Top highlight line (green for success) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)",
              pointerEvents: "none",
            }}
          />

          {phase === "saving" && (
            <div
              style={{
                padding: "80px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "2.5px solid #1c1f26",
                  borderTopColor: "#f97316",
                  borderRadius: "50%",
                  animation: "sdSpin 0.8s linear infinite",
                }}
              />
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: "#6b7280",
                  letterSpacing: "0.04em",
                }}
              >
                Saving progress…
              </p>
            </div>
          )}

          {phase === "saved" && (
            <div
              style={{
                padding: "64px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                animation: "sdFadeUp 400ms ease-out",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.08)",
                  border: "1.5px solid rgba(16,185,129,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <CheckCircle size={28} color="#10b981" />
              </div>
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#e5e7eb",
                  letterSpacing: "-0.01em",
                }}
              >
                Enjoy solving! 🚀
              </p>
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 13,
                  color: "#6b7280",
                  textAlign: "center",
                  maxWidth: 340,
                  lineHeight: 1.6,
                }}
              >
                {motiveRef.current}
              </p>
            </div>
          )}

          {phase === "form" && (
            <>
              {/* ── SECTION 1: SUCCESS HEADER ── */}
              <div
                style={{
                  padding: "32px 32px 24px",
                  textAlign: "center",
                  borderBottom: "1px solid #1c1f26",
                }}
              >
                {/* Layered checkmark rings */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(16,185,129,0.2)",
                    background: "rgba(16,185,129,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(16,185,129,0.35)",
                      background: "rgba(16,185,129,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle size={26} color="#10b981" />
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#e5e7eb",
                    letterSpacing: "-0.01em",
                    marginBottom: 6,
                  }}
                >
                  All Tests Passed!
                </p>
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "#6b7280",
                    letterSpacing: "0.04em",
                    marginBottom: 10,
                  }}
                >
                  {problemTitle}
                </p>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: 20,
                    padding: "4px 14px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#10b981",
                  }}
                >
                  {total > 0
                    ? `${passed} / ${total} test cases passed`
                    : "All tests passed"}
                </span>
              </div>

              {/* ── SECTION 2: FORM BODY ── */}
              <div
                style={{
                  padding: "24px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                }}
              >
                {/* Difficulty */}
                <div>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#9ca3b8",
                      marginBottom: 10,
                    }}
                  >
                    How hard did this feel?
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {diffOpts.map((o) => {
                      const active = difficulty === o.value;
                      return (
                        <button
                          key={o.value}
                          className="sd-pill"
                          data-active={active}
                          onClick={() => setDifficulty(o.value)}
                          style={{
                            ...btnBase,
                            ...(active ? diffSelectedStyle[o.value] : {}),
                          }}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ height: 1, background: "#1c1f26" }} />

                {/* Confidence */}
                <div>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#9ca3b8",
                      marginBottom: 10,
                    }}
                  >
                    Your confidence level?
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      animation: confFlash
                        ? "confPulse 300ms ease-out"
                        : undefined,
                    }}
                  >
                    {confOpts.map((o) => {
                      const active = confidence === o.value;
                      return (
                        <button
                          key={o.value}
                          className="sd-pill"
                          data-active={active}
                          onClick={() => {
                            setConfidence(o.value);
                            if (!userToggledRef.current)
                              setReviewEnabled(o.value !== "HIGH");
                          }}
                          style={{
                            ...btnBase,
                            ...(active ? confSelectedStyle[o.value] : {}),
                          }}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ height: 1, background: "#1c1f26" }} />

                {/* Key insight */}
                <div>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#9ca3b8",
                      marginBottom: 10,
                    }}
                  >
                    Key insight? (optional)
                  </p>
                  <textarea
                    className="sd-textarea"
                    value={insight}
                    onChange={(e) => setInsight(e.target.value)}
                    maxLength={280}
                    placeholder="What was the key idea? What pattern did you recognize?"
                    style={{
                      width: "100%",
                      minHeight: 80,
                      maxHeight: 160,
                      resize: "vertical",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid #1c1f26",
                      borderRadius: 8,
                      padding: "12px 14px",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 13,
                      color: "#c9d1e0",
                      lineHeight: 1.6,
                      outline: "none",
                      transition: "all 200ms ease-out",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      color: "#374151",
                      textAlign: "right",
                      marginTop: 4,
                    }}
                  >
                    {insight.length}/280
                  </p>
                </div>

                <div style={{ height: 1, background: "#1c1f26" }} />

                {/* Toggle */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid #1c1f26",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#c9d1e0",
                      }}
                    >
                      Remind me to review this
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        color: "#4b5563",
                      }}
                    >
                      We&apos;ll schedule a review based on your confidence
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      userToggledRef.current = true;
                      setReviewEnabled(!reviewEnabled);
                    }}
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 11,
                      border: reviewEnabled
                        ? "1px solid rgba(249,115,22,0.5)"
                        : "1px solid #2a2d35",
                      cursor: "pointer",
                      background: reviewEnabled ? "#f97316" : "#1c1f26",
                      position: "relative",
                      transition: "all 200ms ease-out",
                      padding: 0,
                      flexShrink: 0,
                      boxShadow: reviewEnabled
                        ? "0 0 10px rgba(249,115,22,0.25)"
                        : "none",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: reviewEnabled ? 20 : 2,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "white",
                        transition: "all 200ms ease-out",
                        boxShadow: reviewEnabled
                          ? "0 0 6px rgba(249,115,22,0.4)"
                          : "none",
                      }}
                    />
                  </button>
                </div>
              </div>

              <div style={{ height: 1, background: "#1c1f26" }} />

              {/* ── SECTION 3: ACTIONS ── */}
              <div
                style={{
                  padding: "20px 32px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  className="sd-skip"
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#4b5563",
                    cursor: "pointer",
                    padding: "8px 4px",
                    transition: "color 150ms",
                  }}
                >
                  Skip for now
                </button>
                <button
                  className="sd-save"
                  disabled={!difficulty}
                  onClick={async () => {
                    if (!difficulty || !confidence) return;
                    setPhase("saving");
                    try {
                      await onSave({
                        difficulty,
                        confidence,
                        insight,
                        enableReview: reviewEnabled,
                      });
                      setPhase("saved");
                      setTimeout(() => onClose(), 2000);
                    } catch {
                      setPhase("form");
                    }
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    border: "none",
                    color: "#000",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    cursor: !difficulty ? "not-allowed" : "pointer",
                    boxShadow: difficulty
                      ? "0 0 20px rgba(249,115,22,0.25)"
                      : "none",
                    transition: "all 200ms ease-out",
                    opacity: difficulty ? 1 : 0.35,
                  }}
                >
                  Save &amp; Continue
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── PAGE ──
export default function ProblemPage({
  problem: p,
  userProblem,
  isPremium = false,
  inputFormat,
}: {
  problem: ProblemWithTestCases;
  userProblem?: UserProblem | null;
  isPremium?: boolean;
  inputFormat?: string;
}) {
  const editorial = parseEditorial(p.editorial);
  const aiHintLines = parseLines(p.aiHints);
  const examples = (Array.isArray(p.examples) ? p.examples : []) as string[];
  const companies = (Array.isArray(p.companies) ? p.companies : []) as string[];
  const tags = (Array.isArray(p.tags) ? p.tags : []) as string[];
  const defaultStdin =
    (p.testCases as any[])?.find((tc) => tc.visibility === "PUBLIC")?.input ??
    "";

  // Parse input format from first test case
  const inputFormatItems = React.useMemo(() => {
    if (p.testCases && p.testCases.length > 0) {
      return parseInputFormat(p.testCases[0]);
    }
    return [];
  }, [p.testCases]);

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

  // Editor state
  const [language, setLanguage] = useState("cpp");
  const [codeData, setCodeData] = useState("// Start coding here");
  const [stdout, setStdout] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<"success" | "error">("success");
  const [errorType, setErrorType] = useState<
    "Compile Error" | "Runtime Error" | null
  >(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"testcase" | "output">("testcase");
  const [stdinValue, setStdinValue] = useState(() => {
    if (p.testCases && p.testCases.length > 0) {
      const tc =
        (p.testCases as any[]).find((t) => t.visibility === "PUBLIC") ||
        p.testCases[0];
      return tc.input || "";
    }
    return defaultStdin;
  });
  const [runOutput, setRunOutput] = useState<{
    stdout: string | null;
    outputType: "success" | "error";
    errorType: "Compile Error" | "Runtime Error" | null;
  } | null>(null);
  const [submitOutput, setSubmitOutput] = useState<{
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
  } | null>(null);
  const [showSolveDialog, setShowSolveDialog] = useState(false);

  // Drag-resizable IO strip
  const [ioHeight, setIoHeight] = useState(220);
  const ioStripRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);
  const MIN_IO = 100;
  const MAX_IO_RATIO = 0.6;

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragStartY.current = clientY;
      dragStartH.current = ioStripRef.current?.offsetHeight ?? ioHeight;
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [ioHeight],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const container = ioStripRef.current?.parentElement;
      if (!container || !ioStripRef.current) return;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const maxIO = container.offsetHeight * MAX_IO_RATIO;
      const delta = dragStartY.current - clientY;
      const nextHeight = Math.min(
        maxIO,
        Math.max(MIN_IO, dragStartH.current + delta),
      );
      ioStripRef.current.style.height = `${nextHeight}px`;
    };

    const onEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (ioStripRef.current) {
        setIoHeight(ioStripRef.current.offsetHeight);
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);

  // Refs to always read latest values (avoids stale closures)
  const codeRef = useRef(codeData);
  codeRef.current = codeData;
  const langRef = useRef(language);
  langRef.current = language;
  const stdinRef = useRef(stdinValue);
  stdinRef.current = stdinValue;

  const handleRun = useCallback(async () => {
    const currentCode = codeRef.current;
    const currentLang = langRef.current;
    const currentStdin = stdinRef.current;

    setRunning(true);
    setStdout(null);
    setErrorType(null);
    setRunOutput(null);
    setSubmitOutput(null);
    setActiveTab("output");
    try {
      const res = await fetch(`/api/problems/${p.slug}/problem/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: currentCode,
          language: currentLang,
          stdin: currentStdin,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStdout(data.error);
        setOutputType("error");
        setErrorType("Runtime Error");
        setRunOutput({
          stdout: data.error,
          outputType: "error",
          errorType: "Runtime Error",
        });
        return;
      }
      const status = (data.status || "").toLowerCase();
      if (status.includes("compilation error")) {
        const msg = data.compile_output || "Compilation failed";
        setStdout(msg);
        setOutputType("error");
        setErrorType("Compile Error");
        setRunOutput({
          stdout: msg,
          outputType: "error",
          errorType: "Compile Error",
        });
      } else if (
        status.includes("error") ||
        status.includes("time limit") ||
        status.includes("memory limit")
      ) {
        const msg = data.stderr || data.stdout || status;
        setStdout(msg);
        setOutputType("error");
        setErrorType("Runtime Error");
        setRunOutput({
          stdout: msg,
          outputType: "error",
          errorType: "Runtime Error",
        });
      } else {
        setStdout(data.stdout ?? "");
        setOutputType("success");
        setErrorType(null);
        setRunOutput({
          stdout: data.stdout ?? "",
          outputType: "success",
          errorType: null,
        });
      }
    } catch {
      setStdout("Something went wrong. Try again.");
      setOutputType("error");
      setErrorType("Runtime Error");
      setRunOutput({
        stdout: "Something went wrong. Try again.",
        outputType: "error",
        errorType: "Runtime Error",
      });
    } finally {
      setRunning(false);
    }
  }, [p.slug]); // eslint-disable-line

  const handleSubmit = useCallback(async () => {
    const currentCode = codeRef.current;
    const currentLang = langRef.current;
    setSubmitting(true);
    setRunOutput(null);
    setSubmitOutput(null);
    setActiveTab("output");
    try {
      const res = await fetch(`/api/problems/${p.slug}/problem/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode, language: currentLang }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setSubmitOutput({
          accepted: false,
          passed: 0,
          total: 0,
          compileError: json.message || "Submission failed",
          results: [],
        });
        return;
      }

      const data = json.data;
      const results = (data.results || []).map((r: any) => ({
        passed: r.passed,
        isPublic: r.isPublic ?? true,
        input: r.input || null,
        displayInput: r.displayInput || null,
        expected: r.expected || null,
        displayOutput: r.displayOutput || null,
        got: r.got || null,
        status: r.status || (r.passed ? "Accepted" : "Wrong Answer"),
        error: r.error || null,
      }));

      const output = {
        accepted: data.accepted,
        passed: data.passed,
        total: data.total,
        results,
      };
      setSubmitOutput(output);
      if (output.accepted) setShowSolveDialog(true);
    } catch {
      setSubmitOutput({
        accepted: false,
        passed: 0,
        total: 0,
        compileError: "Something went wrong. Try again.",
        results: [],
      });
    } finally {
      setSubmitting(false);
    }
  }, [p.slug]); // eslint-disable-line

  const handleSolveDialogSave = useCallback(
    async (data: {
      difficulty: string;
      confidence: string;
      insight: string;
      enableReview: boolean;
    }) => {
      try {
        const res = await fetch(`/api/problems/${p.slug}/problem`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            solved: true,
            confidenceV2: data.confidence,
            perceivedDifficulty: data.difficulty,
            keyInsight: data.insight,
            enableReview: data.enableReview,
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.message ?? "Save failed");
        setProgress((prev) => ({
          ...prev,
          solved: true,
          confidenceV2: data.confidence as ConfidenceV2,
        }));
        setCommitted((prev) => ({
          ...prev,
          solved: true,
          confidenceV2: data.confidence as ConfidenceV2,
        }));
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to save progress");
        throw err; // re-throw so dialog reverts to form
      }
    },
    [p.slug],
  ); // eslint-disable-line

  // Collapsible states
  const [editorialOpen, setEditorialOpen] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [aiMentorOpen, setAiMentorOpen] = useState(false);

  useEffect(() => {
    const s = toState(userProblem);
    setProgress(s);
    setCommitted(s);
  }, [userProblem]); // eslint-disable-line

  const diffStyle = DIFF_STYLES[p.difficulty] || DIFF_STYLES.medium;
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --bg-base: #080808;
          --bg-elevated: #0f0f0f;
          --bg-card: #141414;
          --bg-hover: #1a1a1a;
          --border-subtle: rgba(255,255,255,0.06);
          --border-medium: rgba(255,255,255,0.1);
          --text-primary: #e8e8ed;
          --text-secondary: #9a9aaa;
          --text-muted: #555555;
          --accent-primary: #f59e0b;
          --accent-secondary: #ea580c;
          --accent-glow: rgba(245,158,11,0.15);
          --success: #10b981;
          --warning: #fbbf24;
          --error: #f87171;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: var(--bg-base); }

        /* ── PAGE LAYOUT ── */
        .pp-page {
          font-family: var(--font-sans);
          height: 100vh;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: pageIn 0.5s ease-out;
        }

        @keyframes pageIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── TOP BAR ── */
        .pp-topbar {
          height: 52px;
          background: transparent;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
          border-bottom: 1px solid rgba(120, 53, 15, 0.3);
        }

        .pp-topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        .pp-title {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .pp-diff-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 6px;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .pp-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 5px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.15);
          color: rgba(245,158,11,0.8);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .pp-tag:hover {
          background: rgba(245,158,11,0.12);
          border-color: rgba(245,158,11,0.25);
        }

        .pp-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* ── BOOKMARK BUTTON ── */
        .pp-bookmark-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-muted);
        }

        .pp-bookmark-btn:hover {
          background: rgba(245,158,11,0.06);
          border-color: rgba(245,158,11,0.2);
          color: var(--accent-primary);
          transform: translateY(-1px);
        }

        .pp-bookmark-btn--active {
          background: rgba(245,158,11,0.1);
          border-color: rgba(245,158,11,0.3);
          color: var(--accent-primary);
        }

        .pp-bookmark-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        /* ── SAVE BUTTON ── */
        .pp-save-btn {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.15) 100%);
          border: 1px solid rgba(245,158,11,0.3);
          color: var(--accent-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideInRight 0.3s ease-out;
        }

        .pp-save-btn:hover {
          background: linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(234,88,12,0.2) 100%);
          box-shadow: 0 4px 20px rgba(245,158,11,0.2);
          transform: translateY(-1px);
        }

        /* ── STATUS BADGE ── */
        .pp-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: all 0.2s ease;
        }

        .pp-status-badge--solved {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: var(--success);
        }

        .pp-status-badge--unsolved {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
        }

        .pp-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        /* ── NOTES SAVE BUTTON ── */
        .pp-notes-save-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .pp-notes-save-btn {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.15) 100%);
          border: 1px solid rgba(245,158,11,0.3);
          color: var(--accent-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pp-notes-save-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(234,88,12,0.2) 100%);
          box-shadow: 0 4px 20px rgba(245,158,11,0.2);
          transform: translateY(-1px);
        }

        .pp-notes-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── SECTION NAVIGATION ── */
        .pp-section-nav {
          background: linear-gradient(180deg, rgba(17,17,20,0.98) 0%, rgba(14,14,17,0.95) 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0 28px;
          flex-shrink: 0;
          position: relative;
          z-index: 9;
        }

        .pp-section-nav::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.15) 50%, transparent 100%);
        }

        .pp-section-nav-inner {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 0;
        }

        .pp-section-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
        }

        .pp-section-btn:hover {
          background: rgba(245,158,11,0.06);
          border-color: rgba(245,158,11,0.15);
          color: var(--text-secondary);
          transform: translateY(-1px);
        }

        .pp-section-btn--active {
          background: rgba(245,158,11,0.1);
          border-color: rgba(245,158,11,0.25);
          color: var(--accent-primary);
          box-shadow: 0 2px 12px rgba(245,158,11,0.15);
        }

        .pp-section-btn--active:hover {
          background: rgba(245,158,11,0.12);
          color: var(--accent-primary);
        }

        .pp-section-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(245,158,11,0.15);
          color: var(--accent-primary);
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        /* ── MAIN CONTENT ── */
        .pp-main-scroll {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .pp-main-scroll::-webkit-scrollbar { width: 6px; }
        .pp-main-scroll::-webkit-scrollbar-track { background: transparent; }
        .pp-main-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .pp-main-scroll::-webkit-scrollbar-thumb:hover { background: rgba(245,158,11,0.3); }

        /* ── BIG CARD ── */
        .pp-big-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          margin: 20px 28px;
          height: calc(100vh - 60px - 56px - 49px - 40px);
          display: grid;
          grid-template-columns: 40% 1fr;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 40px rgba(0,0,0,0.3);
          animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .pp-big-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent);
          pointer-events: none;
          z-index: 1;
        }

        /* ── LEFT PANEL ── */
        .pp-left {
          border-right: 1px solid var(--border-subtle);
          padding: 28px;
          overflow-y: auto;
          height: 100%;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }

        .pp-left::-webkit-scrollbar { width: 4px; }
        .pp-left::-webkit-scrollbar-track { background: transparent; }
        .pp-left::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        .pp-company-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 5px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.18);
          color: rgba(139,92,246,0.8);
          transition: all 0.2s ease;
        }

        .pp-company-badge:hover {
          background: rgba(139,92,246,0.12);
          transform: translateY(-1px);
        }

        .pp-description {
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.85;
          white-space: pre-line;
          font-family: var(--font-sans);
          margin-bottom: 32px;
        }

        .pp-examples-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .pp-examples-title {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .pp-example-card {
          background: rgba(245,158,11,0.03);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 16px 18px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }

        .pp-example-card:hover {
          border-color: rgba(245,158,11,0.15);
          background: rgba(245,158,11,0.05);
        }

        .pp-example-label {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .pp-example-pre {
          font-family: var(--font-mono);
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin: 0;
          white-space: pre-wrap;
        }

        /* ── RIGHT PANEL ── */
        .pp-right {
          padding: 0;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
        }

        .pp-toolbar {
          height: 48px;
          padding: 0 18px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .pp-file-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pp-file-name {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .pp-lang-select {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 5px 12px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease;
        }

        .pp-lang-select:hover {
          border-color: rgba(245,158,11,0.3);
          background: rgba(245,158,11,0.05);
        }

        .pp-lang-select:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(245,158,11,0.15);
        }

        .pp-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pp-run-btn {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 7px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: var(--success);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pp-run-btn:hover:not(:disabled) {
          background: rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 4px 16px rgba(16,185,129,0.15);
          transform: translateY(-1px);
        }

        .pp-run-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .pp-submit-btn {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 7px;
          background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.15) 100%);
          border: 1px solid rgba(245,158,11,0.3);
          color: var(--accent-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pp-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(234,88,12,0.2) 100%);
          box-shadow: 0 4px 20px rgba(245,158,11,0.2);
          transform: translateY(-1px);
        }

        .pp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .pp-kbd {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
          margin-left: 10px;
          opacity: 0.6;
        }

        /* ── EDITOR ── */
        .pp-editor-wrap {
          flex: 1;
          min-height: 0;
        }

        /* ── INPUT FORMAT STRIP ── */
        .pp-input-format-strip {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 14px 18px;
          animation: fadeSlideUp 0.4s ease-out;
        }

        .pp-input-format-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .pp-input-format-title {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .pp-input-format-rows {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pp-input-format-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pp-input-format-line-num,
        .pp-input-format-line {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          min-width: 16px;
          text-align: right;
          opacity: 0.6;
          padding-top: 2px;
        }

        .pp-input-format-pill {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          min-width: 56px;
          text-align: center;
        }

        .pp-input-format-pill--scalar {
          background: rgba(168,85,247,0.12);
          color: #c084fc;
        }

        .pp-input-format-pill--array {
          background: rgba(34,197,94,0.12);
          color: #4ade80;
        }

        .pp-input-format-arrow {
          display: none;
        }

        .pp-input-format-desc {
          display: none;
        }

        .pp-input-format-desc code {
          font-family: var(--font-mono);
          font-size: 10px;
          background: rgba(255,255,255,0.08);
          padding: 2px 6px;
          border-radius: 3px;
          color: var(--text-primary);
        }

        .pp-input-format-meta {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
          opacity: 0.75;
          white-space: nowrap;
        }

        /* ── DRAG HANDLE ── */
        .drag-handle {
          height: 8px;
          cursor: row-resize;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border-top: 1px solid var(--border-subtle);
          transition: all 0.2s ease;
          position: relative;
        }

        .drag-handle:hover {
          background: rgba(245,158,11,0.04);
        }

        .drag-handle:hover .drag-dot {
          background: rgba(245,158,11,0.5) !important;
        }

        .drag-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.2s ease;
        }

        /* ── IO STRIP ── */
        .pp-io-strip {
          height: 220px;
          flex-shrink: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          background: rgba(0,0,0,0.15);
          border-top: 1px solid var(--border-subtle);
        }

        .pp-stdin {
          border-right: 1px solid var(--border-subtle);
          padding: 0;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .pp-stdin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(0,0,0,0.1);
        }

        .pp-stdin-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pp-stdin-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .pp-stdin-content {
          flex: 1;
          overflow-y: auto;
          padding: 10px 12px;
        }

        .pp-stdout {
          padding: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .pp-stdout-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(0,0,0,0.1);
        }

        .pp-stdout-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pp-stdout-content {
          flex: 1;
          padding: 14px 16px;
          overflow-y: auto;
        }

        .pp-output-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 11px;
          font-style: italic;
        }

        .pp-output-running {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .pp-error-badge {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 5px;
          margin-bottom: 10px;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.2);
          color: var(--error);
        }

        .pp-output-pre {
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.65;
          white-space: pre-wrap;
          margin: 0;
        }

        /* ── BOTTOM SECTIONS ── */
        .pp-bottom {
          padding: 0 28px 40px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── CONFIDENCE ROW ── */
        .pp-conf-row {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 14px 20px;
          animation: fadeSlideUp 0.4s ease-out;
        }

        .pp-conf-label {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-right: 6px;
        }

        .pp-conf-btn {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 7px;
          border: 1px solid var(--border-subtle);
          background: transparent;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-muted);
        }

        .pp-conf-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .pp-solved-badge {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: solvedPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .pp-solved-badge span {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          color: var(--success);
        }

        /* ── COLLAPSIBLE CARDS ── */
        .collapsible-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeSlideUp 0.4s ease-out;
        }

        .collapsible-card:hover {
          border-color: rgba(245,158,11,0.15);
        }

        .collapsible-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 18px 22px;
          transition: all 0.2s ease;
        }

        .collapsible-header:hover {
          background: rgba(245,158,11,0.03);
        }

        .collapsible-header__left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .collapsible-icon {
          color: var(--text-muted);
          transition: all 0.25s ease;
          display: flex;
        }

        .collapsible-icon--active {
          color: var(--accent-primary);
        }

        .collapsible-title {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
          transition: all 0.25s ease;
        }

        .collapsible-title--active {
          color: var(--text-secondary);
        }

        .collapsible-header__right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .collapsible-toggle {
          color: var(--text-muted);
          transition: all 0.25s ease;
          display: flex;
        }

        .collapsible-toggle--active {
          color: var(--accent-primary);
        }

        .collapsible-content-wrapper {
          overflow: hidden;
          transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        }

        .collapsible-content {
          padding: 0 22px 22px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 20px;
        }

        /* ── EDITORIAL CONTENT ── */
        .editorial-insight {
          margin-bottom: 24px;
          padding-left: 16px;
          border-left: 3px solid rgba(245,158,11,0.4);
          background: linear-gradient(90deg, rgba(245,158,11,0.03) 0%, transparent 100%);
          padding: 16px 20px;
          border-radius: 0 10px 10px 0;
        }

        .editorial-insight-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          color: var(--accent-primary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .editorial-insight-text {
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.75;
          font-weight: 500;
        }

        .editorial-point {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-subtle);
        }

        .editorial-point:last-child {
          border-bottom: none;
        }

        .editorial-point-num {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 700;
          color: var(--accent-primary);
          min-width: 22px;
          padding-top: 2px;
        }

        .editorial-point-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.75;
        }

        /* ── HINTS CONTENT ── */
        .hint-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(251,191,36,0.03);
          border: 1px solid rgba(251,191,36,0.1);
          border-radius: 10px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }

        .hint-item:last-child {
          margin-bottom: 0;
        }

        .hint-item:hover {
          background: rgba(251,191,36,0.05);
          border-color: rgba(251,191,36,0.2);
          transform: translateX(3px);
        }

        .hint-icon {
          color: var(--warning);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .hint-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        /* ── RICH EDITOR STYLES ── */
        .re {
          outline: none;
          min-height: 140px;
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.75;
          caret-color: var(--accent-primary);
          padding: 14px 0;
          border-top: 1px solid var(--border-subtle);
          transition: border-color .25s ease;
          direction: ltr !important;
          unicode-bidi: embed !important;
          text-align: left !important;
        }

        .re * { direction: ltr !important; unicode-bidi: embed !important; text-align: left !important; }
        .re:focus { border-top-color: rgba(245,158,11,0.3); }
        .re h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0.6rem 0 0.3rem; }
        .re p { margin: .25rem 0; }
        .re ul { list-style: disc; padding-left: 1.5rem; margin: .3rem 0; }
        .re ol { list-style: decimal; padding-left: 1.5rem; margin: .3rem 0; }
        .re li { margin: .2rem 0; }
        .re b, .re strong { color: var(--text-primary); font-weight: 600; }
        .re mark { background: rgba(245,158,11,0.2); color: inherit; border-radius: 3px; padding: 0 3px; }
        .re p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--text-muted); pointer-events: none; font-style: italic; float: left; height: 0; }
        .re-tool:hover { color: var(--accent-primary) !important; background: rgba(245,158,11,0.1) !important; }

        /* ── AI MENTOR ── */
        .mentor-wrap { display: flex; flex-direction: column; height: 100%; min-height: 420px; }

        .mentor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .mentor-header__left { display: flex; align-items: center; gap: 10px; }

        .mentor-title {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--success); }
          50% { opacity: 0.7; box-shadow: 0 0 12px var(--success); }
        }

        .badge-plus {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--accent-primary);
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 5px;
          padding: 3px 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .chat-scroll { flex: 1; overflow-y: auto; padding: 18px 0; display: flex; flex-direction: column; }
        .messages { display: flex; flex-direction: column; gap: 16px; padding-bottom: 4px; }
        .bubble-row { display: flex; align-items: flex-end; gap: 10px; }
        .bubble-row--user { flex-direction: row-reverse; }

        .bubble-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          flex-shrink: 0;
          margin-bottom: 22px;
        }

        .bubble {
          max-width: 80%;
          border-radius: 16px;
          padding: 12px 16px 8px;
          position: relative;
          animation: bubbleIn 0.3s ease-out;
        }

        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .bubble--user {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          border-bottom-right-radius: 6px;
        }

        .bubble--ai {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
          border-bottom-left-radius: 6px;
        }

        .bubble--typing { padding: 16px 20px; display: flex; align-items: center; gap: 6px; }

        .bubble-text {
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-primary);
          margin: 0;
        }

        .bubble-text--ai { color: var(--text-secondary); }
        .bubble-text--ai strong { color: var(--text-primary); font-weight: 600; }
        .bubble-text--ai em { color: var(--text-muted); font-style: italic; }
        .bubble-text--ai code {
          font-family: var(--font-mono);
          font-size: 12px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.15);
          border-radius: 5px;
          padding: 2px 7px;
          color: var(--accent-primary);
        }
        .bubble-text--ai ul { padding-left: 20px; margin: 10px 0; list-style: none; }
        .bubble-text--ai ul li { position: relative; padding-left: 16px; margin: 6px 0; color: var(--text-secondary); font-size: 14px; line-height: 1.6; }
        .bubble-text--ai ul li::before { content: '·'; position: absolute; left: 0; color: var(--accent-primary); font-size: 20px; line-height: 1.1; }

        .bubble-footer { display: flex; justify-content: flex-end; margin-top: 6px; }

        .copy-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          background: rgba(255,255,255,0.04);
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 9px;
          transition: all 0.2s ease;
        }

        .copy-btn:hover { background: rgba(245,158,11,0.1); color: var(--accent-primary); }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: typingBounce 1.2s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) { animation-delay: .2s; }
        .typing-dot:nth-child(3) { animation-delay: .4s; }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        .starters { padding: 10px 0; }

        .starters__label {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .starter-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 11px 14px;
          margin-bottom: 6px;
          font-family: var(--font-sans);
          font-size: 13.5px;
          color: var(--text-muted);
          background: rgba(245,158,11,0.03);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .starter-btn:hover {
          color: var(--accent-primary);
          border-color: rgba(245,158,11,0.25);
          background: rgba(245,158,11,0.06);
          transform: translateX(4px);
        }

        .chat-composer { flex-shrink: 0; border-top: 1px solid var(--border-subtle); padding-top: 14px; }
        .chat-composer__inner { position: relative; }

        .chat-input {
          font-family: var(--font-sans);
          width: 100%;
          min-height: 48px;
          max-height: 130px;
          overflow-y: auto;
          background: rgba(245,158,11,0.03);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 13px 50px 13px 16px;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
          line-height: 1.55;
          transition: all 0.25s ease;
          direction: ltr !important;
          text-align: left !important;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .chat-input:focus { border-color: rgba(245,158,11,0.35); background: rgba(245,158,11,0.05); }
        .chat-input p { margin: 0; }
        .chat-input p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--text-muted); pointer-events: none; float: left; height: 0; font-style: italic; }
        .ProseMirror { white-space: pre-wrap; word-wrap: break-word; }
        .ProseMirror:focus { outline: none; }

        .send-btn {
          position: absolute;
          right: 10px;
          bottom: 10px;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-hover);
          color: var(--text-muted);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .send-btn--active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: #000;
          box-shadow: 0 4px 16px rgba(245,158,11,0.35);
        }

        .send-btn--active:hover {
          box-shadow: 0 6px 24px rgba(245,158,11,0.5);
          transform: scale(1.05);
        }

        .composer-hint {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
          margin-top: 8px;
          letter-spacing: 0.04em;
          opacity: 0.7;
        }

        /* ── PAYWALL ── */
        .paywall-preview { position: relative; overflow: hidden; flex: 1; margin: 14px 0; min-height: 170px; }
        .paywall-fade { position: absolute; inset: 0; z-index: 2; background: linear-gradient(to bottom, transparent 10%, var(--bg-elevated) 92%); pointer-events: none; }

        .paywall-msg {
          font-size: 13px;
          line-height: 1.65;
          padding: 10px 14px;
          margin-bottom: 8px;
          border-radius: 10px;
        }

        .paywall-msg--user {
          color: var(--text-muted);
          background: rgba(245,158,11,0.05);
          border: 1px solid rgba(245,158,11,0.1);
          margin-left: 24px;
        }

        .paywall-msg--ai { color: var(--text-muted); margin-right: 24px; }

        .paywall-features { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 16px; }

        .paywall-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 8px;
          background: rgba(245,158,11,0.03);
          border: 1px solid var(--border-subtle);
          transition: all 0.2s ease;
        }

        .paywall-feature:hover {
          background: rgba(245,158,11,0.06);
          border-color: rgba(245,158,11,0.15);
        }

        .paywall-feature__icon { color: var(--accent-primary); opacity: .8; }
        .paywall-feature__label { font-size: 11.5px; color: var(--text-secondary); }

        .paywall-cta {
          width: 100%;
          padding: 13px 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: #000;
          box-shadow: 0 4px 24px rgba(245,158,11,0.3);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }

        .paywall-cta:hover {
          box-shadow: 0 6px 32px rgba(245,158,11,0.5);
          transform: translateY(-2px);
        }

        .btn-ghost-sm {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .btn-ghost-sm:hover { color: var(--accent-primary); background: rgba(245,158,11,0.08); }

        /* ── ANIMATIONS ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes solvedPop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── DISCUSSION ── */
        .pp-discussion {
          padding: 18px 24px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 11px;
          font-style: italic;
          text-align: center;
          opacity: 0.7;
        }
      `}</style>

      <div className="pp-page">
        {/* ── TOP BAR ── */}
        <div className="pp-topbar">
          <div className="pp-topbar-left">
            <h1 className="pp-title">{p.title}</h1>
            <span
              className="pp-diff-badge"
              style={{
                background: diffStyle.bg,
                border: `1px solid ${diffStyle.border}`,
                color: diffStyle.color,
              }}
            >
              {p.difficulty}
            </span>
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="pp-tag">
                {t}
              </span>
            ))}
          </div>

          <div className="pp-topbar-right">
            <button
              className={`pp-bookmark-btn ${progress.bookmark ? "pp-bookmark-btn--active" : ""}`}
              onClick={async () => {
                if (saving) return;
                const newBookmark = !progress.bookmark;
                setProgress((prev) => ({ ...prev, bookmark: newBookmark }));
                // Auto-save bookmark change
                try {
                  await fetch(`/api/problems/${p.slug}/problem`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ bookmark: newBookmark }),
                  });
                } catch (err) {
                  console.error("Failed to save bookmark:", err);
                }
              }}
              disabled={saving}
            >
              {progress.bookmark ? (
                <BookmarkCheck size={15} />
              ) : (
                <Bookmark size={15} />
              )}
              <span className="pp-bookmark-label">
                {progress.bookmark ? "Saved" : "Bookmark"}
              </span>
            </button>

            {/* Solved Status */}
            <div
              className={`pp-status-badge ${progress.solved ? "pp-status-badge--solved" : "pp-status-badge--unsolved"}`}
            >
              {progress.solved ? (
                <>
                  <CheckCircle size={14} />
                  <span>Solved</span>
                </>
              ) : (
                <>
                  <span className="pp-status-dot" />
                  <span>Not Solved</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION NAVIGATION ── */}
        <div className="pp-section-nav">
          <div className="pp-section-nav-inner">
            <button
              className={`pp-section-btn ${editorialOpen ? "pp-section-btn--active" : ""}`}
              onClick={() => {
                setEditorialOpen(true);
                setTimeout(() => scrollTo("editorial"), 100);
              }}
            >
              <Terminal size={14} />
              <span>Editorial</span>
            </button>
            <button
              className={`pp-section-btn ${hintsOpen ? "pp-section-btn--active" : ""}`}
              onClick={() => {
                setHintsOpen(true);
                setTimeout(() => scrollTo("hints"), 100);
              }}
            >
              <Lightbulb size={14} />
              <span>Hints</span>
            </button>
            <button
              className={`pp-section-btn ${notesOpen ? "pp-section-btn--active" : ""}`}
              onClick={() => {
                setNotesOpen(true);
                setTimeout(() => scrollTo("notes"), 100);
              }}
            >
              <StickyNote size={14} />
              <span>Notes</span>
            </button>
            <button
              className={`pp-section-btn ${aiMentorOpen ? "pp-section-btn--active" : ""}`}
              onClick={() => {
                setAiMentorOpen(true);
                setTimeout(() => scrollTo("ai-mentor"), 100);
              }}
            >
              <Bot size={14} />
              <span>AI Mentor</span>
              {!isPremium && <span className="pp-section-badge">Plus</span>}
            </button>
          </div>
        </div>

        {/* ── MAIN SCROLLABLE AREA ── */}
        <div className="pp-main-scroll">
          {/* ── BIG CARD ── */}
          <div className="pp-big-card">
            {/* LEFT — problem description */}
            <div className="pp-left">
              {companies.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 24,
                  }}
                >
                  {companies.map((c) => (
                    <span key={c} className="pp-company-badge">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <p className="pp-description">{p.description}</p>

              {examples.length > 0 && (
                <div>
                  <div className="pp-examples-header">
                    <Code2 size={14} color="#f59e0b" style={{ opacity: 0.8 }} />
                    <span className="pp-examples-title">Examples</span>
                  </div>
                  {examples.map((ex, i) => (
                    <div key={i} className="pp-example-card">
                      <p className="pp-example-label">EXAMPLE {i + 1}</p>
                      <pre className="pp-example-pre">{ex}</pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Format */}
              {inputFormatItems.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <InputFormatStrip items={inputFormatItems} />
                </div>
              )}
              {inputFormat && (
                <div
                  style={{ marginTop: inputFormatItems.length > 0 ? 12 : 20 }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#4b5563",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Input Format
                  </span>
                  <div
                    style={{
                      background: "rgba(249,115,22,0.03)",
                      border: "1px solid #1c1f26",
                      borderLeft: "2px solid rgba(249,115,22,0.3)",
                      borderRadius: 6,
                      padding: "10px 14px",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      color: "#9ca3b8",
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {inputFormat}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — editor panel */}
            <div className="pp-right">
              <div className="pp-toolbar">
                <div className="pp-file-indicator">
                  <FileText size={13} color="#606070" />
                  <span className="pp-file-name">
                    solution.
                    {language === "cpp"
                      ? "cpp"
                      : language === "java"
                        ? "java"
                        : "py"}
                  </span>
                  <select
                    className="pp-lang-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                  </select>
                </div>

                <div className="pp-toolbar-actions">
                  <button
                    className="pp-run-btn"
                    disabled={running || submitting}
                    onClick={handleRun}
                  >
                    {running ? (
                      <>
                        <Loader2 size={12} className="spin" /> Running…
                      </>
                    ) : (
                      <>
                        <Play size={12} /> Run
                      </>
                    )}
                  </button>
                  <button
                    className="pp-submit-btn"
                    disabled={running || submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={12} className="spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        <Zap size={12} /> Submit
                      </>
                    )}
                  </button>
                  <span className="pp-kbd">⌘↵</span>
                </div>
              </div>

              <div className="pp-editor-wrap">
                <MonacoEditor
                  height="100%"
                  language={language}
                  value={codeData}
                  onChange={(v: any) => setCodeData(v || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 14, bottom: 14 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    lineHeight: 1.7,
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    renderLineHighlight: "gutter",
                  }}
                  loading={
                    <div
                      style={{
                        padding: 28,
                        color: "#606070",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                      }}
                    >
                      Loading editor…
                    </div>
                  }
                />
              </div>

              <div
                className="drag-handle"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                aria-label="Resize output section"
                role="separator"
              >
                <span className="drag-dot" />
              </div>

              <div
                ref={ioStripRef}
                style={{
                  height: `${ioHeight}px`,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  background: "rgba(0,0,0,0.15)",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                {/* Tab header */}
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
                            activeTab === tab
                              ? "rgba(249,115,22,0.1)"
                              : "transparent",
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

                {/* Tab content */}
                <div
                  style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}
                >
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
                          e.currentTarget.style.borderColor =
                            "rgba(249,115,22,0.3)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--border-subtle)";
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
                      {/* Running state */}
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

                      {/* Idle state */}
                      {!running &&
                        !submitting &&
                        !runOutput &&
                        !submitOutput && (
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

                      {/* Run output */}
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

                      {/* Submit output */}
                      {!submitting && submitOutput && (
                        <div>
                          {/* Compile error */}
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

                          {/* Verdict header */}
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
                                color: submitOutput.accepted
                                  ? "#10b981"
                                  : "#ef4444",
                              }}
                            >
                              {submitOutput.accepted
                                ? "Accepted"
                                : "Wrong Answer"}
                            </span>
                            <span
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: 10,
                                color: "#6b7280",
                              }}
                            >
                              {submitOutput.passed} / {submitOutput.total}{" "}
                              passed
                            </span>
                          </div>

                          {/* Test case list */}
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
                                      background: r.passed
                                        ? "#10b981"
                                        : "#ef4444",
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
                                    {r.isPublic
                                      ? `Test ${i + 1}`
                                      : "Hidden test"}{" "}
                                    —{" "}
                                    {r.passed
                                      ? "Accepted"
                                      : r.isPublic
                                        ? r.status
                                        : "Failed"}
                                  </span>
                                </div>
                                {!r.passed && r.isPublic && (
                                  <div
                                    style={{ paddingLeft: 14, marginTop: 4 }}
                                  >
                                    <p
                                      style={{
                                        fontFamily:
                                          "'IBM Plex Mono', monospace",
                                        fontSize: 10,
                                        color: "#6b7280",
                                        margin: "2px 0",
                                      }}
                                    >
                                      Input: {r.displayInput || r.input || "—"}
                                    </p>
                                    <p
                                      style={{
                                        fontFamily:
                                          "'IBM Plex Mono', monospace",
                                        fontSize: 10,
                                        color: "#6b7280",
                                        margin: "2px 0",
                                      }}
                                    >
                                      Expected:{" "}
                                      {r.displayOutput || r.expected || "—"}
                                    </p>
                                    <p
                                      style={{
                                        fontFamily:
                                          "'IBM Plex Mono', monospace",
                                        fontSize: 10,
                                        color: "#ef4444",
                                        margin: "2px 0",
                                      }}
                                    >
                                      Got: {r.got || "—"}
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
                                    A hidden test case is failing. Check edge
                                    cases.
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
              </div>
            </div>
          </div>

          {/* ── BOTTOM SECTIONS ── */}
          <div className="pp-bottom">
            {/* Confidence + Solved row */}
            <div className="pp-conf-row">
              <span className="pp-conf-label">Confidence</span>
              {(["LOW", "MEDIUM", "HIGH"] as ConfidenceV2[]).map((level) => {
                const cfg = CONF[level];
                const active = progress.confidenceV2 === level;
                return (
                  <button
                    key={level}
                    className="pp-conf-btn"
                    disabled={saving}
                    onClick={() =>
                      !saving &&
                      setProgress((prev) => ({ ...prev, confidenceV2: level }))
                    }
                    style={
                      active
                        ? {
                            color: cfg.color,
                            background: cfg.bg,
                            borderColor: cfg.border,
                            boxShadow: `0 2px 12px ${cfg.glow}`,
                          }
                        : {}
                    }
                  >
                    {cfg.label}
                  </button>
                );
              })}
              {progress.solved && (
                <div className="pp-solved-badge">
                  <CheckCircle size={14} color="#10b981" />
                  <span>Solved</span>
                </div>
              )}
            </div>

            {/* Editorial */}
            <CollapsibleSection
              id="editorial"
              icon={<Terminal size={15} />}
              title="Editorial & Approach"
              isOpen={editorialOpen}
              onToggle={() => setEditorialOpen((v) => !v)}
            >
              {editorial.insight && (
                <div className="editorial-insight">
                  <p className="editorial-insight-label">Key Insight</p>
                  <p className="editorial-insight-text">{editorial.insight}</p>
                </div>
              )}
              {editorial.points.length > 0 && (
                <div>
                  {editorial.points.map((pt, i) => (
                    <div key={i} className="editorial-point">
                      <span className="editorial-point-num">{i + 1}.</span>
                      <p className="editorial-point-text">{pt}</p>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>

            {/* Hints */}
            <CollapsibleSection
              id="hints"
              icon={<Lightbulb size={15} />}
              title="Hints"
              isOpen={hintsOpen}
              onToggle={() => setHintsOpen((v) => !v)}
            >
              <div>
                {aiHintLines.map((hint, i) => (
                  <div key={i} className="hint-item">
                    <Lightbulb size={13} className="hint-icon" />
                    <p className="hint-text">{hint}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Notes */}
            <CollapsibleSection
              id="notes"
              icon={<StickyNote size={15} />}
              title="Notes"
              isOpen={notesOpen}
              onToggle={() => setNotesOpen((v) => !v)}
            >
              <RichEditor
                initialValue={progress.notes}
                disabled={saving}
                onChange={(html) =>
                  setProgress((prev) => ({ ...prev, notes: html }))
                }
              />
              {progress.notes !== committed.notes && (
                <div className="pp-notes-save-row">
                  <button
                    className="pp-notes-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={12} className="spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Cloud size={12} /> Save Notes
                      </>
                    )}
                  </button>
                </div>
              )}
            </CollapsibleSection>

            {/* AI Mentor */}
            <CollapsibleSection
              id="ai-mentor"
              icon={<Bot size={15} />}
              title="AI Mentor"
              isOpen={aiMentorOpen}
              onToggle={() => setAiMentorOpen((v) => !v)}
              rightExtra={
                isPremium ? (
                  <span className="online-dot" />
                ) : (
                  <span className="badge-plus">Plus</span>
                )
              }
            >
              <AIMentor
                problemId={p.id}
                title={p.title}
                isPremium={isPremium}
              />
            </CollapsibleSection>

            {/* Discussion Coming Soon */}
            <div className="pp-discussion">Discussion — Coming Soon</div>
          </div>
        </div>
      </div>

      {/* ── SOLVE DIALOG ── */}
      {showSolveDialog && submitOutput && (
        <SolveDialog
          problemTitle={p.title}
          passed={submitOutput.passed}
          total={submitOutput.total}
          onClose={() => setShowSolveDialog(false)}
          onSave={handleSolveDialogSave}
        />
      )}
    </>
  );
}
