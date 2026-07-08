'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import { prettyDate } from '@/lib/dates';

export default function LatestPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, slug, title, hook, featured_image_url, published_at, created_at, published, author_id')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      setPosts((data as Post[]) || []);
      setLoading(false);
    })();
  }, []);

  if (!loading && posts.length === 0) return null;

  return (
    <section id="blog" className="py-20 md:py-28">
      <div className="container-tight">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="eyebrow">From the blog</span>
            <h2 className="display mt-4 text-[2.4rem] md:text-[3.1rem]">Tips that get you hired</h2>
            <p className="mt-3 text-muted">Short, practical reads on CVs, applications, and landing work in Nigeria.</p>
          </div>
          <Button href="/blog" variant="secondary">All articles <ArrowRight className="h-4 w-4" /></Button>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <Link href={`/blog/${p.slug || p.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                {p.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.featured_image_url} alt={p.title} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="grain relative aspect-video w-full bg-forest" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">{prettyDate(p.published_at || p.created_at)}</p>
                  <h3 className="mt-2 text-lg leading-snug group-hover:text-green">{p.title}</h3>
                  {p.hook && <p className="mt-2 line-clamp-2 text-sm text-muted">{p.hook}</p>}
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-green">Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
