"use client";

import { useState } from "react";

export function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-md bg-brandSoft px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand hover:text-white transition-colors ${className}`}
    >
      {copied ? "Kopyalandı ✓" : "Kopyala"}
    </button>
  );
}
