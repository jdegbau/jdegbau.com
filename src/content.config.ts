import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { KINDS } from './lib/cover-art.mjs';

/**
 * Blog posts live in src/content/blog/*.md. This schema checks every post's
 * front matter at build time, so a typo or missing field fails the build with
 * a clear message instead of silently producing a broken page.
 */

// Accept `2026-01-15` (YAML date) or "2026-01-15" (string); store YYYY-MM-DD.
const isoDate = z
  .union([z.string(), z.date()])
  .transform((value, ctx) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.valueOf())) {
      ctx.addIssue({ code: 'custom', message: `Invalid date: ${String(value)}` });
      return z.NEVER;
    }
    return date.toISOString().slice(0, 10);
  });

const optionalText = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : undefined));

const chartKind = z.enum(KINDS as [string, ...string[]]);
const short = (max: number) => z.string().min(1).max(max);
const note = short(40).optional();
const unit = z.number().min(0).max(1);

/**
 * Post covers. Each scene takes real details from the post. Keep text short:
 * it's drawn large and cut with an ellipsis when it doesn't fit.
 * See src/lib/cover-scenes.mjs for what each scene draws.
 */
const coverSchema = z.union([
  chartKind,
  z.discriminatedUnion('scene', [
    z.object({
      scene: z.literal('browser'),
      url: short(160),
      highlight: z.string().min(1).optional(),
      bookmarks: z.array(short(24)).max(4).optional(),
      bookmark: z.string().optional(),
      body: z.enum(['page', 'serp']).optional(),
      note,
    }).strict(),
    z.object({
      scene: z.literal('serp'),
      query: short(60),
      questions: z.array(short(80)).max(5).optional(),
      label: short(30).optional(),
      highlight: z.number().int().min(0).optional(),
      note,
    }).strict(),
    z.object({
      scene: z.literal('editor'),
      file: short(40).optional(),
      lines: z.array(z.string()).min(1).max(10).optional(),
      start: z.number().int().positive().optional(),
      highlight: z.number().int().positive().optional(),
      note,
    }).strict(),
    z.object({
      scene: z.literal('timeline'),
      ticks: z.array(z.string().max(12)).min(2).max(6).optional(),
      marker: short(20).optional(),
      marker_at: z.number().min(0.15).max(0.85).optional(),
    }).strict(),
    z.object({
      scene: z.literal('document'),
      file: short(40).optional(),
      title: short(80).optional(),
      headings: z.array(short(60)).max(7).optional(),
      highlight: z.number().int().min(0).optional(),
      note,
    }).strict(),
    z.object({
      scene: z.literal('checklist'),
      title: short(40).optional(),
      items: z.array(short(60)).max(6).optional(),
      highlight: z.number().int().min(0).optional(),
      note,
    }).strict(),
    z.object({
      scene: z.literal('chart'),
      kind: chartKind.optional(),
      data: z.array(z.number()).min(3).max(24).optional(),
    }).strict(),
    // Bespoke covers (see src/lib/cover-bespoke.mjs and the custom-cover skill).
    z.object({
      scene: z.literal('custom'),
      /** File name in src/content/covers/, without .svg. Defaults to the post slug. */
      art: z.string().regex(/^[\w-]+$/, 'Use the file name without .svg, e.g. my-post').optional(),
      /** Draw the standard window panel behind the art. */
      frame: z.boolean().optional(),
      title: short(40).optional(),
      /** Where the orange detail sits, as fractions of the canvas [x, y]. Keeps it in view on the share image. */
      focus: z.tuple([unit, unit]).optional(),
      note,
    }).strict(),
    z.object({
      scene: z.literal('image'),
      src: z.string().regex(/^\/assets\/img\/covers\/[\w.-]+\.(?:jpe?g|png)$/, 'Prepare the image with `npm run cover-image`; src is /assets/img/covers/<name>.jpg'),
      tone: z.enum(['duotone', 'night', 'graded']).optional(),
      frame: z.enum(['bleed', 'window']).optional(),
      title: short(40).optional(),
      /** The detail the post is about, as fractions of the image [x, y]. Gets the orange mark. */
      focus: z.tuple([unit, unit]).optional(),
      mark: z.enum(['ring', 'box', 'none']).optional(),
      /** Mark size as fractions of the image [width, height]. */
      mark_size: z.tuple([unit, unit]).optional(),
      note,
    }).strict(),
  ]),
]);

const blog = defineCollection({
  loader: glob({
    // Use .mdx for posts that embed components; plain .md for everything else.
    pattern: '*.{md,mdx}',
    base: './src/content/blog',
    // Keep the filename (e.g. 2023-01-17-site-search-bookmarklet) as the
    // entry id; the public URL comes from the `slug` field instead.
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
  }),
  schema: z
    .object({
      title: z.string().min(1),
      slug: z.string().min(1),
      excerpt: z.string().min(1, 'Add an excerpt; it is used as the meta description.'),
      /** Publish date. Defaults to the date in the filename. */
      date: isoDate.optional(),
      /** Last meaningful content update. Shown on the post and used in schema and the sitemap. */
      updated: isoDate.optional(),
      seo_title: optionalText,
      /** Optional image shown in the article header instead of the cover (cards keep the cover). */
      featured_image: optionalText,
      /** Alt text for featured_image. Leave it out when the image is decorative. */
      featured_image_alt: optionalText,
      /**
       * The post's main topic. Labels the post on cards and picks the chart
       * drawn on its generated cover (see src/lib/cover-art.mjs).
       */
      topic: z.enum(['content', 'dataviz', 'measurement', 'seo', 'dev']).default('content'),
      /**
       * Optional: the generated cover, built from details in the post.
       * A scene object (see coverSchema above and "Post covers" in
       * src/components/README.md), or a chart kind as a shorthand.
       * Without it, the post gets its topic's default scene.
       */
      cover: coverSchema.optional(),
      /** Optional: real numbers for a chart cover (trend, compare, funnel, histogram). Same as `data` on a chart scene. */
      cover_data: z.array(z.number()).min(3).max(24).optional(),
      /** Optional: any text; change it to redraw the cover with different made-up data. */
      cover_seed: z.string().optional(),
      tags: z.array(z.string()).default([]),
      keywords: z.array(z.string()).optional(),
      readingTime: z.number().positive().optional(),
      /** Series name shared by every post in a series, e.g. "Chart by Chart". */
      series: optionalText,
      /** Position within the series (1, 2, 3…). Drives PostSeriesNav order. */
      seriesOrder: z.number().int().positive().optional(),
      /**
       * Post FAQ. Rendered with FAQAccordion and emitted as FAQPage schema,
       * so the visible answers and the structured data always match.
       * `answer` accepts simple HTML.
       */
      faq: z
        .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }).strict())
        .optional(),
    })
    .strict(),
});

export const collections = { blog };
