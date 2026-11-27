/**
 * Bespoke covers: overrides for when no generated scene fits a post, that
 * still keep the cover look (navy on graph paper, one orange mark with a
 * glow, JetBrains Mono, the fade at the bottom).
 *
 *   scene: custom  a hand-drawn SVG fragment in src/content/covers/<art>.svg,
 *                  drawn on the 1200×675 canvas. The frame, grid, glow and
 *                  fade come from coverSvg; the fragment draws only the
 *                  picture. Checked by lintCustomArt.
 *   scene: image   a photo or screenshot in public/assets/img/covers/
 *                  (prepared to 16:9 by `npm run cover-image`), toned navy
 *                  with an SVG filter, with one orange mark on the detail.
 *
 * The `custom-cover` skill (.claude/skills/custom-cover/) walks through both.
 * Plain .mjs so the og-cards integration can import it before Astro runs.
 */
import { C, W, H, FONT, FRAME, frame, glow, note } from './cover-scenes.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/** Prepared cover images are exactly this shape (see scripts/prepare-cover-image.mjs). */
export const IMAGE_W = 1600;
export const IMAGE_H = 900;
export const IMAGE_DIR = '/assets/img/covers/';

/* ------------------------------------------------------------------ */
/* Custom SVG                                                          */
/* ------------------------------------------------------------------ */

/** Colors a fragment may use: the cover palette, plus the shadow and the dark text on orange. */
const PALETTE = new Map(
  [...Object.entries(C), ['shadow', '#050d1a'], ['onAccent', '#1a0a02'], ['white', '#ffffff']]
    .filter(([, v]) => v.startsWith('#'))
    .map(([name, hex]) => [hex.toLowerCase(), name]),
);
const rgbOf = (hex) => {
  const h = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, '$&$&').slice(1) : hex.slice(1, 7);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',');
};
const PALETTE_RGB = new Set([...PALETTE.keys()].map(rgbOf));
const ACCENTS = new Set([C.accent, C.accentTint].map((c) => c.toLowerCase()));
/** Built-in defs a fragment can reference as url(#name). */
export const CUSTOM_DEFS = ['glow', 'area', 'shadow', 'grid', 'fade'];

/**
 * Checks a custom fragment against the cover contract.
 * @returns {{ errors: string[], warnings: string[] }}
 *   errors break the build; warnings are shown by `npm run covers`.
 */
