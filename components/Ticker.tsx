"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, durationMs]);

  return { value, ref };
}

export function Ticker({
  target,
  label,
  suffix = "",
  accent = "text-cyan",
}: {
  target: number;
  label: string;
  suffix?: string;
  accent?: string;
}) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <div className={`tick font-mono text-3xl md:text-4xl font-semibold ${accent}`}>
        {value.toLocaleString("tr-TR")}
        {suffix}
      </div>
      <div className="text-xs uppercase tracking-[0.14em] text-mute">{label}</div>
    </div>
  );
}
