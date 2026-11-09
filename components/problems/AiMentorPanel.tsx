"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bot,
  Bug,
  Check,
  Code2,
  Copy,
  Gauge,
  GitBranch,
  Lightbulb,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "./problem-utils";
import type { ChatMessage } from "./types";

const STARTERS = [
  "Is my approach correct?",
  "Give me a hint without spoiling",
  "What pattern does this follow?",
  "How can I optimize my solution?",
  "Walk me through the complexity",
];

const PAYWALL_PREVIEW: ReadonlyArray<{ role: "user" | "ai"; text: string }> = [
  { role: "user", text: "Any hint on optimizing brute force?" },
  {
    role: "ai",
    text: "Think about the inner loop — you're searching for a value. What data structure gives O(1) lookup?",
  },
  { role: "user", text: "A hash map?" },
  { role: "ai", text: "Exactly. What should you store as the key vs. value?" },
];

const PAYWALL_FEATURES: ReadonlyArray<{ Icon: LucideIcon; label: string }> = [
  { Icon: Lightbulb, label: "Smart Hints" },
  { Icon: Code2, label: "Approach Review" },
  { Icon: Gauge, label: "Complexity Coach" },
  { Icon: GitBranch, label: "Pattern Matcher" },
  { Icon: Bug, label: "Debug Assistant" },
  { Icon: Sparkles, label: "Unlimited Chats" },
];

// Typography for the HTML produced by renderMarkdown().
const AI_HTML_CLASS =
  "[&_strong]:font-semibold [&_strong]:text-fg [&_em]:italic [&_em]:text-fg-muted " +
  "[&_code]:rounded-md [&_code]:border [&_code]:border-accent/15 [&_code]:bg-accent-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-accent " +
  "[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1.5 [&_li]:marker:text-accent";

// ProseMirror root of the composer (tiptap renders it, so classes go through editorProps).
const CHAT_INPUT_CLASS = [
  "min-h-12 max-h-[130px] w-full overflow-y-auto whitespace-pre-wrap [overflow-wrap:break-word] rounded-xl border border-line bg-surface-2 py-[13px] pl-4 pr-12 text-sm leading-[1.55] text-fg outline-none transition-colors focus:border-accent/40",
  "[direction:ltr] [text-align:left] [&_p]:m-0",
  "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:italic [&_p.is-editor-empty:first-child]:before:text-fg-muted [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
].join(" ");

interface HistoryResponse {
  success?: boolean;
  data?: Array<{ role: string; text: string }>;
}
interface ChatResponse {
  success?: boolean;
  data?: string | null;
  message?: string;
}

// ── Copy button ──
const CopyButton = memo(function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, [text]);
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy message"
      aria-label="Copy message"
      className="flex items-center gap-1 rounded-md bg-fg/[0.04] px-2 py-1 font-mono text-[9px] text-fg-muted transition-colors hover:bg-accent-soft hover:text-accent"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
});

// ── Message bubble ──
const MessageBubble = memo(function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const html = useMemo(
    () => (isUser ? "" : renderMarkdown(msg.content)),
    [isUser, msg.content],
  );
  return (
    <div
      className={cn(
        "flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser && "flex-row-reverse",
      )}
    >
      {!isUser && (
        <div className="mb-[22px] grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent/20 bg-accent-soft text-accent">
          <Bot size={12} />
        </div>
      )}
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 pb-2 pt-3",
          isUser
            ? "rounded-br-md border border-accent/20 bg-accent-soft"
            : "rounded-bl-md border border-line bg-fg/[0.03]",
        )}
      >
        {isUser ? (
          <p className="text-sm leading-[1.7] text-fg">{msg.content}</p>
        ) : (
          <div
            className={cn("text-sm leading-[1.7] text-fg-secondary", AI_HTML_CLASS)}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        <div className="mt-1.5 flex justify-end">
          <CopyButton text={msg.content} />
        </div>
      </div>
    </div>
  );
});

