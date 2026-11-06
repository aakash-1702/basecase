"use client";

import React, { memo, useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Styles for the ProseMirror content root (tiptap renders it, so classes go
// through `editorProps.attributes`). Scoped to this editor only.
const CONTENT_CLASS = [
  "min-h-[140px] border-t border-line py-3.5 text-sm leading-[1.75] text-fg-secondary caret-accent outline-none transition-colors focus:border-accent/30",
  "[direction:ltr] [text-align:left]",
  "[&_h3]:my-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-fg",
  "[&_p]:my-1",
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5",
  "[&_strong]:font-semibold [&_strong]:text-fg [&_mark]:rounded-[3px] [&_mark]:bg-accent/20 [&_mark]:px-0.5 [&_mark]:text-inherit",
  "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:italic [&_p.is-editor-empty:first-child]:before:text-fg-muted [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
].join(" ");

interface Tool {
  key: string;
  label: string;
  Icon: LucideIcon;
  divider?: boolean;
  run: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

const TOOLS: readonly Tool[] = [
  {
    key: "h",
    label: "Heading",
    Icon: Type,
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive("heading", { level: 3 }),
  },
  {
    key: "b",
    label: "Bold",
    Icon: Bold,
    run: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive("bold"),
  },
  {
    key: "i",
    label: "Italic",
    Icon: Italic,
    run: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive("italic"),
  },
  {
    key: "u",
    label: "Underline",
    Icon: Underline,
    divider: true,
    run: (e) => e.chain().focus().toggleUnderline().run(),
    isActive: (e) => e.isActive("underline"),
  },
  {
    key: "hl",
    label: "Highlight",
    Icon: Highlighter,
    run: (e) => e.chain().focus().toggleHighlight().run(),
    isActive: (e) => e.isActive("highlight"),
  },
  {
    key: "ul",
    label: "Bullet list",
    Icon: List,
    divider: true,
    run: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive("bulletList"),
  },
  {
    key: "ol",
    label: "Numbered list",
    Icon: ListOrdered,
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e) => e.isActive("orderedList"),
  },
];

interface NotesEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

/** Rich-text notes (tiptap). Only re-renders when `value` / `disabled` change. */
const NotesEditor = memo(function NotesEditor({
  value,
  onChange,
  disabled = false,
}: NotesEditorProps) {
  const lastEmittedRef = useRef(value || "");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      // StarterKit v3 already bundles Underline (and Link) – no separate extension needed.
      StarterKit.configure({ heading: { levels: [3] } }),
      HighlightExt.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder: "Key insights, edge cases, patterns, what tripped you up…",
      }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedRef.current = html;
      onChangeRef.current(html);
    },
    editorProps: { attributes: { class: CONTENT_CLASS, dir: "ltr" } },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  // External value change (e.g. after a save round-trip) → sync into the editor.
  useEffect(() => {
    if (editor && value !== lastEmittedRef.current) {
      editor.commands.setContent(value || "");
      lastEmittedRef.current = value || "";
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={cn(disabled && "opacity-50")}>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="mb-2.5 flex items-center gap-0.5"
      >
        {TOOLS.map((tool) => {
          const active = tool.isActive(editor);
          return (
            <React.Fragment key={tool.key}>
              {tool.divider && <span className="mx-1 h-[13px] w-px bg-line" />}
              <button
                type="button"
                title={tool.label}
                aria-label={tool.label}
                aria-pressed={active}
                disabled={disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  tool.run(editor);
                }}
                className={cn(
                  "rounded-md px-2 py-1.5 transition-colors hover:bg-accent-soft hover:text-accent disabled:cursor-default",
                  active ? "bg-accent-soft text-accent" : "text-fg-muted",
                )}
              >
                <tool.Icon size={12} />
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
});

export default NotesEditor;
