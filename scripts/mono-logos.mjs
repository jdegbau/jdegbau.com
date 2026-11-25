/**
 * Builds the one-color client logos used by src/components/Logos.astro.
 *
 *   node scripts/mono-logos.mjs
 *
 * Input:  the full-color PNGs in public/assets/img/logos/
 * Output: public/assets/img/logos/mono/*.png (white on transparent)
 *
 * Every logo becomes a single white silhouette, so the strip reads as one
 * set instead of four competing brand colors; the component sets the final
 * tone with opacity. Two logos need more than a recolor:
 *   - Ellsworth: the white "e" inside the red square is knocked out, so the
 *     square doesn't turn into a solid white block.
 *   - Activities & Tours Marketing (TRK): the stacked lockup is rebuilt
 *     side by side (mark left, wordmark right) so the wordmark is readable
 *     at logo-strip sizes. No letterforms are changed.
 * Re-run this whenever a source logo changes.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'public/assets/img/logos');
const outDir = path.join(srcDir, 'mono');

async function load(file) {
  const { data, info } = await sharp(path.join(srcDir, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Every visible pixel becomes white; `keep(x, y, r, g, b)` returns 0–1 to fade it out. */
function whiten({ data, width, height }, keep = () => 1) {
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      out[i] = out[i + 1] = out[i + 2] = 255;
      out[i + 3] = Math.round(a * Math.min(1, Math.max(0, keep(x, y, r, g, b))));
    }
  }
  return { data: out, width, height };
}

const toPng = (img) => sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png({ compressionLevel: 9 });

async function save(img, name) {
  const file = path.join(outDir, name);
  const trimmed = await toPng(img).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  await sharp(trimmed.data).png({ compressionLevel: 9 }).toFile(file);
  console.log(`${name}  ${trimmed.info.width}×${trimmed.info.height}`);
}

await mkdir(outDir, { recursive: true });

// Fire&Spark and Rocket Clicks: straight recolor of the dark-background versions.
await save(whiten(await load('fireandspark-logo-dark.png')), 'fireandspark.png');
await save(whiten(await load('rocket-clicks-logo-dark.png')), 'rocket-clicks.png');

// Ellsworth: knock the white "e" out of the red square (the square spans x 0–52).
{
  const logo = await load('ellsworth-adhesives-logo-ribbon.png');
  const squareRight = 52;
  // Inside the square, red (g≈40) stays and white (g≈255) goes; edges blend.
  await save(whiten(logo, (x, _y, _r, g) => (x > squareRight ? 1 : 1 - (g - 40) / 215)), 'ellsworth.png');
}

// Activities & Tours Marketing by TRK: mark (x 246–437, y 0–160) moves left
// of the wordmark + tagline block (y 200–265).
{
  const file = path.join(srcDir, 'trk-logo.png');
  const mark = await sharp(file).ensureAlpha().extract({ left: 246, top: 0, width: 192, height: 161 }).toBuffer();
  const words = await sharp(file).ensureAlpha().extract({ left: 0, top: 200, width: 684, height: 66 }).toBuffer();
  const markHeight = 96;
  const markResized = await sharp(mark).resize({ height: markHeight }).toBuffer({ resolveWithObject: true });
  const wordsResized = await sharp(words).resize({ height: 70 }).toBuffer({ resolveWithObject: true });
  const gap = 28;
  const width = markResized.info.width + gap + wordsResized.info.width;
  const composed = await sharp({ create: { width, height: markHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: markResized.data, left: 0, top: 0 },
      { input: wordsResized.data, left: markResized.info.width + gap, top: Math.round((markHeight - wordsResized.info.height) / 2) },
    ])
    .raw()
    .toBuffer({ resolveWithObject: true });
  await save(whiten({ data: composed.data, width: composed.info.width, height: composed.info.height }), 'activities-tours-marketing.png');
}
