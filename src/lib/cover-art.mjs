/**
 * Generated cover art for blog posts.
 *
 * Every post gets a small chart drawn in the brand's chart style: navy for
 * context, one orange mark for the story. The chart type comes from the
 * post's topic, and the data is seeded from the post's slug, so each cover
 * is unique but every cover belongs to the same set. No photos, no text.
 *
 * Used by src/components/PostCover.astro (inline SVG on the site) and
 * src/lib/og-cards.mjs (social share images), so the two always match.
 * Plain .mjs so the og-cards integration can import it before Astro runs.
 */

/** Topics a post can belong to. The label shows on cards; the kind picks the chart. */
export const TOPICS = {
  content: { label: 'Content strategy', kind: 'hierarchy' },
  dataviz: { label: 'Data visualization', kind: 'compare' },
  measurement: { label: 'Measurement', kind: 'trend' },
  seo: { label: 'SEO', kind: 'search' },
  dev: { label: 'Web development', kind: 'code' },
};

export const KINDS = ['trend', 'compare', 'search', 'hierarchy', 'code', 'measure', 'flow', 'part', 'scatter'];

// Hex values (not CSS variables) so the same SVG renders inside satori/resvg.
const C = {
  bg: '#0f1f38',
  grid: 'rgba(255,255,255,0.05)',
  ink: '#33547e',
  inkSoft: 'rgba(51,84,126,0.55)',
  muted: '#8b97b0',
  fg: '#e8ecf4',
  accent: '#ff4d00',
};

export const W = 1200;
export const H = 675;
// The plot box the chart is drawn into, inset from the edges.
const P = { x: 150, y: 120, w: 900, h: 435 };

/** Deterministic random numbers from a string (FNV-1a hash → mulberry32). */
function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n) => Math.round(n * 10) / 10;
const range = (rand, min, max) => min + rand() * (max - min);

/** Soft orange glow behind the one accented mark. */
const glow = (id, cx, cy, r = 150) =>
  `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="url(#${id}-glow)"/>`;

