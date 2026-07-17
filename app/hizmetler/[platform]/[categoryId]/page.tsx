import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ServiceCard } from "@/components/ServiceCard";
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
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
