/**
 * Astro integration that renders a 1200×630 PNG social card for every blog
 * post (plus a site-wide default) before Astro builds the site.
 *
 * Output: public/assets/img/og/<slug>.png and public/assets/img/og/default.png
 * (git-ignored; regenerated on every `astro build` / `astro dev`).
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { parse as parseYaml } from 'yaml';
import { TOPICS, assignCovers, coverSvg } from './cover-art.mjs';

const require = createRequire(import.meta.url);
const WIDTH = 1200;
const HEIGHT = 630;

const colors = {
  canvas: '#0a1526',
  panel: '#152a49',
  line: '#223a5e',
  fg: '#e8ecf4',
  dim: '#aab4c8',
  muted: '#8b97b0',
  orange: '#ff4d00',
  orangeTint: '#ff7a3d',
  bracket: '#33547e',
};

// Tiny hyperscript helper for satori's React-element-shaped input.
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.flat() },
});

async function loadFonts() {
  const font = (pkg, file) => readFile(require.resolve(`${pkg}/files/${file}`));
  const [monoMedium, sansBlack, sansMedium] = await Promise.all([
    font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
    font('@fontsource/schibsted-grotesk', 'schibsted-grotesk-latin-800-normal.woff'),
    font('@fontsource/schibsted-grotesk', 'schibsted-grotesk-latin-500-normal.woff'),
  ]);
  return [
    { name: 'JetBrains Mono', data: monoMedium, weight: 500, style: 'normal' },
    { name: 'Schibsted Grotesk', data: sansBlack, weight: 800, style: 'normal' },
    { name: 'Schibsted Grotesk', data: sansMedium, weight: 500, style: 'normal' },
  ];
}

// Sizes for the title column (it shares the card with the cover art).
function titleSize(title) {
  if (title.length <= 24) return 72;
  if (title.length <= 40) return 62;
  if (title.length <= 60) return 54;
  return 46;
}

const ART_WIDTH = 520;
const svgUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

function card({ eyebrow, title, subtitle, footer, size, art }) {
  const content = h(
    'div',
    {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '56px 72px 48px',
      width: art ? WIDTH - ART_WIDTH + 80 : WIDTH,
    },
    // Logo: (jdegbau) => {}
    h(
      'div',
      { fontFamily: 'JetBrains Mono', fontSize: 34, alignItems: 'center' },
      h('span', { color: colors.bracket }, '('),
      h('span', { color: colors.fg }, 'jdegbau'),
      h('span', { color: colors.bracket }, ')'),
      h('span', { color: colors.orange, margin: '0 14px' }, '=>'),
      h('span', { color: colors.fg }, '{'),
      h('span', { width: 16, height: 34, backgroundColor: colors.orange, margin: '0 4px' }),
      h('span', { color: colors.fg }, '}'),
    ),
    h(
      'div',
      { flexDirection: 'column', gap: 20 },
      h('span', { fontSize: 28, fontWeight: 500, color: colors.muted }, eyebrow),
      h(
        'span',
        { fontWeight: 800, fontSize: size ?? titleSize(title), lineHeight: 1.04, letterSpacing: -2, color: colors.fg, maxWidth: art ? 560 : 1056 },
        title,
      ),
      subtitle ? h('span', { fontSize: 28, lineHeight: 1.4, color: colors.dim, maxWidth: 1000 }, subtitle) : [],
    ),
    h('span', { fontSize: 24, fontWeight: 500, color: colors.muted }, footer),
  );

  // The post's cover art fills the right side and fades into the canvas, so
  // the share image matches the card readers see on the site.
  const artPanel = art
    ? h(
        'div',
        { position: 'absolute', top: 0, right: 0, width: ART_WIDTH, height: HEIGHT },
        { type: 'img', props: { src: svgUri(art), width: ART_WIDTH, height: HEIGHT } },
        h('div', {
          position: 'absolute', top: 0, left: 0, width: 220, height: HEIGHT,
          backgroundImage: `linear-gradient(to right, ${colors.canvas}, rgba(10,21,38,0))`,
        }),
      )
    : [];

  return h(
    'div',
    {
      position: 'relative',
      width: WIDTH,
      height: HEIGHT,
      flexDirection: 'column',
      backgroundColor: colors.canvas,
      fontFamily: 'Schibsted Grotesk',
      color: colors.fg,
    },
    artPanel,
    content,
  );
}

async function render(element, fonts) {
  const svg = await satori(element, { width: WIDTH, height: HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
}

async function readPosts(blogDir) {
  const files = (await readdir(blogDir)).filter((file) => /\.mdx?$/.test(file));
  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(path.join(blogDir, file), 'utf8');
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const data = (match && parseYaml(match[1])) || {};
      const slug = String(data.slug ?? file.replace(/\.mdx?$/, '')).replace(/^\/+|\/+$/g, '');
      const dateFromFile = file.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ?? '1970-01-01';
      const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? dateFromFile);
      return {
        slug,
        date,
        title: String(data.title ?? slug),
        topic: data.topic ?? 'content',
        cover: data.cover,
        coverData: data.cover_data,
        coverSeed: data.cover_seed ?? slug,
      };
    }),
  );
}

export async function generateOgCards(root) {
  const blogDir = fileURLToPath(new URL('./src/content/blog/', root));
  const outDir = fileURLToPath(new URL('./public/assets/img/og/', root));
  await mkdir(outDir, { recursive: true });
  const fonts = await loadFonts();
  const posts = await readPosts(blogDir);

  // Same chart choice as the site (src/lib/posts.ts), so cards and share images match.
  const covers = assignCovers(posts);
  const jobs = posts.map(async ({ slug, title, topic, coverData, coverSeed }) => {
    const art = coverSvg({ seed: coverSeed, kind: covers.get(slug), data: coverData, aspect: ART_WIDTH / HEIGHT, mode: 'crop' });
    const eyebrow = TOPICS[topic]?.label ?? 'From the blog';
    const png = await render(card({ eyebrow, title, footer: 'jdegbau.com/blog', art }), fonts);
    await writeFile(path.join(outDir, `${slug}.png`), png);
  });
  jobs.push(
    (async () => {
      const png = await render(
        card({
          eyebrow: 'Content strategy, data visualization, and measurement',
          title: 'Joshua DeGrasse-Baumann',
          size: 72,
          subtitle: 'I help teams decide what to publish, measure whether it worked, and turn the numbers into charts people understand.',
          footer: 'jdegbau.com',
        }),
        fonts,
      );
      await writeFile(path.join(outDir, 'default.png'), png);
    })(),
  );
  await Promise.all(jobs);
  return posts.length + 1;
}

export default function ogCards() {
  return {
    name: 'jdegbau:og-cards',
    hooks: {
      'astro:config:setup': async ({ config, logger }) => {
        const count = await generateOgCards(config.root);
        logger.info(`Generated ${count} social cards in public/assets/img/og/`);
      },
    },
  };
}
