"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_color_from: string;
  cover_color_to: string;
  is_published: boolean;
};

const empty = { title: "", excerpt: "", content: "", cover_color_from: "#FF4FA0", cover_color_to: "#7A5CFF", is_published: false };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [topic, setTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/blog");
    const data = await res.json();
    setPosts(data.posts ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleAiWrite() {
    if (!topic) return setError("Önce bir konu yaz.");
    setError(null);
    setAiLoading(true);
    const res = await fetch("/api/admin/blog/ai-write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    setAiLoading(false);
    if (!res.ok) return setError(data.error ?? "AI yazamadı.");
    setForm({ ...form, title: data.title, excerpt: data.excerpt, content: data.content });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const method = editingId ? "PATCH" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;
    const res = await fetch("/api/admin/blog", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error ?? "Kaydedilemedi.");
    setForm(empty);
    setEditingId(null);
    setTopic("");
    load();
  }

  async function togglePublish(p: Post) {
    await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_published: !p.is_published }),
    });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu yazıyı silmek istediğine emin misin?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    load();
  }

  function handleEdit(p: Post) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      excerpt: p.excerpt ?? "",
      content: p.content,
      cover_color_from: p.cover_color_from,
      cover_color_to: p.cover_color_to,
      is_published: p.is_published,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Blog</h1>
        <p className="mt-1 text-mute">AI ile yazı taslağı oluştur, düzenle, yayınla.</p>
      </div>

      <div className="rounded-xl border border-line bg-panel p-5">
        <h2 className="font-display font-semibold text-ink">AI ile Yaz</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="örn. Instagram takipçi nasıl artırılır"
            className="flex-1 rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          />
          <button
            onClick={handleAiWrite}
            disabled={aiLoading}
            className="rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {aiLoading ? "Yazıyor…" : "✨ AI ile Yaz"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-5">
        <h2 className="font-display font-semibold text-ink">{editingId ? "Yazıyı Düzenle" : "Yeni Yazı"}</h2>
        <input
          required
          placeholder="Başlık"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
        />
        <input
          placeholder="Özet"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
        />
        <textarea
          required
          rows={8}
          placeholder="İçerik (HTML)"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="rounded-lg border border-line bg-void px-3.5 py-2.5 font-mono text-xs text-ink focus-ring"
        />
        <div className="flex items-center gap-3">
          <label className="text-xs text-mute">Kapak rengi:</label>
          <input type="color" value={form.cover_color_from} onChange={(e) => setForm({ ...form, cover_color_from: e.target.value })} />
          <input type="color" value={form.cover_color_to} onChange={(e) => setForm({ ...form, cover_color_to: e.target.value })} />
          <div
            className="h-8 flex-1 rounded-lg"
            style={{ background: `linear-gradient(135deg, ${form.cover_color_from}, ${form.cover_color_to})` }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-mute">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
          Yayınla
        </label>
        {error && <p className="text-sm text-magenta">{error}</p>}
        <div className="flex gap-2">
          <button
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {saving ? "Kaydediliyor…" : editingId ? "Güncelle" : "Kaydet"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(empty);
              }}
              className="rounded-lg border border-line px-4 py-2 text-sm text-mute"
            >
              İptal
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">Başlık</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink">{p.title}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => togglePublish(p)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.is_published ? "bg-emerald-400/15 text-emerald-400" : "bg-mute/15 text-mute"
                    }`}
                  >
                    {p.is_published ? "Yayında" : "Taslak"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleEdit(p)} className="mr-3 text-xs text-cyan hover:underline">Düzenle</button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-magenta hover:underline">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
