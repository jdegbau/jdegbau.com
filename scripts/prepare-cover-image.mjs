/**
 * Prepares a photo, screenshot or illustration for a `scene: image` cover:
 * crops it to 16:9 around the detail that matters, resizes it to 1600×900,
 * flattens transparency onto the cover navy, strips metadata, and saves a
 * JPEG to public/assets/img/covers/. The brand tone is applied later, by the
 * cover itself, so keep the file natural.
 *
 *   npm run cover-image -- <input> <name> [--focus x,y] [--zoom n]
 *
 *   <input>       path to the image (jpg, png, webp, gif, heic: whatever the converter reads)
 *   <name>        output file name, usually the post slug
 *   --focus x,y   the detail the post is about, as fractions of the input
 *                 (0,0 top left; 1,1 bottom right). Default 0.5,0.5
 *   --zoom n      crop tighter around the focus (1 = the largest 16:9 crop; 2 = half as wide)
 *
 * Uses ImageMagick (`magick` or `convert`) if installed, otherwise Python
 * with Pillow. Prints the front matter to paste, with the focus mapped into
 * the cropped image.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_W = 1600;
const OUT_H = 900;
const NAVY = '#0f1f38';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const [value] = args.splice(i, 2).slice(1);
  return value;
};
const focusArg = flag('focus');
const zoom = Math.max(1, Number(flag('zoom') ?? 1));
const [input, rawName] = args;
if (!input || !rawName) {
  console.error('Usage: npm run cover-image -- <input> <name> [--focus x,y] [--zoom n]');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`No file at ${input}`);
  process.exit(1);
}
const name = rawName.replace(/\.(jpe?g|png)$/i, '').replace(/[^\w-]+/g, '-');
const [fx, fy] = (focusArg ?? '0.5,0.5').split(',').map(Number);
if (![fx, fy].every((v) => v >= 0 && v <= 1)) {
  console.error('--focus takes two fractions between 0 and 1, e.g. --focus 0.62,0.4');
  process.exit(1);
}

const root = path.resolve(fileURLToPath(import.meta.url), '../../');
const outDir = path.join(root, 'public/assets/img/covers');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${name}.jpg`);

const has = (cmd) => spawnSync(cmd, ['-version'], { stdio: 'ignore' }).status === 0;
const magick = has('magick') ? ['magick'] : has('convert') ? ['convert'] : null;
const python = !magick && spawnSync('python3', ['-c', 'import PIL'], { stdio: 'ignore' }).status === 0;
if (!magick && !python) {
  console.error('Needs ImageMagick (brew install imagemagick / apt install imagemagick) or Python with Pillow (pip install pillow).');
  process.exit(1);
}

/** Size after EXIF rotation. */
function size() {
  if (magick) {
    const [w, h] = execFileSync(magick[0], [`${input}[0]`, '-auto-orient', '-format', '%w %h', 'info:']).toString().trim().split(' ').map(Number);
    return { w, h };
  }
  const code = 'import sys\nfrom PIL import Image, ImageOps\nim = ImageOps.exif_transpose(Image.open(sys.argv[1]))\nprint(im.width, im.height)';
  const [w, h] = execFileSync('python3', ['-I', '-c', code, input]).toString().trim().split(' ').map(Number);
  return { w, h };
}

const { w, h } = size();
// The largest 16:9 crop, shrunk by --zoom, centered on the focus but kept inside the image.
let cw = Math.min(w, (h * 16) / 9) / zoom;
let ch = (cw * 9) / 16;
cw = Math.round(cw);
ch = Math.round(ch);
const cx = Math.round(Math.min(Math.max(fx * w - cw / 2, 0), w - cw));
const cy = Math.round(Math.min(Math.max(fy * h - ch / 2, 0), h - ch));

if (magick) {
  execFileSync(magick[0], [
    `${input}[0]`, '-auto-orient', '-crop', `${cw}x${ch}+${cx}+${cy}`, '+repage',
    '-background', NAVY, '-alpha', 'remove', '-alpha', 'off',
    '-resize', `${OUT_W}x${OUT_H}!`, '-strip', '-colorspace', 'sRGB',
    '-quality', '82', '-interlace', 'Plane', out,
  ]);
} else {
  const code = [
    'import sys',
    'from PIL import Image, ImageOps',
    'src, out, x, y, w, h, ow, oh, bg = sys.argv[1:10]',
    'im = ImageOps.exif_transpose(Image.open(src)).convert("RGBA")',
    'base = Image.new("RGBA", im.size, bg)',
    'im = Image.alpha_composite(base, im).convert("RGB")',
    'im = im.crop((int(x), int(y), int(x) + int(w), int(y) + int(h))).resize((int(ow), int(oh)), Image.LANCZOS)',
    'im.save(out, "JPEG", quality=82, optimize=True, progressive=True)',
  ].join('\n');
  execFileSync('python3', ['-I', '-c', code, input, out, cx, cy, cw, ch, OUT_W, OUT_H, NAVY].map(String));
}

const nfx = Math.round(((fx * w - cx) / cw) * 100) / 100;
const nfy = Math.round(((fy * h - cy) / ch) * 100) / 100;
console.log(`Saved ${path.relative(root, out)} (cropped ${cw}×${ch} at ${cx},${cy} from ${w}×${h}).`);
if (cw < 960) console.log(`⚠ The crop is only ${cw}px wide, so it was enlarged and may look soft. Use a bigger source or a lower --zoom.`);
console.log(`\ncover:\n  scene: image\n  src: /assets/img/covers/${name}.jpg\n  focus: [${nfx}, ${nfy}]`);
