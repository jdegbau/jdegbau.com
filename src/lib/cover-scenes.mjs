/**
 * Scene covers: post-specific illustrations in the same style as the chart
 * covers (navy panels on the grid, one orange mark with a glow, a fade at
 * the bottom), built from details in the post itself: the URL it's about,
 * the query, the code, the questions.
 *
 * Every scene uses JetBrains Mono only, so text widths are exact (each
 * character is 0.6em wide) and layouts never overflow. Text is cut to fit
 * with an ellipsis instead of shrinking.
 *
 * Each scene returns { art, focus }: the SVG markup and the point the story
 * sits on, so narrow crops (the share image) keep it in view.
 *
 * Imported by src/lib/cover-art.mjs. Plain .mjs so the og-cards integration
 * can import it before Astro runs.
 */

export const SCENES = {
  browser: 'a page or URL: parameters, redirects, what the address bar shows; optional bookmarks bar',
  serp: 'a Google search: the query, a ranking result, or People Also Ask questions',
  editor: 'code from the post: snippets, scripts, config, with the key line marked',
  timeline: 'events over time: sessions, hits, crawls, with one moment marked',
  document: 'an article or page outline: content strategy, structure, briefs',
  checklist: 'steps, audits, requirements: a list with one item marked',
  chart: 'data: one of the chart kinds, optionally with the post\'s real numbers',
};

// Hex values (not CSS variables) so the same SVG renders inside resvg.
export const C = {
  bg: '#0f1f38',
  deep: '#0b1830',
  panel: '#152a49',
  line: '#223a5e',
  ink: '#33547e',
  inkSoft: 'rgba(51,84,126,0.55)',
  inkLight: '#6f8fbf',
  muted: '#8b97b0',
  dim: '#aab4c8',
  fg: '#e8ecf4',
  accent: '#ff4d00',
  accentTint: '#ff7a3d',
};

const W = 1200;
const H = 675;
const FONT = `font-family="JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"`;
const ADVANCE = 0.6;

const r1 = (n) => Math.round(n * 10) / 10;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const range = (rand, min, max) => min + rand() * (max - min);

/** Width of monospace text in drawing units. */
const tw = (s, size) => String(s).length * size * ADVANCE;
/** How many characters fit in `max` units. */
const capacity = (size, max) => Math.max(1, Math.floor(max / (size * ADVANCE)));
/** Cut text to fit `max` units, ending in an ellipsis. */
const fit = (s, size, max) => {
  const str = String(s);
  const n = capacity(size, max);
  return str.length <= n ? str : `${str.slice(0, Math.max(1, n - 1)).trimEnd()}…`;
};

function text(x, y, s, { size = 30, fill = C.dim, weight = 500, anchor = 'start', opacity } = {}) {
  const op = opacity === undefined ? '' : ` fill-opacity="${opacity}"`;
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" font-weight="${weight}" fill="${fill}"${op} text-anchor="${anchor}" ${FONT}>${esc(s)}</text>`;
}

const glow = (id, x, y, r = 170) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="url(#${id}-glow)"/>`;
const bar = (x, y, w, h, fill, opacity = 1) =>
  `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(h, w))}" height="${r1(h)}" rx="${r1(h / 2)}" fill="${fill}"${opacity === 1 ? '' : ` fill-opacity="${opacity}"`}/>`;

/** The window every scene but timeline and chart sits in. Runs off the bottom of the canvas. */
const FRAME = { x: 130, y: 128, w: 940, h: 820 };

function frame(id, { header = 72, title } = {}) {
  const { x, y, w, h } = FRAME;
  const dots = [0, 1, 2].map((i) => `<circle cx="${x + 38 + i * 28}" cy="${y + header / 2}" r="8" fill="${C.ink}"/>`).join('');
  const label = title ? text(x + w / 2, y + header / 2 + 9, fit(title, 24, w - 300), { size: 24, fill: C.muted, anchor: 'middle' }) : '';
  return `
    <rect x="${x}" y="${y + 22}" width="${w}" height="${h}" rx="24" fill="#050d1a" fill-opacity=".55" filter="url(#${id}-shadow)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="${C.panel}" stroke="${C.line}" stroke-width="3"/>
    <line x1="${x}" x2="${x + w}" y1="${y + header}" y2="${y + header}" stroke="${C.line}" stroke-width="3"/>
    ${dots}${label}`;
}

