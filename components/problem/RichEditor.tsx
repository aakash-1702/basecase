"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import HighlightExt from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Type,
  Underline,
} from "lucide-react";

type RichEditorProps = {
  initialValue: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export default function RichEditor({
  initialValue,
  onChange,
  disabled = false,
}: RichEditorProps) {
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