function trend(rand, id) {
  const n = 14;
  const event = 7 + Math.floor(rand() * 3);
  let y = range(rand, 0.35, 0.5);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const drift = i < event ? range(rand, -0.06, 0.05) : range(rand, 0.02, 0.09);
    y = Math.min(0.95, Math.max(0.12, y + drift));
    pts.push([P.x + (i / (n - 1)) * P.w, P.y + P.h - y * P.h]);
  }
  const line = (list) => list.map(([x, yy], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(yy)}`).join(' ');
  const area = `${line(pts)} L${P.x + P.w} ${P.y + P.h} L${P.x} ${P.y + P.h} Z`;
  const [ex] = pts[event];
  const [lx, ly] = pts[n - 1];
  const gridlines = [0.25, 0.5, 0.75].map((f) => `<line x1="${P.x}" x2="${P.x + P.w}" y1="${r1(P.y + P.h * f)}" y2="${r1(P.y + P.h * f)}" stroke="${C.ink}" stroke-opacity=".45" stroke-width="2" stroke-dasharray="2 10"/>`).join('');
  return `
    ${glow(id, lx, ly)}
    ${gridlines}
    <path d="${area}" fill="url(#${id}-area)"/>
    <line x1="${r1(ex)}" x2="${r1(ex)}" y1="${P.y - 10}" y2="${P.y + P.h}" stroke="${C.accent}" stroke-opacity=".55" stroke-width="3" stroke-dasharray="10 10"/>
    <path d="${line(pts.slice(0, event + 1))}" fill="none" stroke="${C.muted}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${line(pts.slice(event))}" fill="none" stroke="${C.accent}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${r1(lx)}" cy="${r1(ly)}" r="26" fill="${C.accent}" fill-opacity=".22"/>
    <circle cx="${r1(lx)}" cy="${r1(ly)}" r="13" fill="${C.accent}"/>
    <line x1="${P.x}" x2="${P.x + P.w}" y1="${P.y + P.h}" y2="${P.y + P.h}" stroke="${C.ink}" stroke-width="3"/>`;
}

function compare(rand, id) {
  const n = 7;
  const gap = 34;
  const bw = (P.w - gap * (n - 1)) / n;
  const heights = Array.from({ length: n }, () => range(rand, 0.28, 0.82));
  const hi = Math.floor(rand() * n);
  heights[hi] = 0.96;
  const bars = heights.map((h, i) => {
    const x = P.x + i * (bw + gap);
    const bh = h * P.h;
    const fill = i === hi ? C.accent : i % 2 ? C.ink : C.inkSoft;
    return `<rect x="${r1(x)}" y="${r1(P.y + P.h - bh)}" width="${r1(bw)}" height="${r1(bh)}" rx="8" fill="${fill}"/>`;
  }).join('');
  const hx = P.x + hi * (bw + gap) + bw / 2;
  return `${glow(id, hx, P.y + P.h * 0.1, 190)}${bars}
    <line x1="${P.x - 20}" x2="${P.x + P.w + 20}" y1="${P.y + P.h}" y2="${P.y + P.h}" stroke="${C.muted}" stroke-opacity=".6" stroke-width="3"/>`;
}

function search(rand, id) {
  // A results page, abstracted: rank markers, title bars, snippet bars.
  const rows = 5;
  const rowH = P.h / rows;
  const hi = Math.floor(rand() * 3);
  let out = '';
  for (let i = 0; i < rows; i++) {
    const y = P.y + i * rowH + 18;
    const on = i === hi;
    const titleW = range(rand, 0.48, 0.78) * (P.w - 110);
    const snipW = range(rand, 0.6, 0.95) * (P.w - 110);
    out += `
      <circle cx="${P.x + 24}" cy="${r1(y + 14)}" r="${on ? 17 : 13}" fill="${on ? C.accent : 'none'}" stroke="${on ? C.accent : C.ink}" stroke-width="4"/>
      <rect x="${P.x + 80}" y="${r1(y)}" width="${r1(titleW)}" height="26" rx="13" fill="${on ? C.accent : C.muted}" fill-opacity="${on ? 1 : 0.55}"/>
      <rect x="${P.x + 80}" y="${r1(y + 40)}" width="${r1(snipW)}" height="14" rx="7" fill="${C.ink}"/>`;
  }
  return glow(id, P.x + 24, P.y + hi * rowH + 32, 170) + out;
}

function hierarchy(rand, id) {
  // Slice-and-dice treemap with seeded proportions.
  const rects = [];
  const split = (x, y, w, h, depth) => {
    if (depth === 0 || (w < 220 && h < 170)) return rects.push([x, y, w, h]);
    const f = range(rand, 0.38, 0.62);
    if (w >= h) {
      split(x, y, w * f, h, depth - 1);
      split(x + w * f, y, w * (1 - f), h, depth - 1);
    } else {
      split(x, y, w, h * f, depth - 1);
      split(x, y + h * f, w, h * (1 - f), depth - 1);
    }
  };
  split(P.x, P.y, P.w, P.h, 3);
  const hi = Math.floor(rand() * rects.length);
  const gap = 10;
  const shades = [C.ink, C.inkSoft, 'rgba(51,84,126,0.8)'];
  const out = rects.map(([x, y, w, h], i) => `<rect x="${r1(x + gap / 2)}" y="${r1(y + gap / 2)}" width="${r1(w - gap)}" height="${r1(h - gap)}" rx="8" fill="${i === hi ? C.accent : shades[i % 3]}"/>`).join('');
  const [hx, hy, hw, hh] = rects[hi];
  return glow(id, hx + hw / 2, hy + hh / 2, 220) + out;
}

function code(rand, id) {
  // An editor minimap: indented lines of code, one ending in the cursor.
  const lines = 9;
  const lh = P.h / lines;
  const hi = 3 + Math.floor(rand() * 4);
  let indent = 0;
  let out = '';
  for (let i = 0; i < lines; i++) {
    const y = P.y + i * lh + lh / 2 - 9;
    if (i > 0) indent = Math.max(0, Math.min(3, indent + (rand() < 0.4 ? 1 : rand() < 0.5 ? -1 : 0)));
    const x0 = P.x + 70 + indent * 56;
    out += `<rect x="${P.x}" y="${r1(y + 3)}" width="22" height="12" rx="6" fill="${C.ink}" fill-opacity=".7"/>`;
    let x = x0;
    const words = 1 + Math.floor(rand() * 3);
    for (let w = 0; w < words; w++) {
      const ww = range(rand, 70, 220);
      if (x + ww > P.x + P.w - 60) break;
      const fill = w === 0 && i % 3 === 0 ? C.muted : C.ink;
      out += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(ww)}" height="18" rx="9" fill="${fill}" fill-opacity="${fill === C.muted ? 0.6 : 1}"/>`;
      x += ww + 22;
    }
    if (i === hi) {
      out = glow(id, x + 10, y + 9, 140) + out;
      out += `<rect x="${r1(x)}" y="${r1(y - 14)}" width="22" height="46" rx="3" fill="${C.accent}"/>`;
    }
  }
  return out;
}

