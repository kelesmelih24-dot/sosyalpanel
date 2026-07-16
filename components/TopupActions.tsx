"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TopupActions({ requestId }: { requestId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    await fetch("/api/admin/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={busy}
        onClick={() => act("approve")}
        className="rounded-lg bg-emerald-400/15 px-3 py-1.5 text-xs font-medium text-emerald-400 disabled:opacity-50"
      >
        Onayla
      </button>
      <button
        disabled={busy}
        onClick={() => act("reject")}
        className="rounded-lg bg-magenta/15 px-3 py-1.5 text-xs font-medium text-magenta disabled:opacity-50"
      >
        Reddet
      </button>
    </div>
  );
}
