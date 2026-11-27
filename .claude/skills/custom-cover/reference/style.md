# Drawing a custom cover

A `scene: custom` fragment is plain SVG drawn on a **1200 × 675** canvas. The site wraps it in the cover: the navy background, the graph paper (48-unit squares), the fade at the bottom, and `font-family` JetBrains Mono on everything. Draw only the picture.

## Canvas

```
0,0 ───────────────────────────────────────────── 1200,0
 │   safe area for anything that matters:            │
 │   x 150–1050, y 100–560                           │
 │   (the fade darkens below ~470; the 4:3 header    │
 │   adds space above and below; the share image     │
 │   keeps only a ~560-wide slice around `focus`)    │
0,675 ─────────────────────────────────────────── 1200,675
```

- Grid-align when you can: multiples of 24 or 48 look intentional on the graph paper.
- Text inside x 60–1140 (the lint warns otherwise).
- Let panels run off the bottom edge (like the window scenes) rather than ending in a hard line near y 675.
- With `frame: true`, the window panel is at x 130–1070 from y 128, with a 72-unit title bar; draw contents from y 230 down, x 180–1020.

## Palette

Only these (the lint fails anything else). Opacity goes in `fill-opacity` / `stroke-opacity`, never in the color.

| Name | Hex | Use |
|---|---|---|
| bg | `#0f1f38` | the canvas (already drawn) |
| deep | `#0b1830` | inset fields: inputs, address bars, code wells |
| panel | `#152a49` | cards, nodes, windows |
| line | `#223a5e` | panel borders (stroke-width 3), dividers |
| ink | `#33547e` | context shapes, connectors, bars, placeholder text lines |
| inkLight | `#6f8fbf` | secondary emphasis, keywords |
| muted | `#8b97b0` | quiet labels, axes, inactive states |
| dim | `#aab4c8` | normal labels |
| fg | `#e8ecf4` | the strongest non-orange text (a heading, a value) |
| accent | `#ff4d00` | **the one story detail**, its connector, its label |
| accentTint | `#ff7a3d` | rarely: a second tone inside the orange detail |
| onAccent | `#1a0a02` | text on an orange fill |
| shadow | `#050d1a` | under floating panels, with `filter="url(#shadow)"` and `fill-opacity=".55"` |
| white | `#ffffff` | only at `fill-opacity` ≤ .06, for a faint hover fill |

Built-in defs, referenced by name: `url(#glow)` (soft orange radial; put a circle of r 150–220 behind the detail), `url(#shadow)` (blur filter for panel shadows), `url(#area)` (navy-to-clear vertical gradient for areas under lines), `url(#grid)`, `url(#fade)`. You may define your own `<linearGradient>`/`<clipPath>`/`<marker>` with palette colors; ids are namespaced for you. No new `<filter>`.

## Type

- Sizes: 22 is the minimum (the card is ~380px wide on the site); labels 26–32; one hero word 40–64.
- Weights: 500 (default) and 700 only.
- Every character is 0.6 × font-size wide, so a 30-unit label of 12 characters is 216 wide. Size boxes from that.
- Keep labels to a few words. Code, URLs, file names, and parameters suit the monospace look best.
- `text-anchor="middle"` to center in a box; baseline ≈ box center + 0.36 × size.

## Building blocks

Copy and adapt (coordinates are examples):

```svg
<!-- Panel / node -->
<rect x="150" y="120" width="300" height="96" rx="18" fill="#152a49" stroke="#223a5e" stroke-width="3"/>
<text x="300" y="178" font-size="30" font-weight="700" fill="#e8ecf4" text-anchor="middle">Googlebot</text>

<!-- Floating window with shadow -->
<rect x="200" y="150" width="800" height="600" rx="24" fill="#050d1a" fill-opacity=".55" filter="url(#shadow)"/>
<rect x="200" y="128" width="800" height="600" rx="24" fill="#152a49" stroke="#223a5e" stroke-width="3"/>

<!-- Pill bar (a stand-in for a line of text) -->
<rect x="240" y="300" width="420" height="14" rx="7" fill="#33547e"/>

<!-- Connector, context and story -->
<path d="M300 216 V300 Q300 330 330 330 H380" fill="none" stroke="#33547e" stroke-width="6" stroke-linecap="round"/>
<path d="M720 490 H760" fill="none" stroke="#ff4d00" stroke-width="7" stroke-linecap="round"/>

<!-- Dashed "what didn't happen" -->
<rect x="760" y="290" width="300" height="80" rx="16" fill="none" stroke="#33547e" stroke-width="3" stroke-dasharray="10 10"/>

<!-- The story detail: glow, tinted fill, orange stroke, orange label -->
<circle cx="910" cy="490" r="200" fill="url(#glow)"/>
<rect x="760" y="440" width="300" height="100" rx="18" fill="#ff4d00" fill-opacity=".14" stroke="#ff4d00" stroke-width="4"/>
<text x="910" y="501" font-size="32" font-weight="700" fill="#ff4d00" text-anchor="middle">noindex</text>

<!-- Orange callout (text on orange) -->
<rect x="700" y="560" width="300" height="58" rx="12" fill="#ff4d00"/>
<text x="722" y="598" font-size="24" font-weight="700" fill="#1a0a02">blocked, not hidden</text>

<!-- The brand's block cursor after a word -->
<rect x="644" y="318" width="15" height="31" rx="2" fill="#ff4d00"/>

<!-- A highlighted dot on a line -->
<circle cx="980" cy="210" r="26" fill="#ff4d00" fill-opacity=".22"/>
<circle cx="980" cy="210" r="13" fill="#ff4d00"/>
```

## Composition rules

- **One story, one orange.** The orange (with its glow) marks the single detail the post explains. A ring and its dot, or a box and its label, count as one detail. Everything else is navy/gray context.
- **Show the mechanism, not the topic.** "A redirect chain with the extra hop in orange" beats "a globe with arrows". Literal interface pieces (windows, fields, rows, code, nodes) fit the site better than metaphors or icons.
- **Off-center is fine**, but keep the detail inside the safe area and set `focus` on it.
- **Contrast through value, not color:** fg on panel for what matters, dim/muted for the rest.
- **No title, no logos, no invented data.** Illustrative labels are fine; numbers must come from the post.
- **Restraint:** if it looks busy at card size, remove shapes until it doesn't.
