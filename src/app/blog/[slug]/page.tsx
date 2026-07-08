import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';
import { SITE_URL } from '@/lib/site';
import { Post } from '@/types';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import RichText from '@/components/ui/RichText';
import { prettyDate } from '@/lib/dates';
import { ArticleHeaderButton, ShareButton, ArticleTracking, ArticleCTA } from '@/components/blog/ArticleClient';

export const revalidate = 300;

async function getPost(slugOrId: string): Promise<Post | null> {
  const supabase = supabaseServer();
  const { data: bySlug } = await supabase.from('posts').select('*').eq('slug', slugOrId).eq('published', true).maybeSingle();
  if (bySlug) return bySlug as Post;
  // Legacy support: old links used the raw id. Look it up, then redirect to the slug.
  const { data: byId } = await supabase.from('posts').select('*').eq('id', slugOrId).eq('published', true).maybeSingle();
  return (byId as Post) || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Article not found' };
  const description = post.hook || post.content.slice(0, 155).replace(/[#*_-]/g, '');
  const url = `${SITE_URL}/blog/${post.slug || post.id}`;
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      images: post.featured_image_url ? [{ url: post.featured_image_url, width: 1200, height: 675 }] : undefined,
      publishedTime: post.published_at || post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // Canonicalize: if visited via the old raw-id link, redirect to the pretty slug URL.
  if (post.slug && post.slug !== params.slug) redirect(`/blog/${post.slug}`);

  const supabase = supabaseServer();
  const { data: relatedData } = await supabase
    .from('posts')
    .select('id, slug, title, hook, featured_image_url, published_at, created_at, published, views, featured, author_id')
    .eq('published', true).neq('id', post.id)
    .order('published_at', { ascending: false }).limit(3);
  const related = (relatedData as Post[]) || [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.hook || undefined,
    image: post.featured_image_url ? [post.featured_image_url] : undefined,
    datePublished: post.published_at || post.created_at,
    author: { '@type': 'Organization', name: 'JobDeyEasy' },
    publisher: { '@type': 'Organization', name: 'JobDeyEasy' },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug || post.id}`,
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleTracking postId={post.id} />

      <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="container-tight flex h-16 items-center justify-between">
          <Logo />
          <div className="flex gap-2">
            <ArticleHeaderButton />
          </div>
        </div>
      </header>

      <article className="container-tight max-w-3xl py-12">
        <div className="text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-gold">{prettyDate(post.published_at || post.created_at)}</p>
          <h1 className="display mx-auto mt-4 max-w-2xl text-4xl leading-[1.05] md:text-5xl">{post.title}</h1>
          {post.hook && <p className="mx-auto mt-4 max-w-xl font-display text-xl italic text-muted">{post.hook}</p>}
          <div className="mt-5 flex justify-center"><ShareButton title={post.title} /></div>
        </div>

        {post.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image_url} alt={post.title} className="mt-8 aspect-video w-full rounded-3xl object-cover shadow-card" />
        )}

        <div className="mt-10">
          <RichText text={post.content} className="text-[1.02rem]" justify />
        </div>

        <ArticleCTA />

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl">Keep reading</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug || r.id}`} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
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
      </article>
    </div>
  );
}
