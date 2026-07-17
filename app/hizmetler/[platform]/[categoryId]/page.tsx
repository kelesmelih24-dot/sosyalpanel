import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { PlatformIcon } from "@/components/PlatformIcon";
import { createClient } from "@/lib/supabase/server";

export default async function CategoryPage({
  params,
}: {
  params: { platform: string; categoryId: string };
}) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, platform")
    .eq("id", params.categoryId)
    .single();

  if (!category) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, description, min_quantity, max_quantity, price_per_1000")
    .eq("category_id", params.categoryId)
    .eq("is_active", true)
    .order("price_per_1000");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />

      <section className="bg-grad-blush px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <Link href={`/hizmetler/${params.platform}`} className="text-sm font-medium text-brand hover:underline">
            ← {category.platform} hizmetlerine dön
          </Link>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
              <PlatformIcon platform={category.platform} className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate md:text-3xl">{category.name}</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        {!services?.length ? (
          <p className="text-center text-slateMute">Bu kategoride şu an satışa açık hizmet yok.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.id} className="flex flex-col rounded-2xl border border-border2 bg-paper p-6 shadow-sm">
                <div className="font-display font-semibold text-slate">{s.name}</div>
                {s.description && <p className="mt-1 text-sm text-slateMute">{s.description}</p>}
                <div className="mt-3 text-xs text-slateMute">
                  Min {s.min_quantity.toLocaleString("tr-TR")} — Maks {s.max_quantity.toLocaleString("tr-TR")}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-brand">
                    ₺{Number(s.price_per_1000).toFixed(2)}
                    <span className="text-xs font-sans font-normal text-slateMute"> / 1000</span>
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href={`/misafir-siparis?service=${s.id}`}
                    className="rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brandDark"
                  >
                    Üye Olmadan Sipariş Ver
                  </Link>
                  <Link
                    href={
                      user
                        ? `/dashboard/siparis-ver?service=${s.id}`
                        : `/giris?next=${encodeURIComponent(`/dashboard/siparis-ver?service=${s.id}`)}`
                    }
                    className="rounded-full border border-brand px-4 py-2 text-center text-sm font-semibold text-brand transition-colors hover:bg-brandSoft"
                  >
                    {user ? "Panelden Sipariş Ver" : "Üye Ol ve Sipariş Ver"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