function measure(rand, id) {
  const cx = P.x + P.w / 2;
  const cy = P.y + P.h - 10;
  const r = 330;
  const v = range(rand, 0.55, 0.85);
  const pt = (t, rad = r) => [cx - rad * Math.cos(Math.PI * t), cy - rad * Math.sin(Math.PI * t)];
  const arc = (t0, t1) => {
    const [x0, y0] = pt(t0);
    const [x1, y1] = pt(t1);
    return `M${r1(x0)} ${r1(y0)} A${r} ${r} 0 0 1 ${r1(x1)} ${r1(y1)}`;
  };
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const [x0, y0] = pt(i / 10, r - 62);
    const [x1, y1] = pt(i / 10, r - 86);
    return `<line x1="${r1(x0)}" y1="${r1(y0)}" x2="${r1(x1)}" y2="${r1(y1)}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  }).join('');
  const [nx, ny] = pt(v, r - 110);
  const [gx, gy] = pt(v);
  return `${glow(id, gx, gy, 170)}
    <path d="${arc(0, 1)}" fill="none" stroke="${C.ink}" stroke-width="40" stroke-linecap="round"/>
    <path d="${arc(0, v)}" fill="none" stroke="${C.accent}" stroke-width="40" stroke-linecap="round"/>
    ${ticks}
    <line x1="${cx}" y1="${cy}" x2="${r1(nx)}" y2="${r1(ny)}" stroke="${C.fg}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="22" fill="${C.fg}"/>`;
}

function flow(rand, id) {
  const left = [0.42, 0.33, 0.25].map((f) => f + range(rand, -0.06, 0.06));
  const nodeW = 26;
  const gap = 26;
  const usable = P.h - gap * 2;
  const total = left.reduce((a, b) => a + b, 0);
  const lNodes = [];
  let y = P.y;
  for (const f of left) {
    const h = (f / total) * usable;
    lNodes.push([y, h]);
    y += h + gap;
  }
  const rSplit = range(rand, 0.35, 0.55);
  const rNodes = [[P.y + 30, (P.h - 60 - gap) * rSplit], [P.y + 30 + (P.h - 60 - gap) * rSplit + gap, (P.h - 60 - gap) * (1 - rSplit)]];
  const hi = Math.floor(rand() * 3);
  const x0 = P.x + nodeW;
  const x1 = P.x + P.w - nodeW;
  const rOffsets = [0, 0];
  let bands = '';
  lNodes.forEach(([ly, lh], i) => {
    const toFirst = i === hi ? 1 : range(rand, 0.2, 0.7);
    let lOffset = 0;
    [toFirst, 1 - toFirst].forEach((share, target) => {
      if (share <= 0.01) return;
      const bh = lh * share;
      const [ry, rh] = rNodes[target];
      const scale = rh / usable;
      const rbh = Math.max(8, bh * (rh / (P.h * 0.5)) * 0.55);
      const ya = ly + lOffset;
      const yb = ry + rOffsets[target];
      const mx = (x0 + x1) / 2;
      const on = i === hi && target === 0;
      bands += `<path d="M${x0} ${r1(ya)} C${r1(mx)} ${r1(ya)} ${r1(mx)} ${r1(yb)} ${x1} ${r1(yb)} L${x1} ${r1(yb + rbh)} C${r1(mx)} ${r1(yb + rbh)} ${r1(mx)} ${r1(ya + bh)} ${x0} ${r1(ya + bh)} Z" fill="${on ? C.accent : C.ink}" fill-opacity="${on ? 0.9 : 0.5}"/>`;
      lOffset += bh;
      rOffsets[target] += rbh;
      void scale;
    });
  });
  const nodes = [
    ...lNodes.map(([ny, nh], i) => `<rect x="${P.x}" y="${r1(ny)}" width="${nodeW}" height="${r1(nh)}" rx="4" fill="${i === hi ? C.accent : C.muted}"/>`),
    ...rNodes.map(([ny, nh]) => `<rect x="${x1}" y="${r1(ny)}" width="${nodeW}" height="${r1(nh)}" rx="4" fill="${C.muted}"/>`),
  ].join('');
  return glow(id, P.x + P.w / 2, lNodes[hi][0] + lNodes[hi][1] / 2, 200) + bands + nodes;
}

