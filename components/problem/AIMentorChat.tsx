"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type Message = {
  role: "user" | "assistant";
  content: string;
};

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
    if (editor && value === "" && editor.getText() !== "") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}

type AIMentorChatProps = {
  problemId: string;
  title: string;
  isPremium: boolean;
};

export default function AIMentorChat({
  problemId,
  title: _title,
  isPremium,
}: AIMentorChatProps) {
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

  if (!isPremium) {
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
              text: "Think about the inner loop - you are searching for a value. What data structure gives O(1) lookup?",
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
          <Zap size={12} /> Unlock AI Mentor - Upgrade to Plus
        </Link>
      </div>
    );
  }

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
          Enter to send - Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
