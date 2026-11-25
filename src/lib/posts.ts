import { getCollection, type CollectionEntry } from 'astro:content';
import { TOPICS, assignCovers } from './cover-art.mjs';

export type BlogEntry = CollectionEntry<'blog'>;

export interface Post {
  /** URL slug, e.g. `site-search-bookmarklet`. */
  slug: string;
  /** Filename-based id, e.g. `2023-01-17-site-search-bookmarklet`. */
  legacySlug: string;
  title: string;
  seoTitle?: string;
  excerpt: string;
  /** Publish date, YYYY-MM-DD. */
  date: string;
  /** Last meaningful update, YYYY-MM-DD. Equals `date` when the post was never updated. */
  updated: string;
  /** Optional image for the article header (in place of the cover). Cards always use the cover. */
  featuredImage?: string;
  /** Alt text for the featured image; empty (decorative) when unset. */
  featuredImageAlt?: string;
  /** Main topic key (content, dataviz, measurement, seo, dev). */
  topic: keyof typeof TOPICS;
  /** Reader-facing topic name, e.g. "Data visualization". */
  topicLabel: string;
  /** Chart type drawn on the generated cover (see assignCovers). */
  cover: string;
  /** Seed for the cover's made-up data: the slug unless `cover_seed` is set. */
  coverSeed: string;
  /** Real numbers for the cover chart, from `cover_data`. */
  coverData?: number[];
  /** Generated 1200×630 social share card (see src/lib/og-cards.mjs). */
  ogImage: string;
  url: string;
  tags: string[];
  keywords: string[];
  readingTime: number;
  series?: string;
  seriesOrder?: number;
  faq: { question: string; answer: string }[];
  entry: BlogEntry;
}

function trimSlashes(value: string) {
  return value.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

function dateFromId(id: string) {
  return id.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ?? '1970-01-01';
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toPost(entry: BlogEntry): Post {
  const { data } = entry;
  const slug = trimSlashes(data.slug) || entry.id;
  const date = data.date ?? dateFromId(entry.id);
  return {
    slug,
    legacySlug: entry.id,
    title: data.title,
    seoTitle: data.seo_title,
    excerpt: data.excerpt,
    date,
    updated: data.updated && data.updated > date ? data.updated : date,
    featuredImage: data.featured_image,
    featuredImageAlt: data.featured_image_alt,
    topic: data.topic,
    topicLabel: TOPICS[data.topic].label,
    // Filled in by getAllPosts, which needs every post to rotate charts.
    cover: data.cover ?? TOPICS[data.topic].kinds[0],
    coverSeed: data.cover_seed ?? slug,
    coverData: data.cover_data,
    ogImage: `/assets/img/og/${slug}.png`,
    url: `/blog/${slug}/`,
    tags: data.tags,
    keywords: data.keywords ?? data.tags,
    readingTime: data.readingTime ?? Math.max(1, Math.ceil(countWords(entry.body ?? '') / 260)),
    series: data.series,
    seriesOrder: data.seriesOrder,
    faq: data.faq ?? [],
    entry,
  };
}

/** All posts, newest first. */
export async function getAllPosts(): Promise<Post[]> {
  const entries = await getCollection('blog');
  const posts = entries.map(toPost).sort((a, b) => b.date.localeCompare(a.date));
  const covers = assignCovers(posts.map(({ slug, date, topic, entry }) => ({ slug, date, topic, cover: entry.data.cover })));
  for (const post of posts) post.cover = covers.get(post.slug) ?? post.cover;
  return posts;
}

export interface PostHeading {
  id: string;
  text: string;
  level: number;
}

const decodeEntities = (text: string) =>
  text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/**
 * Headings (with ids) from the post's rendered HTML. Unlike Astro's built-in
 * heading list, this also picks up headings written as raw HTML in markdown.
 */
export function getHeadings(
  post: Post,
  /** Headings from `render()`. Used for MDX posts, which have no pre-rendered HTML. */
  fallback: { depth: number; slug: string; text: string }[] = [],
): PostHeading[] {
  const html = post.entry.rendered?.html ?? '';
  if (!html) {
    return fallback.map((heading) => ({ level: heading.depth, id: heading.slug, text: heading.text }));
  }
  return [...html.matchAll(/<h([1-6])\b[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    id: match[2],
    text: decodeEntities(match[3].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(),
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const normalized = trimSlashes(slug);
  return (await getAllPosts()).find(
    (post) => post.slug === normalized || post.legacySlug === normalized,
  );
}