function part(rand, id) {
  const cx = P.x + P.w / 2;
  const cy = P.y + P.h / 2;
  const r = 190;
  const parts = [range(rand, 0.32, 0.45), range(rand, 0.18, 0.25), range(rand, 0.12, 0.18)];
  parts.push(1 - parts.reduce((a, b) => a + b, 0));
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segs = parts.map((p, i) => {
    const len = p * circ - 10;
    const s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${i === 0 ? C.accent : [C.ink, C.inkSoft, C.muted][i - 1]}" stroke-opacity="${i === 3 ? 0.45 : 1}" stroke-width="70" stroke-dasharray="${r1(len)} ${r1(circ - len)}" stroke-dashoffset="${r1(-offset)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += p * circ;
    return s;
  }).join('');
  return glow(id, cx + r * 0.7, cy - r * 0.5, 200) + segs;
}

function scatter(rand, id) {
  const n = 26;
  const slope = range(rand, 0.45, 0.75);
  let dots = '';
  let hi = null;
  for (let i = 0; i < n; i++) {
    const fx = rand();
    const fy = Math.min(0.95, Math.max(0.05, slope * fx + 0.12 + range(rand, -0.16, 0.16)));
    const x = P.x + fx * P.w;
    const y = P.y + P.h - fy * P.h;
    if (!hi && fx > 0.6 && fy > slope * fx + 0.2) hi = [x, y];
    else dots += `<circle cx="${r1(x)}" cy="${r1(y)}" r="11" fill="${C.ink}" fill-opacity="${0.55 + rand() * 0.45}"/>`;
  }
  hi = hi ?? [P.x + P.w * 0.82, P.y + P.h * 0.12];
  return `${glow(id, hi[0], hi[1], 150)}
    <line x1="${P.x}" y1="${r1(P.y + P.h - 0.12 * P.h)}" x2="${P.x + P.w}" y2="${r1(P.y + P.h - (slope + 0.12) * P.h)}" stroke="${C.muted}" stroke-opacity=".7" stroke-width="4" stroke-dasharray="14 12"/>
    ${dots}
    <circle cx="${r1(hi[0])}" cy="${r1(hi[1])}" r="30" fill="${C.accent}" fill-opacity=".22"/>
    <circle cx="${r1(hi[0])}" cy="${r1(hi[1])}" r="15" fill="${C.accent}"/>`;
}

const DRAW = { trend, compare, search, hierarchy, code, measure, flow, part, scatter };

// Where the story sits, so a narrow crop keeps it in view.
const FOCUS = { trend: 'xMaxYMid', scatter: 'xMaxYMid', search: 'xMinYMid', code: 'xMinYMid' };

/** Which chart a post's cover uses: an explicit `cover` kind, else its topic's kind. */
export function coverKind(topic, cover) {
  if (cover && DRAW[cover]) return cover;
  return TOPICS[topic]?.kind ?? 'trend';
}

/**
 * The cover as an SVG string.
 * @param {{ seed: string, kind?: string, title?: string, aspect?: number }} options
 *   seed  — usually the post slug; same seed, same picture.
 *   kind  — one of KINDS.
 *   title — accessible name; omit for a decorative cover.
 *   aspect — width/height to crop the art to (e.g. 0.8 for a tall panel). The
 *           crop keeps the chart's story in view. Omit to keep 16:9 and let
 *           the browser crop with preserveAspectRatio.
 */
export function coverSvg({ seed, kind = 'trend', title, aspect }) {
  const focus = FOCUS[kind] ?? 'xMidYMid';
  let viewBox = `0 0 ${W} ${H}`;
  if (aspect && aspect < W / H) {
    const vw = Math.round(H * aspect);
    const x = focus === 'xMaxYMid' ? W - vw - 40 : focus === 'xMinYMid' ? 60 : Math.round((W - vw) / 2);
    viewBox = `${x} 0 ${vw} ${H}`;
  }
  const rand = rng(`${seed}:${kind}`);
  const id = `cv${rng(seed)().toString(36).slice(2, 8)}`;
  const art = (DRAW[kind] ?? trend)(rand, id);
  const a11y = title ? `role="img" aria-label="${title.replace(/"/g, '&quot;')}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="${focus} slice" ${a11y}>
  <defs>
    <pattern id="${id}-grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${C.grid}" stroke-width="2"/>
    </pattern>
    <radialGradient id="${id}-glow">
      <stop offset="0" stop-color="${C.accent}" stop-opacity=".22"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.ink}" stop-opacity=".55"/>
      <stop offset="1" stop-color="${C.ink}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset=".55" stop-color="${C.bg}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity=".85"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#${id}-grid)"/>
  ${art}
  <rect width="${W}" height="${H}" fill="url(#${id}-fade)"/>
</svg>`;
}
