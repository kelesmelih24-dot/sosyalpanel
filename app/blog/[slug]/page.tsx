import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { createClient } from "@/lib/supabase/server";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div
        className="h-56"
        style={{ background: `linear-gradient(135deg, ${post.cover_color_from}, ${post.cover_color_to})` }}
      />
      <div className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-3xl font-bold text-slate">{post.title}</h1>
        <div
          className="mt-6 flex flex-col gap-4 text-slateMute [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate [&_h2]:mt-4 [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}
