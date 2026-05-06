"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
};

function plainToHtml(input: string): string {
  if (!input) return "";
  if (input.includes("<")) return input;
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minRows = 6,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: plainToHtml(value),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[8rem] px-3 py-2 outline-none prose-tsoika focus:outline-none",
        style: `min-height: ${Math.max(minRows, 4) * 1.5}rem`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const incoming = plainToHtml(value);
    const current = editor.getHTML();
    if (incoming && incoming !== current && !editor.isFocused) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-4 text-sm text-rose-800/60">
        Загрузка редактора…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 focus-within:border-rose-400">
      <div className="flex flex-wrap items-center gap-1 border-b border-rose-200 px-2 py-1.5">
        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Жирный (Ctrl+B)"
          className="font-bold"
        >
          B
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Курсив (Ctrl+I)"
          className="italic"
        >
          I
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Зачёркнутый"
          className="line-through"
        >
          S
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-rose-200" />
        <ToolbarBtn
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Большой заголовок"
        >
          H1
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Заголовок поменьше"
        >
          H2
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Малый заголовок"
        >
          H3
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-rose-200" />
        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Маркированный список"
        >
          •
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Нумерованный список"
        >
          1.
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-rose-200" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Обычный текст"
        >
          P
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Очистить форматирование"
        >
          ⨯
        </ToolbarBtn>
      </div>
      <EditorContent
        editor={editor}
        className="px-1 [&_*:focus]:outline-none"
        data-placeholder={placeholder}
      />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  title,
  active,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded px-2 text-sm transition-colors ${
        active
          ? "bg-rose-200 text-rose-900"
          : "text-rose-800 hover:bg-rose-100"
      } ${className}`}
    >
      {children}
    </button>
  );
}