export function lintCustomArt(markup, { title } = {}) {
  const errors = [];
  const warnings = [];
  const src = String(markup ?? '');
  if (!src.trim()) return { errors: ['The file is empty.'], warnings };

  const banned = [
    [/<\s*svg[\s>]/i, 'Leave out the <svg> wrapper: the file is a fragment drawn on the 1200×675 canvas.'],
    [/<\s*script/i, 'No <script>.'],
    [/<\s*style/i, 'No <style> blocks (they leak into the page); use attributes.'],
    [/<\s*foreignObject/i, 'No <foreignObject>.'],
    [/<\s*image[\s>]/i, 'No <image>: use `scene: image` for photos and screenshots.'],
    [/\son[a-z]+\s*=/i, 'No event attributes (onclick, onload…).'],
    [/\b(?:xlink:)?href\s*=\s*["'](?!#)/i, 'Links must point inside the fragment (href="#id").'],
    [/url\(\s*(?!['"]?#)/i, 'url() must reference a gradient or filter by id, e.g. url(#glow).'],
    [/<\s*filter[\s>]/i, 'Use the built-in url(#glow) and url(#shadow) instead of new filters.'],
  ];
  for (const [re, message] of banned) if (re.test(src)) errors.push(message);

  for (const m of src.matchAll(/font-family\s*[=:]\s*["']?([^"';>]+)/gi)) {
    if (!/jetbrains mono/i.test(m[1])) errors.push(`Font "${m[1].trim()}": covers use JetBrains Mono only (it's set for you; leave font-family out).`);
  }

  const offPalette = new Set();
  const COLOR = /(?:^|[\s;"'])(?:fill|stroke|stop-color|flood-color|color)\s*[=:]\s*["']?(#[0-9a-f]{3,8}|rgba?\([^)]*\)|[a-z]+)/gi;
  for (const [, value] of src.matchAll(COLOR)) {
    const v = value.toLowerCase();
    if (v.startsWith('#')) {
      const full = v.length === 4 ? `#${[...v.slice(1)].map((c) => c + c).join('')}` : v.slice(0, 7);
      if (!PALETTE.has(full)) offPalette.add(value);
    } else if (v.startsWith('rgb')) {
      const rgb = v.replace(/rgba?\(/, '').split(',').slice(0, 3).map((n) => Number(n.trim())).join(',');
      if (!PALETTE_RGB.has(rgb)) offPalette.add(value);
    } else if (!['none', 'transparent', 'white', 'url'].includes(v)) offPalette.add(value);
  }
  if (offPalette.size) {
    errors.push(`Off-palette colors: ${[...offPalette].join(', ')}. Use ${[...PALETTE].map(([hex, name]) => `${name} ${hex}`).join(', ')} (opacity via fill-opacity).`);
  }

  // One orange mark: a few shapes can make it up (a ring and its dot, a label and its arrow).
  const accentUses = [...src.matchAll(/(?:fill|stroke|stop-color)\s*=\s*["'](#[0-9a-f]{3,6})["']/gi)].filter(([, c]) => ACCENTS.has(c.toLowerCase())).length;
  if (!accentUses) warnings.push('No orange: every cover marks its one story detail in accent #ff4d00.');
  if (accentUses > 8) warnings.push(`Orange is used ${accentUses} times. Keep it to the one detail the post explains; make context navy or gray.`);

  const texts = [...src.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi)];
  if (texts.length > 14) warnings.push(`${texts.length} text elements: the card is small; cut to the few words that carry the idea.`);
  for (const [, attrs, inner] of texts) {
    const words = inner.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '·').trim();
    const size = Number(attrs.match(/font-size\s*=\s*["']?([\d.]+)/)?.[1] ?? 30);
    const x = Number(attrs.match(/\sx\s*=\s*["']?(-?[\d.]+)/)?.[1] ?? 0);
    const anchor = attrs.match(/text-anchor\s*=\s*["']?(\w+)/)?.[1] ?? 'start';
    const width = words.length * size * 0.6;
    const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
    if (size < 22) warnings.push(`"${words.slice(0, 30)}" is ${size} units: under 22 it can't be read on a blog card.`);
    if (left < 60 || left + width > W - 60) warnings.push(`"${words.slice(0, 30)}" runs to the edge (x ${Math.round(left)}–${Math.round(left + width)} of 1200); keep text inside 60–1140.`);
    if (title && words.length > 12 && title.toLowerCase().includes(words.toLowerCase())) warnings.push(`"${words.slice(0, 30)}" repeats the title; the card already shows it.`);
  }
  return { errors, warnings };
}

/** Prefixes every id in the fragment so two covers on one page don't collide. */
function namespace(markup, id) {
  return String(markup)
    .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, '')
    .replace(/\sid\s*=\s*(["'])([\w-]+)\1/g, (_, q, name) => ` id=${q}${id}-${name}${q}`)
    .replace(/url\(\s*(['"]?)#([\w-]+)\1\s*\)/g, (_, _q, name) => `url(#${id}-${name})`)
    .replace(/((?:xlink:)?href\s*=\s*)(["'])#([\w-]+)\2/g, (_, attr, q, name) => `${attr}${q}#${id}-${name}${q}`);
}

/** scene: custom */
export function custom(rand, id, o) {
  if (!o.markup) throw new Error(`Custom cover "${o.art ?? '?'}" has no SVG loaded. Is src/content/covers/${o.art ?? '<slug>'}.svg there?`);
  const fx = clamp(Number(o.focus?.[0] ?? 0.5), 0, 1) * W;
  const fy = clamp(Number(o.focus?.[1] ?? 0.5), 0, 1) * H;
  const base = o.frame ? frame(id, { header: 72, title: o.title }) : '';
  const art = `${base}<g ${FONT}>${namespace(o.markup, id)}</g>${note(o.note, fx, fy + 40)}`;
  return { art, focus: [fx, fy] };
}

/* ------------------------------------------------------------------ */
/* Image                                                               */
/* ------------------------------------------------------------------ */

const ch = (hex) => [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3));
/** Shadows to highlights, mapped onto the cover's navies. */
const RAMP = [C.deep, C.panel, C.ink, C.inkLight, C.dim];
const LUMA = '0.2126 0.7152 0.0722 0 0';

function toneFilter(id, tone) {
  if (tone === 'graded') {
    // Like the site's graded photo treatment: most of the color out, cooler, darker.
    return `<filter id="${id}-tone" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values=".3"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope=".5" intercept=".03"/>
        <feFuncG type="linear" slope=".54" intercept=".06"/>
        <feFuncB type="linear" slope=".6" intercept=".12"/>
      </feComponentTransfer>
    </filter>`;
  }
  // night: light screenshots flip to dark mode (white page → navy, dark text → light).
  const ramp = tone === 'night' ? [...RAMP].reverse() : RAMP;
  const table = (i) => ramp.map((c) => ch(c)[i]).join(' ');
  return `<filter id="${id}-tone" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="${LUMA} ${LUMA} ${LUMA} 0 0 0 1 0"/>
      <feComponentTransfer>
        <feFuncR type="table" tableValues="${table(0)}"/>
        <feFuncG type="table" tableValues="${table(1)}"/>
        <feFuncB type="table" tableValues="${table(2)}"/>
      </feComponentTransfer>
    </filter>`;
}

/** Where a 16:9 image goes to cover `target` [x, y, w, h], keeping the focus in view. */
function coverRect([tx, ty, tw, th], fx, fy) {
  const s = Math.max(tw / IMAGE_W, th / IMAGE_H);
  const iw = IMAGE_W * s;
  const ih = IMAGE_H * s;
  const ix = clamp(tx + tw / 2 - fx * iw, tx + tw - iw, tx);
  const iy = clamp(ty + th / 2 - fy * ih, ty + th - ih, ty);
  return { ix, iy, iw, ih };
}

/**
 * scene: image. Needs the canvas box, so coverSvg calls it directly.
 * @param {string} id
 * @param {object} o     the cover front matter
 * @param {number[]} box the canvas [x, y, w, h]
 * @returns {{ art: string, defs: string, focus: number[] }}
 */
export function imageScene(id, o, box) {
  const fx = clamp(Number(o.focus?.[0] ?? 0.5), 0, 1);
  const fy = clamp(Number(o.focus?.[1] ?? 0.5), 0, 1);
  const href = String(o.src).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const windowed = o.frame === 'window';
  const header = 72;
  const target = windowed
    ? [FRAME.x + 3, FRAME.y + header, FRAME.w - 6, box[1] + box[3] - (FRAME.y + header) + 2]
    : box;
  const { ix, iy, iw, ih } = coverRect(target, fx, fy);
  const [tx, ty, tw, th] = target;
  const px = ix + fx * iw;
  const py = iy + fy * ih;

  let art = windowed ? frame(id, { header, title: o.title }) : '';
  art += `<clipPath id="${id}-clip"><rect x="${r1(tx)}" y="${r1(ty)}" width="${r1(tw)}" height="${r1(th)}"/></clipPath>`;
  art += `<g clip-path="url(#${id}-clip)"><image href="${href}" x="${r1(ix)}" y="${r1(iy)}" width="${r1(iw)}" height="${r1(ih)}" preserveAspectRatio="none" filter="url(#${id}-tone)"/>`;
  // Graph paper over a full-bleed photo, so it sits on the same surface as every cover.
  if (!windowed) art += `<rect x="${r1(tx)}" y="${r1(ty)}" width="${r1(tw)}" height="${r1(th)}" fill="url(#${id}-grid)"/>`;
  art += '</g>';

  const mark = o.mark ?? 'ring';
  const mw = clamp(Number(o.mark_size?.[0] ?? 0.16), 0.02, 0.9) * iw;
  const mh = clamp(Number(o.mark_size?.[1] ?? o.mark_size?.[0] ?? 0.16), 0.02, 0.9) * ih;
  if (mark !== 'none') {
    art += glow(id, px, py, Math.max(140, Math.min(260, mw * 0.9)));
    if (mark === 'box') {
      art += `<rect x="${r1(px - mw / 2)}" y="${r1(py - mh / 2)}" width="${r1(mw)}" height="${r1(mh)}" rx="12" fill="${C.accent}" fill-opacity=".12" stroke="${C.accent}" stroke-width="6"/>`;
    } else {
      art += `<ellipse cx="${r1(px)}" cy="${r1(py)}" rx="${r1(mw / 2)}" ry="${r1(mh / 2)}" fill="none" stroke="${C.accent}" stroke-width="7"/>`;
    }
  }
  const below = mark === 'none' ? py : py + mh / 2;
  art += note(o.note, px, below + 4);
  return { art, defs: toneFilter(id, o.tone ?? 'duotone'), focus: [px, py] };
}

/**
 * Loads the SVG for every custom cover onto its cover object (`markup`) and
 * checks it. `read(name)` returns the file's text or undefined.
 * Throws on a missing file or a fragment that breaks the contract.
 * @param {Map<string, object>} covers slug → cover (from assignCovers)
 * @param {(name: string) => string | undefined} read
 * @param {Map<string, string>} [titles] slug → title, to warn about repeats
 * @returns {Map<string, string[]>} slug → warnings
 */
export function attachCustomArt(covers, read, titles = new Map()) {
  const warnings = new Map();
  for (const [slug, cover] of covers) {
    if (cover.scene !== 'custom') continue;
    const name = cover.art ?? slug;
    const markup = read(name);
    if (markup === undefined) throw new Error(`Post "${slug}" has \`cover: { scene: custom }\` but src/content/covers/${name}.svg doesn't exist.`);
    const result = lintCustomArt(markup, { title: titles.get(slug) });
    if (result.errors.length) throw new Error(`src/content/covers/${name}.svg (post "${slug}"):\n  - ${result.errors.join('\n  - ')}`);
    cover.markup = markup;
    if (result.warnings.length) warnings.set(slug, result.warnings);
  }
  return warnings;
}
