"use client";

import { useEffect, useState } from "react";

// IMPORTANT: set this to a real promotion end date before enabling the banner.
// The banner automatically disappears once this date passes — never edit this
// to keep resetting a fake countdown, that's a deceptive "urgency" dark pattern.
const CAMPAIGN_END = null; // e.g. new Date("2026-08-01T23:59:59+03:00")
const CAMPAIGN_TEXT = "Yeni üyelere özel ilk siparişte %10 indirim";
const CAMPAIGN_LINK = "/#hizmetler";

function useCountdown(target: Date | null) {
  const [remaining, setRemaining] = useState<number | null>(target ? target.getTime() - Date.now() : null);

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}

export function CampaignBanner() {
  const [dismissed, setDismissed] = useState(true); // start hidden, check sessionStorage after mount
  const remaining = useCountdown(CAMPAIGN_END);

  useEffect(() => {
    setDismissed(sessionStorage.getItem("campaign_banner_dismissed") === "1");
  }, []);

  if (!CAMPAIGN_END || dismissed || (remaining !== null && remaining <= 0)) return null;

  const totalSeconds = Math.max(0, Math.floor((remaining ?? 0) / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="relative flex items-center justify-center gap-3 bg-slate px-5 py-2 text-center text-sm text-white">
      <span>☀️ {CAMPAIGN_TEXT}</span>
      <span className="font-mono font-bold text-brand">{h}:{m}:{s}</span>
      <a href={CAMPAIGN_LINK} className="font-semibold text-brand underline underline-offset-2">
        Paketleri Gör
      </a>
      <button
        aria-label="Kapat"
        onClick={() => {
          sessionStorage.setItem("campaign_banner_dismissed", "1");
          setDismissed(true);
        }}
        className="absolute right-4 text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