// ── Composer input (tiptap, single paragraph) ──
const ChatInput = memo(function ChatInput({
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
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
    onChangeRef.current = onChange;
  });

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
    onUpdate: ({ editor }) => onChangeRef.current(editor.getText()),
    editorProps: {
      attributes: { class: CHAT_INPUT_CLASS, dir: "ltr" },
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

  // Keep the editor in sync with external value changes (clear after send, starter prompts).
  useEffect(() => {
    if (editor && value !== editor.getText()) editor.commands.setContent(value);
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;
  return <EditorContent editor={editor} />;
});

// ── Paywall ──
function Paywall() {
  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <Bot size={14} className="text-accent" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-secondary">
            AI Mentor
          </span>
        </div>
        <span className="chip chip-accent font-mono uppercase">Plus</span>
      </div>

      <div className="relative my-3.5 min-h-[170px] flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] bg-linear-to-b from-transparent from-10% to-surface to-[92%]"
        />
        {PAYWALL_PREVIEW.map((m, i) => (
          <div
            key={i}
            className={cn(
              "mb-2 rounded-[10px] px-3.5 py-2.5 text-[13px] leading-[1.65] text-fg-muted",
              m.role === "user"
                ? "ml-6 border border-accent/10 bg-accent/5"
                : "mr-6",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1.5">
        {PAYWALL_FEATURES.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg border border-line bg-accent/[0.03] px-3 py-[9px] transition-colors hover:border-accent/20"
          >
            <span className="text-accent/80">
              <Icon size={11} />
            </span>
            <span className="text-[11.5px] text-fg-secondary">{label}</span>
          </div>
        ))}
      </div>

      <Link
        href="/subscription"
        className="btn btn-primary w-full font-mono text-[11px] font-bold uppercase tracking-[0.06em]"
      >
        <Zap size={12} /> Unlock AI Mentor · Upgrade to Plus
      </Link>
    </div>
  );
}

// ── Chat ──
function MentorChat({ problemId }: { problemId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/ai-agent?problemId=${encodeURIComponent(problemId)}`,
          { credentials: "include" },
        );
        const data: HistoryResponse = await res.json();
        if (
          !cancelled &&
          data.success &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setMessages(
            data.data.map((m) => ({
              role: m.role === "model" ? "assistant" : "user",
              content: m.text,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  useEffect(() => {
    if (messages.length === 0 && !loading) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      const data: ChatResponse = await res.json();
      const reply = data.data;
      if (data.success && reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
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

  const clearMessages = useCallback(() => setMessages([]), []);
  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <span className="h-[7px] w-[7px] rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
          <Bot size={14} className="text-accent" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-secondary">
            AI Mentor
          </span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearMessages}
            className="btn btn-ghost btn-sm h-7 px-2 font-mono text-[10px]"
          >
            <RotateCcw size={10} /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto py-[18px]">
        {historyLoading ? (
          <div className="flex items-center gap-2 py-4 text-fg-muted">
            <Loader2 size={13} className="animate-spin" />
            <span className="font-mono text-[10px]">Restoring session…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-2.5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.06em] text-fg-muted">
              Suggested
            </p>
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
                className="mb-1.5 block w-full rounded-xl border border-line bg-accent/[0.03] px-3.5 py-[11px] text-left text-[13.5px] text-fg-muted transition-colors hover:border-accent/25 hover:bg-accent-soft hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-1">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {loading && (
              <div className="flex items-end gap-2.5">
                <div className="mb-[22px] grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent/20 bg-accent-soft text-accent">
                  <Bot size={12} />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-fg/[0.03] px-5 py-4">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-line pt-3.5">
        <div className="relative">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              "absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-lg transition-colors",
              canSend
                ? "bg-accent text-bg shadow-[0_4px_16px_var(--accent-glow)] hover:bg-accent-hover"
                : "bg-surface-3 text-fg-muted",
            )}
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
          </button>
        </div>
        <p className="mt-2 font-mono text-[9px] tracking-[0.04em] text-fg-muted/70">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

interface AiMentorPanelProps {
  problemId: string;
  isPremium: boolean;
}

const AiMentorPanel = memo(function AiMentorPanel({
  problemId,
  isPremium,
}: AiMentorPanelProps) {
  if (!isPremium) return <Paywall />;
  return <MentorChat problemId={problemId} />;
});

export default AiMentorPanel;
