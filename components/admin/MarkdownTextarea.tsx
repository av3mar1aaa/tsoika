"use client";

import { useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
};

export default function MarkdownTextarea({
  value,
  onChange,
  rows = 8,
  placeholder,
  required,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyWrap(prefix: string, suffix: string = prefix) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = ta.value.slice(0, start);
    const selected = ta.value.slice(start, end);
    const after = ta.value.slice(end);
    const text = selected || "текст";
    const next = `${before}${prefix}${text}${suffix}${after}`;
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursorStart = before.length + prefix.length;
      ta.setSelectionRange(cursorStart, cursorStart + text.length);
    });
  }

  function applyLinePrefix(prefix: string) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = ta.value.slice(0, start);
    const selected = ta.value.slice(start, end);
    const after = ta.value.slice(end);
    const text = selected || "текст";

    const lineStart = before.lastIndexOf("\n") + 1;
    const lead = ta.value.slice(lineStart, start);
    const insertion =
      (lead.length === 0 ? "" : "\n") + prefix + text;
    const next =
      ta.value.slice(0, start) + insertion + after;
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + insertion.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 focus-within:border-rose-400">
      <div className="flex flex-wrap items-center gap-1 border-b border-rose-200 px-2 py-1.5">
        <ToolbarBtn
          onClick={() => applyWrap("**")}
          title="Жирный (Ctrl+B)"
          className="font-bold"
        >
          B
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => applyWrap("_")}
          title="Курсив (Ctrl+I)"
          className="italic"
        >
          I
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-rose-200" />
        <ToolbarBtn
          onClick={() => applyLinePrefix("# ")}
          title="Большой заголовок"
        >
          H1
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => applyLinePrefix("## ")}
          title="Заголовок поменьше"
        >
          H2
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => applyLinePrefix("### ")}
          title="Малый заголовок"
        >
          H3
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-rose-200" />
        <ToolbarBtn
          onClick={() => applyLinePrefix("- ")}
          title="Список"
        >
          •
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => applyLinePrefix("1. ")}
          title="Нумерованный список"
        >
          1.
        </ToolbarBtn>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        required={required}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "b") {
            e.preventDefault();
            applyWrap("**");
          } else if ((e.metaKey || e.ctrlKey) && e.key === "i") {
            e.preventDefault();
            applyWrap("_");
          }
        }}
        className="block w-full resize-y rounded-b-lg bg-rose-50 px-3 py-2 outline-none"
      />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  title,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded px-2 text-sm text-rose-800 hover:bg-rose-100 ${className}`}
    >
      {children}
    </button>
  );
}
