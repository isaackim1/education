"use client";

import { KeyboardEvent } from "react";

interface SessionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function SessionInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: SessionInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  }

  return (
    <div className="flex gap-2 items-end">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your answer..."
        rows={2}
        disabled={disabled}
        className="flex-1 border border-neutral-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="shrink-0 bg-black text-white text-sm px-4 py-2 rounded hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
}
