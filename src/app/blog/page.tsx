'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { prettyDate } from '@/lib/dates';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, title, hook, featured_image_url, published_at, created_at, published, content, author_id')
        .eq('published', true)
        .order('published_at', { ascending: false });
      setPosts((data as Post[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="container-tight flex h-16 items-center justify-between">
          <Logo />
          <Button href="/" variant="ghost" size="sm">← Home</Button>
        </div>
      </header>

      <section className="container-tight py-12">
        <div className="max-w-2xl">
          <span className="eyebrow">The JobDeyEasy blog</span>
          <h1 className="display mt-4 text-4xl md:text-5xl">Tips that get you hired</h1>
          <p className="mt-3 text-muted">Short, practical reads on CVs, applications, and landing work in Nigeria.</p>
        </div>

        {loading ? (
          <p className="mt-10 text-muted">Loading articles…</p>
        ) : posts.length === 0 ? (
          <p className="mt-10 text-muted">No articles yet — check back soon.</p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                {p.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.featured_image_url} alt={p.title} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="grain relative aspect-video w-full bg-forest" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold">{prettyDate(p.published_at || p.created_at)}</p>
                  <h2 className="mt-2 text-xl leading-snug group-hover:text-green">{p.title}</h2>
                  {p.hook && <p className="mt-2 line-clamp-2 text-sm text-muted">{p.hook}</p>}
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-green">Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
