/**
 * Generated cover art for blog posts.
 *
 * Every cover is drawn in the brand's chart style: navy for context, one
 * orange mark for the story, on the grid with a soft glow. A post's `cover`
 * front matter picks a scene (see src/lib/cover-scenes.mjs) and fills it with
 * details from the post: the URL, the query, the code, the questions. Charts
 * are one scene among several; use them when the post is about data.
 * Posts without a `cover` get their topic's default (see TOPICS).
 *
 * Used by src/components/PostCover.astro (inline SVG on the site) and
 * src/lib/og-cards.mjs (social share images), so the two always match.
 * Plain .mjs so the og-cards integration can import it before Astro runs.
 */

/**
 * Topics a post can belong to. The label shows on cards. `kinds` is the set
 * of charts that fit the topic: posts in a topic take them in turn (see
 * assignCovers), so two posts on the same subject don't get the same picture.
 * The first kind is the topic's icon.
 */
import { SCENES, SCENE_DRAW } from './cover-scenes.mjs';
import { custom, imageScene } from './cover-bespoke.mjs';

const DRAW_SCENE = { ...SCENE_DRAW, custom };

export { SCENES };

/**
 * `scene` is the default cover for a post with no `cover` front matter;
 * SEO posts get a search for their title, content posts an outline with
 * their title, dev posts an editor.
 */
export const TOPICS = {
  content: { label: 'Content strategy', scene: 'document', kinds: ['hierarchy', 'heatmap', 'part', 'dumbbell'] },
  dataviz: { label: 'Data visualization', scene: 'chart', kinds: ['compare', 'flow', 'scatter', 'slope', 'histogram', 'part'] },
  measurement: { label: 'Measurement', scene: 'chart', kinds: ['trend', 'funnel', 'measure', 'dumbbell'] },
  seo: { label: 'SEO', scene: 'serp', kinds: ['search', 'slope', 'scatter', 'trend'] },
  dev: { label: 'Web development', scene: 'editor', kinds: ['code', 'flow'] },
};

/** What each chart says, so a post can pick the one that fits its story. */
export const KIND_USES = {
  trend: 'change over time, before and after an event',
  compare: 'comparing items; one stands out',
  search: 'search results, rankings, SERP features',
  hierarchy: 'content inventories, site structure, share of a whole by group',
  code: 'how-tos with code, scripts, implementation',
  measure: 'a single KPI against a target, scores, audits',
  flow: 'journeys, attribution, where traffic goes',
  part: 'mix and share: channels, devices, content types',
  scatter: 'relationships and outliers',
  funnel: 'conversion steps and drop-off',
  heatmap: 'calendars, cadence, when things happen',
  slope: 'before/after for many items: rankings, positions',
  dumbbell: 'gaps: current vs. target, you vs. competitor',
  histogram: 'distributions: word counts, load times, positions',
};

export const KINDS = Object.keys(KIND_USES);

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

/** Real numbers from the post, scaled to 0–1 between `lo` and `hi`. */
function normalize(data, lo = 0.12, hi = 0.95) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  return data.map((v) => lo + ((v - min) / span) * (hi - lo));
}

