'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PenLine, Trash2, Pencil, Eye, EyeOff, ImageUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { Post } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ErrorBox from '@/components/ui/ErrorBox';
import { prettyDate } from '@/lib/dates';
import { cn } from '@/lib/cn';

const EMPTY = { title: '', hook: '', featured_image_url: '', content: '', published: false };

export default function AdminBlogPage() {
  const { profile: me } = useAdmin();
  const isAdmin = me?.role === 'admin';
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts((data as Post[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const uploadImage = async (file: File) => {
    setError(''); setUploadingImg(true);
    const ok = ['image/jpeg', 'image/png'];
    if (!ok.includes(file.type)) { setUploadingImg(false); setError('Please upload a JPG or PNG image.'); return; }
    if (file.size > 400 * 1024) { setUploadingImg(false); setError('Image must be under 400KB.'); return; }
    const path = `${me?.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('blog-images').upload(path, file);
    setUploadingImg(false);
    if (upErr) { setError('Image upload failed: ' + upErr.message); return; }
    const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
    setForm((f) => ({ ...f, featured_image_url: data.publicUrl }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.title.trim() || !form.content.trim()) { setError('Title and article content are required.'); return; }
    setSaving(true);
    // Staff can never publish directly — only an admin can flip a post live.
    const willPublish = isAdmin ? form.published : false;
    const payload = {
      title: form.title.trim(),
      hook: form.hook.trim() || null,
      featured_image_url: form.featured_image_url.trim() || null,
      content: form.content,
      published: willPublish,
      published_at: willPublish ? new Date().toISOString() : null,
      ...(editingId ? {} : { author_id: me?.id }),
    };
    const { error: e1 } = editingId
      ? await supabase.from('posts').update(payload).eq('id', editingId)
      : await supabase.from('posts').insert(payload);
    setSaving(false);
    if (e1) { setError(e1.message); return; }
    setForm({ ...EMPTY }); setEditingId(null); load();
  };

  const edit = (p: Post) => {
    setEditingId(p.id);
    setForm({ title: p.title, hook: p.hook || '', featured_image_url: p.featured_image_url || '', content: p.content, published: p.published });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePublish = async (p: Post) => {
    if (!isAdmin) return; // staff can't publish/unpublish — admin only
    await supabase.from('posts').update({ published: !p.published, published_at: !p.published ? new Date().toISOString() : p.published_at }).eq('id', p.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return;
    await supabase.from('posts').delete().eq('id', id);
    load();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold"><PenLine className="h-6 w-6 text-green" /> Blog</h1>
        <p className="text-sm text-muted">Short tips and articles. Published posts appear on /blog and the homepage.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="accent-top rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h2 className="mb-1 font-bold">{editingId ? 'Edit article' : 'Write an article'}</h2>
          {!isAdmin && (
            <p className="mb-3 rounded-xl border border-gold/30 bg-gold-light/60 px-3.5 py-2.5 text-xs font-medium text-gold">
              Articles you write are saved as drafts. An admin reviews and publishes them — you can&apos;t publish directly.
            </p>
          )}
          <p className="mb-4 text-xs text-muted">
            <strong>Featured image:</strong> landscape <strong>1200 × 675px (16:9)</strong>, JPG or PNG, under 400KB.
          </p>
          <ErrorBox message={error} />
          <form onSubmit={save}>
            <FormField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="5 CV mistakes costing you interviews" />
            <FormField label="Hook (short teaser)" value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder="One or two lines shown on the blog cards." helperText="Shown on the homepage and blog list cards." />

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold">Featured image</label>
              <div className="flex items-center gap-3">
                {form.featured_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.featured_image_url} alt="" className="h-14 w-24 rounded-lg border border-line object-cover" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImg}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-green disabled:opacity-60"
                >
                  <ImageUp className="h-4 w-4" /> {uploadingImg ? 'Uploading…' : form.featured_image_url ? 'Replace image' : 'Upload image'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted">Uploads directly — no need to host it elsewhere.</p>
            </div>

            <RichTextEditor
              label="Article"
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              placeholder={"Why your CV isn't landing\n\nMost CVs fail in the first 10 seconds…\n\nKeep it to 2 pages\nTailor it to each role"}
              required
              helperText="Select text and use the buttons above (or Ctrl+B for bold) to format — no need to type any symbols yourself."
            />

            {isAdmin && (
              <label className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publish now
              </label>
            )}

            <Button type="submit" disabled={saving} fullWidth>
              {saving ? 'Saving…' : editingId ? (isAdmin ? 'Update article' : 'Update draft') : isAdmin ? (form.published ? 'Publish article' : 'Save draft') : 'Submit draft for review'}
            </Button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ ...EMPTY }); }} className="mt-2 w-full text-center text-sm text-muted hover:text-ink">Cancel edit</button>}
          </form>
        </div>

        <div className="rounded-2xl border border-line bg-white shadow-soft">
          <div className="border-b border-line px-5 py-4"><h2 className="font-bold">Articles ({posts.length})</h2></div>
          {loading ? <p className="p-5 text-sm text-muted">Loading…</p> : posts.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">No articles yet — write your first one.</p>
          ) : (
            <ul className="divide-y divide-line">
              {posts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                  {p.featured_image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.featured_image_url} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" />
                    : <div className="h-12 w-20 shrink-0 rounded-lg bg-paper" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted">{p.published ? `Published ${prettyDate(p.published_at)}` : isAdmin ? 'Draft' : 'Pending review'}</p>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase', p.published ? 'bg-green-light text-green' : 'bg-paper text-muted')}>{p.published ? 'Live' : isAdmin ? 'Draft' : 'Pending review'}</span>
                  {isAdmin && (
                    <button onClick={() => togglePublish(p)} className="rounded-lg p-2 text-muted hover:bg-green-light hover:text-green" aria-label="Toggle publish">{p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  )}
                  <button onClick={() => edit(p)} className="rounded-lg p-2 text-muted hover:bg-green-light hover:text-green" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
