import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { createClient } from "@/lib/supabase/server";

export default async function BlogPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_color_from, cover_color_to, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-display text-3xl font-bold text-slate">📝 Blog</h1>
        <p className="mt-2 text-slateMute">Sosyal medya büyütme ipuçları ve rehberler.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(posts ?? []).map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-2xl border border-border2 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div
                className="h-32"
                style={{ background: `linear-gradient(135deg, ${p.cover_color_from}, ${p.cover_color_to})` }}
              />
              <div className="p-5">
                <div className="font-display font-semibold text-slate group-hover:text-brand">{p.title}</div>
                {p.excerpt && <p className="mt-2 text-sm text-slateMute">{p.excerpt}</p>}
              </div>
            </Link>
          ))}
          {!posts?.length && <p className="text-slateMute">Henüz yazı yok.</p>}
        </div>
      </div>
    </div>
  );
}
