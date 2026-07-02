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
        className="flex-1 rounded-lg border border-[#D8D3C8] bg-white px-4 py-2.5 text-sm text-[#1A1A17] placeholder:text-[#7A766D] resize-none transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="shrink-0 inline-flex items-center justify-center h-11 px-6 rounded-md bg-[#1E4634] text-white text-sm font-medium transition-colors hover:bg-[#16382A] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
      >
        Send
      </button>
    </div>
  );
}