function trend(rand, id, data) {
  let n = 14;
  let event = 7 + Math.floor(rand() * 3);
  let ys;
  if (data) {
    n = data.length;
    ys = normalize(data);
    // The story starts at the lowest point before the end.
    event = ys.slice(0, -1).reduce((best, v, i, all) => (v < all[best] ? i : best), 0);
    if (event >= n - 2) event = Math.floor(n * 0.55);
  } else {
    let y = range(rand, 0.35, 0.5);
    ys = [];
    for (let i = 0; i < n; i++) {
      const drift = i < event ? range(rand, -0.06, 0.05) : range(rand, 0.02, 0.09);
      y = Math.min(0.95, Math.max(0.12, y + drift));
      ys.push(y);
    }
  }
  const pts = ys.map((v, i) => [P.x + (i / (n - 1)) * P.w, P.y + P.h - v * P.h]);
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

function compare(rand, id, data) {
  const n = data ? Math.min(data.length, 12) : 7;
  const gap = n > 8 ? 22 : 34;
  const bw = (P.w - gap * (n - 1)) / n;
  let heights;
  let hi;
  if (data) {
    heights = normalize(data.slice(0, n), 0.08, 0.96);
    hi = heights.indexOf(Math.max(...heights));
  } else {
    heights = Array.from({ length: n }, () => range(rand, 0.28, 0.82));
    hi = Math.floor(rand() * n);
    heights[hi] = 0.96;
  }
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
  // A real Sankey: each band keeps its width from left to right, and each
  // right-hand node is exactly as tall as the bands flowing into it.
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
  range(rand, 0.35, 0.55); // kept so the seeded choices below stay the same
  const hi = Math.floor(rand() * 3);
  const shares = lNodes.map((_, i) => (i === hi ? 1 : range(rand, 0.2, 0.7)));
  // Band heights: [left node][target].
  const bandH = lNodes.map(([, lh], i) => [lh * shares[i], lh * (1 - shares[i])]);
  const rHeights = [0, 1].map((t) => bandH.reduce((sum, b) => sum + b[t], 0));
  // Right column holds the same total with one gap, centered on the left column.
  const rTop = P.y + gap / 2;
  const rNodes = [[rTop, rHeights[0]], [rTop + rHeights[0] + gap, rHeights[1]]];
  const x0 = P.x + nodeW;
  const x1 = P.x + P.w - nodeW;
  const mx = (x0 + x1) / 2;
  const rOffsets = [0, 0];
  let bands = '';
  lNodes.forEach(([ly], i) => {
    let lOffset = 0;
    [0, 1].forEach((target) => {
      const bh = bandH[i][target];
      if (bh <= 0.5) return;
      const ya = ly + lOffset;
      const yb = rNodes[target][0] + rOffsets[target];
      const on = i === hi && target === 0;
      bands += `<path d="M${x0} ${r1(ya)} C${r1(mx)} ${r1(ya)} ${r1(mx)} ${r1(yb)} ${x1} ${r1(yb)} L${x1} ${r1(yb + bh)} C${r1(mx)} ${r1(yb + bh)} ${r1(mx)} ${r1(ya + bh)} ${x0} ${r1(ya + bh)} Z" fill="${on ? C.accent : C.ink}" fill-opacity="${on ? 0.9 : 0.5}"/>`;
      lOffset += bh;
      rOffsets[target] += bh;
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

function funnel(rand, id, data) {
  // Conversion steps: each bar narrower than the last; the biggest drop is orange.
  let widths;
  if (data) {
    const max = Math.max(...data) || 1;
    widths = data.slice(0, 7).map((v) => Math.max(0.06, v / max));
  } else {
    let w = 1;
    widths = [1];
    for (let i = 1; i < 5; i++) {
      w *= range(rand, 0.45, 0.85);
      widths.push(w);
    }
  }
  const n = widths.length;
  const gap = 18;
  const bh = (P.h - gap * (n - 1)) / n;
  // Orange marks the step that loses the largest share of the step before it.
  let drop = 1;
  for (let i = 1; i < n; i++) if (widths[i] / widths[i - 1] < widths[drop] / widths[drop - 1]) drop = i;
  const cx = P.x + P.w / 2;
  const bars = widths.map((w, i) => {
    const bw = w * P.w;
    const y = P.y + i * (bh + gap);
    const fill = i === drop ? C.accent : i % 2 ? C.ink : C.inkSoft;
    return `<rect x="${r1(cx - bw / 2)}" y="${r1(y)}" width="${r1(bw)}" height="${r1(bh)}" rx="10" fill="${fill}"/>`;
  }).join('');
  return glow(id, cx, P.y + drop * (bh + gap) + bh / 2, 220) + bars;
}

function heatmap(rand, id) {
  // A publishing calendar: weeks across, days down; one hot day in orange.
  const cols = 18;
  const rows = 7;
  const gap = 9;
  const cell = Math.min((P.w - gap * (cols - 1)) / cols, (P.h - gap * (rows - 1)) / rows);
  const gw = cols * cell + gap * (cols - 1);
  const gh = rows * cell + gap * (rows - 1);
  const x0 = P.x + (P.w - gw) / 2;
  const y0 = P.y + (P.h - gh) / 2;
  const busyDay = Math.floor(rand() * 5) + 1;
  const hot = [Math.floor(rand() * (cols - 4)) + 2, busyDay];
  let cells = '';
  for (let c = 0; c < cols; c++) {
    const weekLoad = 0.3 + 0.7 * Math.sin((c / cols) * Math.PI * range(rand, 0.8, 1.4)) ** 2;
    for (let r = 0; r < rows; r++) {
      const weekend = r === 0 || r === 6;
      const v = Math.min(1, (weekend ? 0.15 : r === busyDay ? 0.75 : 0.35) * weekLoad + rand() * 0.35);
      const on = c === hot[0] && r === hot[1];
      const fill = on ? C.accent : C.ink;
      const opacity = on ? 1 : (0.1 + v ** 1.4 * 0.9).toFixed(2);
      cells += `<rect x="${r1(x0 + c * (cell + gap))}" y="${r1(y0 + r * (cell + gap))}" width="${r1(cell)}" height="${r1(cell)}" rx="6" fill="${fill}" fill-opacity="${opacity}"/>`;
    }
  }
  return glow(id, x0 + hot[0] * (cell + gap) + cell / 2, y0 + hot[1] * (cell + gap) + cell / 2, 160) + cells;
}

function slope(rand, id) {
  // Before and after for several items; the one that climbed most is orange.
  const n = 6;
  const xa = P.x + P.w * 0.18;
  const xb = P.x + P.w * 0.82;
  const items = Array.from({ length: n }, () => [range(rand, 0.1, 0.9), range(rand, 0.1, 0.9)]);
  const hi = Math.floor(rand() * n);
  items[hi] = [range(rand, 0.08, 0.28), range(rand, 0.78, 0.94)];
  const y = (v) => P.y + P.h - v * P.h;
  const axes = [xa, xb].map((x) => `<line x1="${r1(x)}" x2="${r1(x)}" y1="${P.y - 10}" y2="${P.y + P.h + 10}" stroke="${C.ink}" stroke-width="3"/>`).join('');
  const lines = items
    .map(([a, b], i) => ({ a, b, i }))
    .sort((p, q) => (p.i === hi) - (q.i === hi))
    .map(({ a, b, i }) => {
      const on = i === hi;
      const stroke = on ? C.accent : C.muted;
      const op = on ? 1 : 0.5;
      return `<line x1="${r1(xa)}" y1="${r1(y(a))}" x2="${r1(xb)}" y2="${r1(y(b))}" stroke="${stroke}" stroke-opacity="${op}" stroke-width="${on ? 8 : 5}" stroke-linecap="round"/>
        <circle cx="${r1(xa)}" cy="${r1(y(a))}" r="${on ? 13 : 10}" fill="${on ? C.accent : C.ink}"/>
        <circle cx="${r1(xb)}" cy="${r1(y(b))}" r="${on ? 13 : 10}" fill="${on ? C.accent : C.ink}"/>`;
    })
    .join('');
  return glow(id, xb, y(items[hi][1]), 170) + axes + lines;
}

function dumbbell(rand, id) {
  // Two values per row (now vs. target, you vs. a competitor); the widest gap is orange.
  const rows = 6;
  const rowH = P.h / rows;
  const pairs = Array.from({ length: rows }, () => {
    const a = range(rand, 0.08, 0.6);
    return [a, Math.min(0.96, a + range(rand, 0.08, 0.35))];
  });
  const hi = Math.floor(rand() * rows);
  pairs[hi] = [range(rand, 0.06, 0.2), range(rand, 0.82, 0.96)];
  const x = (v) => P.x + v * P.w;
  let out = '';
  pairs.forEach(([a, b], i) => {
    const y = P.y + i * rowH + rowH / 2;
    const on = i === hi;
    out += `<line x1="${P.x}" x2="${P.x + P.w}" y1="${r1(y)}" y2="${r1(y)}" stroke="${C.ink}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="2 10"/>
      <line x1="${r1(x(a))}" x2="${r1(x(b))}" y1="${r1(y)}" y2="${r1(y)}" stroke="${on ? C.accent : C.ink}" stroke-width="${on ? 10 : 8}" stroke-linecap="round"/>
      <circle cx="${r1(x(a))}" cy="${r1(y)}" r="${on ? 15 : 13}" fill="${on ? C.fg : C.muted}"/>
      <circle cx="${r1(x(b))}" cy="${r1(y)}" r="${on ? 15 : 13}" fill="${on ? C.accent : C.ink}"/>`;
  });
  return glow(id, x(pairs[hi][1]), P.y + hi * rowH + rowH / 2, 170) + out;
}

function histogram(rand, id, data) {
  // A distribution: touching bars under a smooth curve; the tallest bin is orange.
  let bins;
  if (data) {
    bins = normalize(data.slice(0, 24), 0.06, 0.95);
  } else {
    const n = 16;
    const mu = range(rand, 0.3, 0.7) * n;
    const sigma = range(rand, 2.2, 3.6);
    bins = Array.from({ length: n }, (_, i) => Math.max(0.05, Math.exp(-((i - mu) ** 2) / (2 * sigma ** 2)) * 0.9 + rand() * 0.08));
  }
  const n = bins.length;
  const gap = 6;
  const bw = (P.w - gap * (n - 1)) / n;
  const hi = bins.indexOf(Math.max(...bins));
  const bars = bins.map((h, i) => {
    const bh = h * P.h;
    return `<rect x="${r1(P.x + i * (bw + gap))}" y="${r1(P.y + P.h - bh)}" width="${r1(bw)}" height="${r1(bh)}" rx="4" fill="${i === hi ? C.accent : C.ink}" fill-opacity="${i === hi ? 1 : 0.85}"/>`;
  }).join('');
  const curve = bins
    .map((h, i) => `${i ? 'L' : 'M'}${r1(P.x + i * (bw + gap) + bw / 2)} ${r1(P.y + P.h - h * P.h - 18)}`)
    .join(' ');
  return `${glow(id, P.x + hi * (bw + gap) + bw / 2, P.y + P.h * (1 - bins[hi]), 180)}${bars}
    <path d="${curve}" fill="none" stroke="${C.muted}" stroke-opacity=".7" stroke-width="4" stroke-linejoin="round" stroke-dasharray="2 12" stroke-linecap="round"/>
    <line x1="${P.x - 20}" x2="${P.x + P.w + 20}" y1="${P.y + P.h}" y2="${P.y + P.h}" stroke="${C.muted}" stroke-opacity=".6" stroke-width="3"/>`;
}

const DRAW = { trend, compare, search, hierarchy, code, measure, flow, part, scatter, funnel, heatmap, slope, dumbbell, histogram };

// Where the story sits, so a narrow crop keeps it in view.
const FOCUS = { trend: 'xMaxYMid', scatter: 'xMaxYMid', search: 'xMinYMid', code: 'xMinYMid', slope: 'xMaxYMid' };

/** The topic's signature chart (its icon). */
export function topicKind(topic) {
  return TOPICS[topic]?.kinds[0] ?? 'trend';
}

/** The small icon on a cover's label: the chart kind, or the closest one for a scene. */
const SCENE_ICON = { browser: 'search', serp: 'search', editor: 'code', timeline: 'trend', document: 'hierarchy', checklist: 'measure' };
/** `fallback` (usually the topic's chart) is used for bespoke covers, which have no fixed icon. */
export function coverIcon(cover, fallback = 'trend') {
  return cover?.scene === 'chart' ? cover.kind ?? 'trend' : SCENE_ICON[cover?.scene] ?? fallback;
}

/** A post's `cover` front matter as a scene object: a chart kind string becomes a chart scene. */
export function normalizeCover(cover) {
  if (!cover) return undefined;
  if (typeof cover === 'string') return DRAW[cover] ? { scene: 'chart', kind: cover } : undefined;
  return cover.scene ? { ...cover } : undefined;
}

/**
 * Picks every post's cover. A post's `cover` front matter always wins.
 * Without it, the post gets its topic's default scene. Chart covers without
 * a `kind` take the topic's charts in turn: posts are taken oldest first,
 * each takes the next chart in its topic's set, skipping one that the
 * previous chart post already used. Because older posts come first,
 * publishing a new post never changes the covers of the posts before it.
 *
 * @param {{ slug: string, date: string, topic: string, title?: string, cover?: string | object, coverData?: number[] }[]} posts
 * @returns {Map<string, object>} slug → cover scene object
 */
export function assignCovers(posts) {
  const covers = new Map();
  const turn = {};
  let previous;
  for (const post of [...posts].sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug))) {
    const topic = TOPICS[post.topic] ?? TOPICS.content;
    let cover = normalizeCover(post.cover);
    if (!cover) {
      const title = post.title ?? '';
      if (topic.scene === 'serp') cover = { scene: 'serp', query: title.toLowerCase().replace(/[?!.:]+$/, '') };
      else if (topic.scene === 'document') cover = { scene: 'document', title };
      else cover = { scene: topic.scene };
    }
    if (cover.scene === 'chart') {
      if (!cover.kind || !DRAW[cover.kind]) {
        const pool = topic.kinds;
        let i = turn[post.topic] ?? 0;
        if (pool.length > 1 && pool[i % pool.length] === previous) i += 1;
        cover.kind = pool[i % pool.length];
        turn[post.topic] = i + 1;
      }
      if (!cover.data && post.coverData) cover.data = post.coverData;
      previous = cover.kind;
    }
    covers.set(post.slug, cover);
  }
  return covers;
}

/**
 * The cover as an SVG string.
 * @param {{ seed: string, cover?: object | string, kind?: string, data?: number[], title?: string, aspect?: number, mode?: 'crop' | 'extend' }} options
 *   seed   — usually the post slug; same seed, same picture.
 *   cover  — a scene object (see cover-scenes.mjs) or a chart kind.
 *   kind, data — shorthand for a chart cover: one of KINDS, and real
 *           numbers from the post (trend, compare, funnel, histogram).
 *   title  — accessible name; omit for a decorative cover.
 *   aspect — width/height of the box the cover fills, when narrower than 16:9.
 *   mode   — `extend` (default) grows the canvas taller so the whole picture
 *           stays in view; `crop` trims the sides instead, keeping the
 *           story in view (for tall panels like the share image).
 *           Without `aspect`, the browser crops with preserveAspectRatio.
 */
export function coverSvg({ seed, cover, kind = 'trend', data, title, aspect, mode = 'extend' }) {
  const spec = normalizeCover(cover) ?? { scene: 'chart', kind, data };
  const isImage = spec.scene === 'image' && Boolean(spec.src);
  const isChart = !isImage && (spec.scene === 'chart' || !DRAW_SCENE[spec.scene]);
  const chartKind = isChart ? (DRAW[spec.kind] ? spec.kind : 'trend') : null;
  const rand = rng(`${seed}:${isChart ? chartKind : spec.scene}`);
  const id = `cv${rng(seed)().toString(36).slice(2, 8)}`;
  let art;
  let focusX;
  let align;
  let defs = '';
  if (isChart) {
    const series = Array.isArray(spec.data) && spec.data.length >= 3 ? spec.data.map(Number).filter(Number.isFinite) : undefined;
    art = DRAW[chartKind](rand, id, series);
    align = FOCUS[chartKind] ?? 'xMidYMid';
  } else if (isImage) {
    // Drawn once the canvas is known (below): the photo has to cover it.
    align = spec.frame === 'window' ? 'xMidYMin' : 'xMidYMid';
    focusX = imageScene(id, spec, [0, 0, W, H]).focus[0];
  } else {
    const drawn = DRAW_SCENE[spec.scene](rand, id, spec);
    art = drawn.art;
    focusX = drawn.focus?.[0];
    // Windowed scenes keep their top (the address bar, the tab) in view.
    align = spec.scene === 'timeline' || (spec.scene === 'custom' && !spec.frame) ? 'xMidYMid' : 'xMidYMin';
  }
  // The canvas: x, y, width, height in drawing units.
  let box = [0, 0, W, H];
  if (aspect && aspect < W / H) {
    if (mode === 'crop') {
      const vw = Math.round(H * aspect);
      let x;
      if (focusX !== undefined) x = Math.round(Math.min(Math.max(focusX - vw / 2, 0), W - vw));
      else x = align === 'xMaxYMid' ? W - vw - 40 : align === 'xMinYMid' ? 60 : Math.round((W - vw) / 2);
      box = [x, 0, vw, H];
    } else {
      const vh = Math.round(W / aspect);
      const share = align === 'xMidYMin' ? 0.3 : 0.5;
      box = [0, -Math.round((vh - H) * share), W, vh];
    }
  }
  if (isImage) {
    // A crop keeps the 16:9 layout and picks the focus out of it; a taller canvas re-fits the photo.
    const drawn = imageScene(id, spec, mode === 'crop' ? [0, 0, W, H] : box);
    art = drawn.art;
    defs = drawn.defs;
  }
  const viewBox = box.join(' ');
  const bgRect = `x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"`;
  const a11y = title ? `role="img" aria-label="${title.replace(/"/g, '&quot;')}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="${align} slice" ${a11y}>
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
      <stop offset="${isChart || (isImage && spec.frame !== 'window') ? '.55' : '.7'}" stop-color="${C.bg}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity=".85"/>
    </linearGradient>
    <filter id="${id}-shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
    ${defs}
  </defs>
  <rect ${bgRect} fill="${C.bg}"/>
  <rect ${bgRect} fill="url(#${id}-grid)"/>
  ${art}
  <rect ${bgRect} fill="url(#${id}-fade)"/>
</svg>`;
}