/** A small callout card pointing up at (px, py). Placed below the point. */
function note(str, px, py, { size = 24, max = 560 } = {}) {
  if (!str) return '';
  const label = fit(str, size, max);
  const w = tw(label, size) + 44;
  const h = size + 34;
  const x = Math.min(Math.max(px - w / 2, FRAME.x + 30), FRAME.x + FRAME.w - 30 - w);
  const y = py + 22;
  const tip = Math.min(Math.max(px, x + 26), x + w - 26);
  return `
    <path d="M${r1(tip - 13)} ${r1(y + 1.5)} L${r1(tip)} ${r1(y - 13)} L${r1(tip + 13)} ${r1(y + 1.5)} Z" fill="${C.accent}"/>
    <rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${h}" rx="12" fill="${C.accent}"/>
    ${text(x + 22, y + h / 2 + size * 0.36, label, { size, fill: '#1a0a02', weight: 700 })}`;
}

/** The brand's orange block cursor. */
const cursor = (x, baseline, size) => `<rect x="${r1(x + 4)}" y="${r1(baseline - size * 0.82)}" width="${r1(size * 0.5)}" height="${r1(size * 1.02)}" rx="2" fill="${C.accent}"/>`;

/** Generic page content: a kicker, a headline, text lines, an image block. */
function pageSkeleton(rand, x, y, w) {
  let out = bar(x, y, 120, 14, C.accent, 0.5);
  out += bar(x, y + 40, w * range(rand, 0.55, 0.68), 30, C.muted, 0.55);
  out += bar(x, y + 88, w * range(rand, 0.35, 0.5), 30, C.muted, 0.55);
  const imgW = w * 0.34;
  for (let i = 0; i < 5; i++) out += bar(x, y + 160 + i * 36, (w - imgW - 50) * range(rand, 0.7, 1), 14, C.ink);
  out += `<rect x="${r1(x + w - imgW)}" y="${y + 150}" width="${r1(imgW)}" height="170" rx="14" fill="${C.ink}" fill-opacity=".45"/>`;
  out += `<path d="M${r1(x + w - imgW + 30)} ${y + 290} l60 -64 l40 38 l36 -26 l58 52 Z" fill="${C.ink}"/>`;
  return out;
}

/** Generic search results (rank dot, title, snippet). `hi` gets the orange title. */
function resultSkeleton(rand, x, y, w, rows, hi = -1) {
  let out = '';
  for (let i = 0; i < rows; i++) {
    const ry = y + i * 118;
    const on = i === hi;
    out += `<circle cx="${x + 14}" cy="${ry + 10}" r="12" fill="${on ? C.accent : C.ink}"/>`;
    out += bar(x + 40, ry + 4, w * range(rand, 0.18, 0.28), 12, C.ink);
    out += bar(x, ry + 34, w * range(rand, 0.45, 0.7), 24, on ? C.accent : C.muted, on ? 1 : 0.5);
    out += bar(x, ry + 72, w * range(rand, 0.75, 0.98), 12, C.ink);
  }
  return out;
}

/** Splits a URL into before / highlight / after and trims it to `n` characters, keeping the highlight. */
function splitUrl(url, highlight, n) {
  let s = url;
  let at = highlight ? s.indexOf(highlight) : -1;
  if (at >= 0 && at + highlight.length > n - 1) {
    const cut = Math.min(at, at + highlight.length - (n - 4));
    s = `…${s.slice(cut)}`;
    at = s.indexOf(highlight);
  }
  if (s.length > n) s = `${s.slice(0, n - 1)}…`;
  if (at < 0 || at + highlight.length > s.length) return { pre: s, hl: '', post: '' };
  return { pre: s.slice(0, at), hl: highlight, post: s.slice(at + highlight.length) };
}

