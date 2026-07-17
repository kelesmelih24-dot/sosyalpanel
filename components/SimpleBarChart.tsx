export function SimpleBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="group relative flex-1">
          <div
            className="rounded-t bg-gradient-to-t from-magenta to-violet transition-all"
            style={{ height: `${Math.max(2, (d.value / max) * 140)}px` }}
          />
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-void px-2 py-1 text-xs text-ink opacity-0 shadow-lg group-hover:opacity-100">
            {d.label}: ₺{d.value.toFixed(0)}
          </div>
        </div>
      ))}
    </div>
  );
}
