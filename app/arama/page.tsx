import { PublicHeader } from "@/components/PublicHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { createClient } from "@/lib/supabase/server";

export default async function AramaPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? "";
  const supabase = createClient();

  const { data: services } = q
    ? await supabase
        .from("services")
        .select("id, name, description, min_quantity, max_quantity, price_per_1000, featured")
        .eq("is_active", true)
        .ilike("name", `%${q}%`)
        .order("price_per_1000")
        .limit(60)
    : { data: [] };

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-2xl font-bold text-slate">🔍 Arama Sonuçları</h1>
        {q && <p className="mt-1 text-slateMute">"{q}" için {services?.length ?? 0} sonuç bulundu.</p>}

        <form action="/arama" className="mt-6 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="örn. takipçi, beğeni, izlenme…"
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandDark">Ara</button>
        </form>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(services ?? []).map((s: any) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>

        {q && !services?.length && (
          <p className="mt-8 text-center text-slateMute">Sonuç bulunamadı, farklı bir kelime dene.</p>
        )}
      </div>
    </div>
  );
}