/* ------------------------------------------------------------------ */

function browser(rand, id, o) {
  const { x, y, w } = FRAME;
  const header = 92;
  const size = 32;
  const barX = x + 136;
  const barW = w - 136 - 34;
  const barY = y + 18;
  const barH = 56;
  const url = String(o.url ?? 'example.com/');
  const { pre, hl, post } = splitUrl(url, o.highlight, capacity(size, barW - 90));
  const tx = barX + 62;
  const ty = barY + barH / 2 + size * 0.36;
  const hx = tx + tw(pre, size);
  const hw = tw(hl, size);
  // Padlock.
  let bar1 = `<rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="${C.deep}" stroke="${C.line}" stroke-width="2"/>
    <rect x="${barX + 22}" y="${barY + 26}" width="20" height="16" rx="3" fill="${C.muted}"/>
    <path d="M${barX + 26} ${barY + 27} v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="${C.muted}" stroke-width="3"/>`;
  if (hl) bar1 += `<rect x="${r1(hx - 6)}" y="${barY + 9}" width="${r1(hw + 12)}" height="${barH - 18}" rx="8" fill="${C.accent}" fill-opacity=".18"/>`;
  bar1 += `<text x="${r1(tx)}" y="${r1(ty)}" font-size="${size}" font-weight="500" ${FONT}><tspan fill="${C.dim}">${esc(pre)}</tspan><tspan fill="${C.accent}" font-weight="700">${esc(hl)}</tspan><tspan fill="${C.muted}">${esc(post)}</tspan></text>`;

  let top = y + header;
  let marks = '';
  let focus = hl ? [hx + hw / 2, barY + barH / 2] : [barX + barW / 2, barY + barH / 2];
  const bookmarks = Array.isArray(o.bookmarks) ? o.bookmarks.slice(0, 4) : [];
  if (bookmarks.length) {
    const on = o.bookmark ?? bookmarks[0];
    let bx = x + 36;
    const by = top + 14;
    for (const b of bookmarks) {
      const label = fit(b, 24, 260);
      const bw = tw(label, 24) + 74;
      const sel = b === on;
      marks += `<rect x="${r1(bx)}" y="${by}" width="${r1(bw)}" height="46" rx="10" fill="${sel ? C.accent : '#fff'}" fill-opacity="${sel ? 0.14 : 0.04}" stroke="${sel ? C.accent : 'none'}" stroke-width="2.5"/>`;
      marks += `<path d="M${r1(bx + 20)} ${by + 13} h16 v22 l-8 -6 l-8 6 Z" fill="${sel ? C.accent : C.ink}"/>`;
      marks += text(bx + 50, by + 31, label, { size: 24, fill: sel ? C.fg : C.muted, weight: sel ? 700 : 500 });
      if (sel && !hl) focus = [bx + bw / 2, by + 23];
      if (sel) marks = glow(id, bx + bw / 2, by + 23, 150) + marks;
      bx += bw + 14;
    }
    top += 74;
    marks += `<line x1="${x}" x2="${x + w}" y1="${top}" y2="${top}" stroke="${C.line}" stroke-width="3"/>`;
  }
  const body = o.body === 'serp'
    ? resultSkeleton(rand, x + 70, top + 50, w - 140, 4, -1)
    : pageSkeleton(rand, x + 70, top + 52, w - 140);
  const glowAt = hl ? glow(id, hx + hw / 2, barY + barH / 2, 190) : '';
  const art = `${frame(id, { header })}${body}${glowAt}${bar1}${marks}${note(o.note, focus[0], hl ? barY + barH : focus[1] + 23)}`;
  return { art, focus };
}

