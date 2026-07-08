import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { supabaseServer } from '@/lib/supabaseServer';
import { SITE_URL } from '@/lib/site';
import { Post } from '@/types';
import Logo from '@/components/ui/Logo';
import BlogHeaderClient from '@/components/blog/BlogHeaderClient';
import MarkSeenEffect from '@/components/blog/MarkSeenEffect';
import { prettyDate } from '@/lib/dates';

export const revalidate = 300; // refresh every 5 minutes

export const metadata: Metadata = {
  title: 'Blog — Tips that get you hired',
  description: 'Short, practical reads on CVs, cover letters, and landing work in Nigeria — from the JobDeyEasy team.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'JobDeyEasy Blog — Tips that get you hired',
    description: 'Short, practical reads on CVs, cover letters, and landing work in Nigeria.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

function PostCard({ p, big = false }: { p: Post; big?: boolean }) {
  return (
    <Link href={`/blog/${p.slug || p.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
      {p.featured_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.featured_image_url} alt={p.title} className="aspect-video w-full object-cover" />
      ) : (
        <div className="grain relative aspect-video w-full bg-forest" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold">{prettyDate(p.published_at || p.created_at)}</p>
        <h2 className={big ? 'mt-2 text-2xl leading-snug group-hover:text-green' : 'mt-2 text-xl leading-snug group-hover:text-green'}>{p.title}</h2>
        {p.hook && <p className="mt-2 line-clamp-2 text-sm text-muted">{p.hook}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-green">Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}

export default async function BlogPage() {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('posts')
    .select('id, slug, title, hook, featured_image_url, published_at, created_at, published, views, featured, author_id')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const posts = (data as Post[]) || [];
  const featured = posts.find((p) => p.featured) || null;
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts;
  const mostRead = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

  return (
    <div className="min-h-screen bg-cream">
      <MarkSeenEffect ids={posts.map((p) => p.id)} />

      <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="container-tight flex h-16 items-center justify-between">
          <Logo />
          <BlogHeaderClient variant="blog" />
        </div>
      </header>

      <section className="container-tight py-12">
        <div className="max-w-2xl">
          <span className="eyebrow">The JobDeyEasy blog</span>
          <h1 className="display mt-4 text-4xl md:text-5xl">Tips that get you hired</h1>
          <p className="mt-3 text-muted">Short, practical reads on CVs, applications, and landing work in Nigeria.</p>
        </div>

        {posts.length === 0 ? (
          <p className="mt-10 text-muted">No articles yet — check back soon.</p>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_280px]">
            <div>
              {featured && (
                <div className="mb-8">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">Featured</p>
                  <PostCard p={featured} big />
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                {rest.map((p) => <PostCard key={p.id} p={p} />)}
              </div>
            </div>

            {mostRead.length > 1 && (
              <aside className="lg:sticky lg:top-24 lg:h-fit">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold"><Flame className="h-3.5 w-3.5" /> Most read</p>
                <ul className="space-y-3">
                  {mostRead.map((p) => (
                    <li key={p.id}>
                      <Link href={`/blog/${p.slug || p.id}`} className="group block rounded-xl border border-line bg-white p-3 shadow-soft transition-colors hover:border-green">
                        <p className="text-sm font-bold leading-snug group-hover:text-green">{p.title}</p>
                        <p className="mt-1 text-xs text-muted">{p.views || 0} reads</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
