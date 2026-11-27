/**
 * Renders post covers to PNG so you can check one before publishing,
 * without building the site.
 *
 *   npm run covers                 # every post
 *   npm run covers -- srsltid      # posts whose slug contains "srsltid"
 *
 * Writes, per post, to cover-previews/ (git-ignored):
 *   <slug>.card.png    the blog card (16:9)
 *   <slug>.header.png  the article header (4:3)
 * and regenerates the share images in public/assets/img/og/.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { assignCovers, coverSvg } from '../src/lib/cover-art.mjs';
import { renderCoverPng } from '../src/lib/cover-render.mjs';
import { generateOgCards, loadCustomArt, readPosts } from '../src/lib/og-cards.mjs';

const root = pathToFileURL(path.resolve(fileURLToPath(import.meta.url), '../../') + '/');
const filter = process.argv[2] ?? '';
const outDir = fileURLToPath(new URL('./cover-previews/', root));
await mkdir(outDir, { recursive: true });

const posts = await readPosts(fileURLToPath(new URL('./src/content/blog/', root)));
const covers = assignCovers(posts);
const warnings = loadCustomArt(root, posts, covers);
const picked = posts.filter((post) => post.slug.includes(filter));
if (!picked.length) {
  console.error(`No post slug contains "${filter}".`);
  process.exit(1);
}
for (const post of picked) {
  const cover = covers.get(post.slug);
  const card = coverSvg({ seed: post.coverSeed, cover });
  const header = coverSvg({ seed: post.coverSeed, cover, aspect: 4 / 3 });
  await writeFile(path.join(outDir, `${post.slug}.card.png`), await renderCoverPng(card, 1200));
  await writeFile(path.join(outDir, `${post.slug}.header.png`), await renderCoverPng(header, 900));
  console.log(`${post.slug}: ${cover.scene}${cover.kind ? ` (${cover.kind})` : ''}`);
  for (const warning of warnings.get(post.slug) ?? []) console.log(`  ⚠ ${warning}`);
}
await generateOgCards(root);
console.log(`\nCovers: cover-previews/   Share images: public/assets/img/og/<slug>.png`);