function serp(rand, id, o) {
  const { x, y, w } = FRAME;
  const header = 100;
  const size = 32;
  const fx = x + 136;
  const fw = w - 136 - 34;
  const fy = y + 20;
  const fh = 60;
  const query = fit(o.query ?? 'search', size, fw - 130);
  const qx = fx + 34;
  const qy = fy + fh / 2 + size * 0.36;
  let out = frame(id, { header });
  out += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${fh / 2}" fill="${C.deep}" stroke="${C.line}" stroke-width="2"/>`;
  out += text(qx, qy, query, { size, fill: C.fg });
  out += cursor(qx + tw(query, size), qy, size);
  out += `<circle cx="${fx + fw - 46}" cy="${fy + 27}" r="12" fill="none" stroke="${C.muted}" stroke-width="4"/><path d="M${fx + fw - 37} ${fy + 36} l10 10" stroke="${C.muted}" stroke-width="4" stroke-linecap="round"/>`;

  const bx = x + 70;
  const bw = w - 140;
  let by = y + header + 44;
  let focus;
  const questions = Array.isArray(o.questions) ? o.questions.slice(0, 5) : [];
  if (questions.length) {
    out += resultSkeleton(rand, bx, by, bw, 1, -1);
    by += 124;
    out += text(bx, by + 8, o.label ?? 'People also ask', { size: 26, fill: C.fg, weight: 700 });
    by += 34;
    const hi = Math.min(Math.max(0, o.highlight ?? 0), questions.length - 1);
    questions.forEach((q, i) => {
      const on = i === hi;
      const rowH = on ? 140 : 70;
      out += `<line x1="${bx}" x2="${bx + bw}" y1="${by}" y2="${by}" stroke="${C.line}" stroke-width="2"/>`;
      if (on) {
        out += glow(id, bx + bw * 0.4, by + 40, 210);
        out += `<rect x="${bx - 20}" y="${by + 10}" width="6" height="${rowH - 20}" rx="3" fill="${C.accent}"/>`;
        out += bar(bx, by + 82, bw * range(rand, 0.75, 0.92), 12, C.ink);
        out += bar(bx, by + 108, bw * range(rand, 0.45, 0.65), 12, C.ink);
        focus = [bx + bw * 0.3, by + 40];
      }
      out += text(bx, by + 46, fit(q, 28, bw - 80), { size: 28, fill: on ? C.fg : C.dim, weight: on ? 700 : 500 });
      const cy = by + 36;
      const cx = bx + bw - 16;
      out += on
        ? `<path d="M${cx - 12} ${cy + 6} l12 -12 l12 12" fill="none" stroke="${C.accent}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M${cx - 12} ${cy - 6} l12 12 l12 -12" fill="none" stroke="${C.muted}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
      by += rowH;
    });
  } else {
    const hi = Math.min(Math.max(0, o.highlight ?? 0), 3);
    out += glow(id, bx + bw * 0.3, by + hi * 118 + 46, 200);
    out += resultSkeleton(rand, bx, by, bw, 4, hi);
    focus = [bx + bw * 0.3, by + hi * 118 + 46];
  }
  out += note(o.note, focus[0], focus[1] + 30);
  return { art: out, focus };
}

const KEYWORDS = new Set(('function return if else let const var new for while true false null echo add_action add_filter document window location open prompt import export from async await class this def print elif in not and or select where order by').split(' '));

/** Colors one line of code: strings, comments, keywords, punctuation. */
function highlightCode(line, on) {
  const parts = [];
  const re = /(\/\/.*$|#(?![\w-]*\().*$|<!--.*$)|('(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?|`[^`]*`?)|([A-Za-z_$][\w$-]*)|(\s+)|([^\sA-Za-z_$'"`]+)/g;
  let m;
  while ((m = re.exec(line))) {
    const [tok, comment, str, word] = m;
    let fill = C.muted;
    let weight = 500;
    if (comment) fill = C.ink;
    else if (str) { fill = on ? C.accent : C.fg; weight = on ? 700 : 500; }
    else if (word) fill = KEYWORDS.has(word) ? C.inkLight : C.dim;
    parts.push(`<tspan fill="${fill}"${weight === 700 ? ' font-weight="700"' : ''}>${esc(tok)}</tspan>`);
  }
  return parts.join('');
}

function editor(rand, id, o) {
  const { x, y, w } = FRAME;
  const header = 72;
  const size = 27;
  const lh = 50;
  let out = frame(id, { header });
  const file = fit(o.file ?? 'index.js', 24, 420);
  const tabW = tw(file, 24) + 64;
  out += `<rect x="${x + 130}" y="${y + 14}" width="${r1(tabW)}" height="${header - 14}" rx="10" fill="${C.deep}"/>`;
  out += `<rect x="${x + 130}" y="${y + header - 4}" width="${r1(tabW)}" height="4" fill="${C.accent}"/>`;
  out += text(x + 162, y + 52, file, { size: 24, fill: C.fg });

  const gutter = x + 88;
  const cx = x + 120;
  const maxW = x + w - 40 - cx;
  const top = y + header + 58;
  const raw = Array.isArray(o.lines) && o.lines.length ? o.lines : null;
  const lines = raw ? raw.slice(0, 10).map((l) => String(l).replace(/\t/g, '    ')) : null;
  const count = lines ? lines.length : 10;
  const start = Number(o.start ?? 1);
  const hi = Math.min(Math.max(1, Number(o.highlight ?? Math.ceil(count / 2))), count) - 1;
  let focus = [cx + 200, top + hi * lh];
  for (let i = 0; i < count; i++) {
    const base = top + i * lh;
    const on = i === hi;
    if (on) {
      out += `<rect x="${x + 3}" y="${r1(base - lh * 0.68)}" width="${w - 6}" height="${lh}" fill="${C.accent}" fill-opacity=".1"/>`;
      out += `<rect x="${x + 3}" y="${r1(base - lh * 0.68)}" width="6" height="${lh}" fill="${C.accent}"/>`;
    }
    out += text(gutter, base, String(start + i), { size: 22, fill: on ? C.accent : C.ink, anchor: 'end', weight: on ? 700 : 500 });
    if (lines) {
      const indent = lines[i].match(/^ */)[0].length;
      const lx = cx + Math.min(indent, 16) * size * ADVANCE;
      const code = fit(lines[i].trimStart(), size, maxW - (lx - cx));
      out += `<text x="${r1(lx)}" y="${r1(base)}" font-size="${size}" font-weight="500" ${FONT} xml:space="preserve">${highlightCode(code, on)}</text>`;
      if (on) {
        const end = lx + tw(code, size);
        out = glow(id, Math.min(end, x + w - 120), base - 10, 180) + out;
        out += cursor(end, base, size);
        focus = [Math.min(end, x + w - 160), base - 10];
      }
    } else {
      // No code given: indented bars, like a minimap.
      const indent = Math.floor(range(rand, 0, 3)) * 56;
      const ww = range(rand, 160, 520);
      out += bar(cx + indent, base - 18, ww, 18, on ? C.accent : C.ink, on ? 1 : 0.9);
      if (on) { out = glow(id, cx + indent + ww, base - 9, 160) + out; focus = [cx + indent + ww, base - 9]; }
    }
  }
  out += note(o.note, focus[0], focus[1] + lh * 0.4);
  return { art: out, focus };
}

function timeline(rand, id, o) {
  const x0 = 210;
  const x1 = 1090;
  const axisY = 560;
  const ticks = Array.isArray(o.ticks) && o.ticks.length ? o.ticks.slice(0, 6) : ['', '', '', '', ''];
  const at = Math.min(0.85, Math.max(0.15, Number(o.marker_at ?? 0.55)));
  const mx = x0 + at * (x1 - x0);
  const lanes = [190, 310, 430];
  const hiLane = 1;
  let out = `<line x1="${x0 - 30}" x2="${x1 + 20}" y1="${axisY}" y2="${axisY}" stroke="${C.ink}" stroke-width="3"/>`;
  ticks.forEach((t, i) => {
    const tx = x0 + (i / (ticks.length - 1)) * (x1 - x0);
    out += `<line x1="${r1(tx)}" x2="${r1(tx)}" y1="${axisY}" y2="${axisY + 12}" stroke="${C.ink}" stroke-width="3"/>`;
    if (t) out += text(tx, axisY + 48, fit(t, 24, 180), { size: 24, fill: C.muted, anchor: 'middle' });
  });
  out += glow(id, mx + 80, lanes[hiLane], 200);
  lanes.forEach((ly, lane) => {
    // A person, then that person's sessions as capsules of hits.
    out += `<circle cx="120" cy="${ly - 12}" r="13" fill="${C.ink}"/><path d="M96 ${ly + 26} a24 22 0 0 1 48 0 Z" fill="${C.ink}"/>`;
    out += `<line x1="${x0 - 30}" x2="${x1 + 20}" y1="${ly}" y2="${ly}" stroke="${C.ink}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="2 10"/>`;
    const sessions = lane === hiLane
      ? [[x0 + range(rand, 0, 40), x0 + range(rand, 150, 220)], [mx - range(rand, 170, 230), mx + range(rand, 140, 200)]]
      : (() => {
          const a = x0 + range(rand, 20, 160);
          const b = a + range(rand, 140, 240);
          const c = b + range(rand, 90, 160);
          return [[a, b], [c, Math.min(x1, c + range(rand, 150, 300))]];
        })();
    sessions.forEach(([sa, sb], s) => {
      const split = lane === hiLane && s === 1;
      const hits = Math.max(3, Math.round((sb - sa) / 46));
      const draw = (a, b, on) => {
        out += `<rect x="${r1(a)}" y="${ly - 30}" width="${r1(b - a)}" height="60" rx="30" fill="${on ? C.accent : C.ink}" fill-opacity="${on ? 0.2 : 0.45}" stroke="${on ? C.accent : C.ink}" stroke-width="3"/>`;
      };
      if (split) {
        draw(sa, mx - 8, false);
        draw(mx + 8, sb, true);
      } else draw(sa, sb, false);
      for (let k = 0; k < hits; k++) {
        const hx = sa + 28 + (k / (hits - 1)) * (sb - sa - 56);
        if (split && Math.abs(hx - mx) < 22) continue;
        const on = split && hx > mx;
        out += `<circle cx="${r1(hx)}" cy="${ly}" r="${on ? 10 : 8}" fill="${on ? C.accent : C.muted}"/>`;
      }
    });
  });
  out += `<line x1="${r1(mx)}" x2="${r1(mx)}" y1="120" y2="${axisY}" stroke="${C.accent}" stroke-width="4" stroke-dasharray="12 10"/>`;
  if (o.marker) {
    const label = fit(o.marker, 26, 300);
    const lw = tw(label, 26) + 36;
    out += `<rect x="${r1(mx - lw / 2)}" y="78" width="${r1(lw)}" height="50" rx="10" fill="${C.accent}"/>`;
    out += text(mx, 112, label, { size: 26, fill: '#1a0a02', weight: 700, anchor: 'middle' });
  }
  return { art: out, focus: [mx + 60, lanes[hiLane]] };
}

function documentScene(rand, id, o) {
  const { x, y, w } = FRAME;
  const header = 72;
  let out = frame(id, { header, title: o.file });
  const tocX = x + 50;
  const tocW = 300;
  const px = x + 50 + tocW + 50;
  const pw = x + w - 50 - px;
  const top = y + header + 56;
  const headings = Array.isArray(o.headings) && o.headings.length ? o.headings.slice(0, 7) : null;
  const n = headings ? headings.length : 6;
  const hi = Math.min(Math.max(0, o.highlight ?? 1), n - 1);
  out += `<line x1="${px - 30}" x2="${px - 30}" y1="${y + header}" y2="${y + 820}" stroke="${C.line}" stroke-width="3"/>`;
  out += text(tocX, top, 'Contents', { size: 20, fill: C.muted, weight: 700 });
  let focus;
  for (let i = 0; i < n; i++) {
    const ty = top + 50 + i * 52;
    const on = i === hi;
    if (on) {
      out += `<rect x="${tocX - 18}" y="${ty - 28}" width="5" height="40" rx="2.5" fill="${C.accent}"/>`;
      out = glow(id, tocX + 120, ty - 8, 160) + out;
    }
    if (headings) out += text(tocX, ty, fit(headings[i], 22, tocW - 10), { size: 22, fill: on ? C.accent : C.dim, weight: on ? 700 : 500 });
    else out += bar(tocX, ty - 16, tocW * range(rand, 0.45, 0.85), 14, on ? C.accent : C.ink);
  }
  // The page: title, then sections; the marked section has an orange rule.
  const title = o.title ? fit(o.title, 38, pw) : '';
  if (title) out += text(px, top + 8, title, { size: 38, fill: C.fg, weight: 700 });
  else out += bar(px, top - 22, pw * 0.7, 32, C.muted, 0.55);
  let sy = top + 60;
  for (let s = 0; s < 3; s++) {
    const on = s === 1;
    const lines = 3;
    if (on) {
      out += `<rect x="${px - 16}" y="${sy - 10}" width="${pw + 32}" height="${66 + lines * 32}" rx="12" fill="${C.accent}" fill-opacity=".08"/>`;
      out += `<rect x="${px - 16}" y="${sy - 10}" width="5" height="${66 + lines * 32}" rx="2.5" fill="${C.accent}"/>`;
      focus = [px + pw * 0.4, sy + 40];
    }
    if (on && headings) out += text(px, sy + 22, fit(headings[hi], 28, pw), { size: 28, fill: C.fg, weight: 700 });
    else out += bar(px, sy, pw * range(rand, 0.35, 0.55), 24, on ? C.accent : C.muted, on ? 1 : 0.5);
    for (let l = 0; l < lines; l++) out += bar(px, sy + 52 + l * 32, pw * (l === lines - 1 ? range(rand, 0.4, 0.6) : range(rand, 0.85, 1)), 12, C.ink);
    sy += 66 + lines * 32 + 30;
  }
  out += note(o.note, focus[0], focus[1] + 60);
  return { art: out, focus };
}

function checklist(rand, id, o) {
  const { x, y, w } = FRAME;
  const header = 72;
  let out = frame(id, { header, title: o.title });
  const items = Array.isArray(o.items) && o.items.length ? o.items.slice(0, 6) : null;
  const n = items ? items.length : 5;
  const hi = Math.min(Math.max(0, o.highlight ?? Math.min(2, n - 1)), n - 1);
  const ix = x + 70;
  const iw = w - 140;
  const top = y + header + 40;
  const rowH = 78;
  let focus;
  for (let i = 0; i < n; i++) {
    const ry = top + i * rowH;
    const on = i === hi;
    const done = i < hi;
    if (on) {
      out = glow(id, ix + 40, ry + rowH / 2, 180) + out;
      out += `<rect x="${ix - 24}" y="${ry + 6}" width="${iw + 48}" height="${rowH - 12}" rx="14" fill="${C.accent}" fill-opacity=".1" stroke="${C.accent}" stroke-opacity=".6" stroke-width="2.5"/>`;
      focus = [ix + 40, ry + rowH / 2];
    }
    const by = ry + rowH / 2 - 17;
    out += `<rect x="${ix}" y="${by}" width="34" height="34" rx="8" fill="${on ? C.accent : done ? C.ink : 'none'}" stroke="${on ? C.accent : C.ink}" stroke-width="3.5"/>`;
    if (on || done) out += `<path d="M${ix + 8} ${by + 18} l7 7 l12 -14" fill="none" stroke="${on ? '#1a0a02' : C.dim}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (items) out += text(ix + 62, ry + rowH / 2 + 10, fit(items[i], 28, iw - 70), { size: 28, fill: on ? C.fg : done ? C.muted : C.dim, weight: on ? 700 : 500 });
    else out += bar(ix + 62, ry + rowH / 2 - 9, (iw - 70) * range(rand, 0.4, 0.8), 18, on ? C.fg : C.ink, on ? 0.9 : 1);
  }
  out += note(o.note, focus[0] + 200, focus[1] + 30);
  return { art: out, focus };
}

export const SCENE_DRAW = { browser, serp, editor, timeline, document: documentScene, checklist };
export { W, H };
