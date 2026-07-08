'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import RichText from '@/components/ui/RichText';
import { prettyDate } from '@/lib/dates';

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('posts').select('*').eq('id', id).eq('published', true).maybeSingle();
      setPost(data as Post);
      const { data: rel } = await supabase
        .from('posts')
        .select('id, title, hook, featured_image_url, published_at, created_at, published, content, author_id')
        .eq('published', true).neq('id', id)
        .order('published_at', { ascending: false }).limit(3);
      setRelated((rel as Post[]) || []);
      setLoading(false);
    })();
  }, [id]);

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try { await navigator.share({ title: post?.title || 'JobDeyEasy', url }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="container-tight flex h-16 items-center justify-between">
          <Logo />
          <div className="flex gap-2">
            <Button href="/blog" variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> All articles</Button>
            <Button href="/" variant="ghost" size="sm">Home</Button>
          </div>
        </div>
      </header>

      <article className="container-tight max-w-3xl py-12">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : !post ? (
          <p className="text-muted">Article not found. <Link href="/blog" className="font-semibold text-green">Browse all articles</Link>.</p>
        ) : (
          <>
            <p className="eyebrow">{prettyDate(post.published_at || post.created_at)}</p>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <h1 className="display max-w-2xl text-4xl leading-[1.05] md:text-5xl">{post.title}</h1>
              <button onClick={share} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft transition-colors hover:border-green hover:text-green">
                {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Share2 className="h-4 w-4" /> Share</>}
              </button>
            </div>
            {post.hook && <p className="mt-4 max-w-2xl font-display text-xl italic text-muted">{post.hook}</p>}

            {post.featured_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.featured_image_url} alt={post.title} className="mt-8 aspect-video w-full rounded-3xl object-cover shadow-card" />
            )}

            <div className="mt-10">
              <RichText text={post.content} className="text-[1.02rem]" />
            </div>

            <div className="mt-12 rounded-3xl border border-green/30 bg-green-light p-8 text-center">
              <h2 className="text-2xl">Ready to stop applying alone?</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-green-dark">We prepare your tailored CV, cover letter and a ready-to-send email. You just hit Send.</p>
              <div className="mt-5 flex justify-center"><Button href="/signup">Start free trial <ArrowRight className="h-4 w-4" /></Button></div>
            </div>

            {related.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl">Keep reading</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link key={r.id} href={`/blog/${r.id}`} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
                      {r.featured_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.featured_image_url} alt={r.title} className="aspect-video w-full object-cover" />
                      ) : (
                        <div className="grain relative aspect-video w-full bg-forest" />
                      )}
                      <div className="p-4">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">{prettyDate(r.published_at || r.created_at)}</p>
                        <p className="mt-1 text-sm font-bold leading-snug group-hover:text-green">{r.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </article>
    </div>
  );
}
