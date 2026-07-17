"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border2 bg-white px-5 py-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-slateMute">
          🍪 Sitemizde deneyimini iyileştirmek için çerezler kullanıyoruz. Devam ederek{" "}
          <Link href="/gizlilik-politikasi" className="text-brand hover:underline">Gizlilik Politikası</Link>'nı kabul etmiş olursun.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brandDark"
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
}
