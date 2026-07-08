import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = supabaseServer();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/jobs`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/signup`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const [{ data: posts }, { data: jobs }] = await Promise.all([
    supabase.from('posts').select('slug, id, published_at, created_at').eq('published', true),
    supabase.from('job_postings').select('id, created_at').eq('filled', false).eq('closed', false),
  ]);

  const postRoutes: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug || p.id}`,
    lastModified: p.published_at || p.created_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const jobRoutes: MetadataRoute.Sitemap = (jobs || []).map((j) => ({
    url: `${SITE_URL}/jobs/${j.id}`,
    lastModified: j.created_at,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...jobRoutes];
}
