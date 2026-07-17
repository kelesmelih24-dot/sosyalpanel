"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Merhaba! 👋 Ben SosyalPanel AI asistanıyım. Sipariş, ödeme veya hizmetlerle ilgili sorularını yanıtlayabilirim." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    setLoading(false);
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Canlı destek"
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-110"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-44 right-5 z-50 flex h-[420px] w-80 flex-col overflow-hidden rounded-2xl border border-border2 bg-white shadow-2xl sm:w-96">
          <div className="bg-brand px-4 py-3 text-white">
            <div className="font-display font-semibold">🤖 AI Destek</div>
            <div className="text-xs text-white/80">Genellikle birkaç saniyede yanıt veriyor</div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user" ? "ml-auto bg-brand text-white" : "bg-blush text-slate"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && <div className="max-w-[85%] rounded-2xl bg-blush px-3 py-2 text-sm text-slateMute">Yazıyor…</div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border2 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru yaz…"
              className="flex-1 rounded-lg border border-border2 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brandDark disabled:opacity-60"
            >
              Gönder
            </button>
          </form>
        </div>
      )}
    </>
  );
}
