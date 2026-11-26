# Components Library

This folder contains the reusable Astro UI components for the site.

## How to use this library
- Check this file first before creating a new shared component.
- Reuse an existing component whenever possible.
- If a component already exists but needs a new variant, extend it carefully rather than creating a duplicate.
- Add new components here and also show them on the components showcase page at `src/pages/components.astro`.

## Writing posts with components (MDX)
Plain `.md` posts can't contain components. A post that embeds components is a `.mdx` file in `src/content/blog/`, with the same front matter as any other post. Import components at the top, below the front matter:

```mdx
import Callout from '../../components/Callout.astro';

<Callout type="tip">
Markdown works **inside** components.
</Callout>
```

Leave a blank line between a component tag and the markdown inside it, as in the `Steps` example below.

Front matter options handled by the post template (`src/pages/blog/[slug].astro`), so they need no import:
- `faq`: a list of `{ question, answer }` (answers may contain simple HTML). Renders `FAQAccordion` at the end of the post and adds matching FAQPage schema.
- `series` + `seriesOrder`: renders `PostSeriesNav` at the end of the post.

## Current components

### AuthorBox
Purpose: Reusable author profile summary block.
Location: `src/components/AuthorBox.astro`
Notes:
- Accepts no props.
- Uses author data from `src/data/author.ts`.
- The bio takes the free width; on narrow cards the button wraps below it. The photo has empty alt text because the name is printed beside it.

### BlogCard
Purpose: Compact blog post teaser card.
Location: `src/components/BlogCard.astro`
Notes:
- Props: `post`, `variant?: default | featured`, `headingLevel?: h2 | h3` (default `h3`).
- Shows the post's generated `PostCover` with its topic label, the title, a three-line excerpt, the date, and reading time. Cards never show `featured_image`.
- The whole card is clickable: the title link stretches over the card. Don't add other links inside the card body; they'd sit under the stretched link.
- `featured` sits side by side (cover left, text right) when the card is at least 44rem wide, and stacks like a normal card otherwise. Use it to lead the blog index.

### ChartTypeAssessment
Purpose: Showcase of chart types and usage guidance for the SEO visualization post.
Location: `src/components/ChartTypeAssessment.astro`
Notes:
- Reusable as a visual library component.
- Designed to be embedded in content or showcased on the components page.
- Rendered on the SEO data visualization guide by the post template.

### ChartPickerQuiz
Purpose: Interactive chart-selection quiz for content-driven posts.
Location: `src/components/ChartPickerQuiz.astro`
Notes:
- Supports a three-question decision flow for relationship, scale, and audience.
- Reusable anywhere a guided recommendation tool is needed.

### DataStoryBestPractices
Purpose: Shared card-based storytelling guidance module.
Location: `src/components/DataStoryBestPractices.astro`
Notes:
- Accepts an optional `items` prop for custom content.
- Designed for best-practice callouts in posts and landing pages.

### FAQAccordion
Purpose: Reusable FAQ accordion for post-level or site-wide Q&A sections.
Location: `src/components/FAQAccordion.astro`
Notes:
- Accepts an `items` prop with `question` and `answer` fields.
- Optional `title`, `eyebrow`, and `lede` props set the heading text (defaults keep the data-viz guide wording). `layout="split"` puts the heading beside the questions on wide screens (built on `Section`).
- A round +/− toggle marks each question. Answers slide open in browsers that can animate to `height: auto` and open instantly elsewhere.
- Uses native `<details>/<summary>` for accessible, theme-consistent expansion.
- On blog posts, prefer the `faq` front matter field: the template renders this component and the FAQPage schema from the same items.

### CallToAction
Purpose: End-of-page call to action with a headline, one line of context, and one or two buttons.
Location: `src/components/CallToAction.astro`
Notes:
- Props: `title`, `primary: { href, label }`, optional `secondary`, `text`, `prompt` (short sentence-case line, default "Next step"), `price: { amount, unit }`, `note` (closing variant only; default "I usually reply within two business days."), `variant?: default | closing`, `headingLevel` (`h2` default or `h3`).
- `closing` is the page's last word: centered on graph paper (it bookends the hero), with Josh's photo, name, and `note` above a display-size headline. Use it once per page, as the final section. `default` is a navy panel for the end of a post or inside a section.
- The primary button carries the arrow (`jdb-btn--arrow`). Both buttons have `data-jdb-track` attributes for Tag Manager.
- Every page should end with a clear next step; use this instead of hand-building a CTA section.

### CodeBlock
Purpose: Styling wrapper for code snippets.
Location: `src/components/CodeBlock.astro`
Notes:
- Intended for code-heavy content blocks.
- Matches the component library’s terminal-window chrome, language label, and copy affordance.

### ContactForm
Purpose: Accessible, styled contact form for direct inquiries.
Location: `src/components/ContactForm.astro`
Notes:
- Requires an `action` prop for the form submission endpoint.
- Supports a `demo` prop that disables submission for component-library examples.
- Includes the Formcarry honeypot and reCAPTCHA response fields used by the contact page.
- Fields: `name`, `email`, `message`. Keep it short: every extra field lowers completion.
- Fields carry `autocomplete`/`inputmode` hints so browsers can fill them. The email is trimmed before submitting, invalid fields turn red only after the visitor has interacted with them (`:user-invalid`), and the button switches to "Sending…" and blocks double submits.

### TableOfContents
Purpose: Sticky sidebar table of contents for long-form posts.
Location: `src/components/TableOfContents.astro`
Notes:
- Expects an `items` prop containing heading objects with `id`, `text`, and `level`.
- Automatically highlights the current section as the page scrolls.
- On wide screens it's a quiet rail with no box, scrolling on its own if it's taller than the window; the section being read gets the orange rail mark. Below 64rem it becomes a collapsible box above the article, collapsed by default.

### Sidenote
Purpose: A margin note for long posts.
Location: `src/components/Sidenote.astro`
Notes:
- Props: `label?` (e.g. "Source", "Definition"); the note goes in the default slot (markdown works in MDX).
- In a post (`.jdb-prose--article`) on screens 90rem and wider, it floats into the empty margin right of the text, beside the paragraph it follows. Everywhere else it's an indented aside in the text flow.
- Use it for asides that would interrupt the sentence. Keep it to two or three sentences; longer asides belong in a `Callout`.

### QuickCompareMatrix
Purpose: Reusable qualitative comparison table for chart-selection and decision-support content.
Location: `src/components/QuickCompareMatrix.astro`
Notes:
- Expects optional `rows` and `title` props.
- Uses the shared `jdb-matrix` and `jdb-fitcheck` library styles.

### Section
Purpose: A page section with an optional header (eyebrow, title, lede) above or beside its content.
Location: `src/components/Section.astro`
Notes:
- Props: `title?`, `eyebrow?`, `lede?`, `layout?: stacked | split | center`, `tone?: page | band`, `width?: default | narrow`, `tight?`, `headingLevel?: h2 | h3`, `id?`, `class?`. Slots: default (content) and `actions` (a link or button under the header).
- Use it instead of hand-building `<section class="jdb-section">` plus `jdb-section__head` markup.
- `split` puts the header in a left column that stays in view while the content scrolls, once the section is at least 56rem wide (container query); it stacks below that. Use it to break up a run of stacked sections.
- `tone="band"` is the raised navy for alternating sections.

### Footer
Purpose: Site-wide footer with navigation and newsletter signup.
Location: `src/components/Footer.astro`
Notes:
- Shared across pages. The newsletter signup leads (`#newsletter`, the target of every "Subscribe by email" link), with the logotype, blurb, and social links beside it, then the link columns and the status bar.
- Keep social icons to one row.

### Hero
Purpose: Reusable hero section with intro, home, full-width, and split variants.
Location: `src/components/Hero.astro`
Notes:
- Props: `variant?: intro | home | full | split`, `backgroundImage?`, `imageSrc?`, `imageAlt?`, `containerWidth?`, `class?`. Slots: default (text) and `media`.
- Anything in the `media` slot (a `ChartFrame`, a `Portrait`) sits beside the text on wide screens and below it on narrow ones, on any variant. The home page puts a `TrendChart` there; About puts Josh's portrait.
- `home` is the display-size headline used once, on the home page, with the blinking cursor (`<span class="jdb-cursor">`).
- Supports an intro variant for compact page headings, with `containerWidth="narrow"` or `containerWidth="wide"`.
- Supports a full-width variant with optional `backgroundImage` (works on any variant). The overlay darkens the left side, so pick a darker image or one with a quiet left edge; text on a bright image won't meet contrast.
- Supports a split hero variant with text on the left and an image on the right via `variant="split"` and `imageSrc`. It stacks (text, then image) until the hero is at least 48rem wide; this is a container query, so it also stacks inside narrow wrappers.
- Use `jdb-hero__eyebrow` (a quiet sentence-case label, same style as `.jdb-eyebrow`), `jdb-hero__lede`, and `jdb-hero__actions` within the default slot for consistent content styling.

### Icon
Purpose: Inline SVG icons (social brands, calendar, clock, envelope) without a third-party icon script.
Location: `src/components/Icon.astro`
Notes:
- `<Icon name="github" />` renders a 1em-tall icon in `currentColor`, so it inherits text size and color.
- Decorative by default (`aria-hidden`). Pass `label` when the icon is the only content of a link or button and the parent has no `aria-label`.
- Available names: `linkedin-in`, `linkedin`, `github`, `instagram`, `threads`, `bluesky`, `x-twitter`, `calendar-days`, `clock`, `envelope`. To add one, copy its path data and viewBox from Font Awesome Free (`@fortawesome/free-*-svg-icons`) into the map in the component.

### Image
Purpose: Shared image wrapper with consistent loading attributes.
Location: `src/components/Image.astro`
Notes:
- Use this instead of raw `<img>` tags where consistent handling is needed.

### Logotype
Purpose: The `(jdegbau)=>{}` text logo — the only place the brand mark's markup and styles are defined.
Location: `src/components/Logotype.astro`
Notes:
- Always render `<Logotype />` for the logo. Don't hand-write the `<em>(</em><b>jdegbau</b>…` markup or restyle `.jdb-logo` elsewhere; that duplication is how the header and footer drifted apart (different weights) before this component existed.
- Brand spec it enforces: JetBrains Mono at weight 500 throughout; parentheses and braces in `--jdb-navy-600`; the word in `--jdb-fg`; the arrow in `--jdb-orange-400` (orange *text* tone, not the `#ff4d00` fill colour). The logotype is the one place mono appears outside code, which is what makes it read as a signature.
- Props: `href` (default `/`; pass `null` for an unlinked mark, which then gets `role="img"`), `size` (`sm` | `md` | `lg` | `xl`, default `md` = 1.05rem as used in the header/footer), `cursor` (blinking block cursor between the braces, default `true`), `theme` (`dark` | `light`), `label` (link's accessible name), `class`.
- The cursor stops blinking under `prefers-reduced-motion`. When printed, the logo switches to the light colours and drops the cursor.
- Used by `Navigation` (header and mobile drawer) and `Footer`.

### Logos
Purpose: Row of client logos.
Location: `src/components/Logos.astro`
Notes:
- Props: optional `logos` (array of `{ src, alt, width, height, weight? }`; defaults to the site's client logos), `label` (accessible list label), and `caption` (visible line above; pass `''` to hide).
- Logos are one-color white silhouettes in `public/assets/img/logos/mono/`, made from the full-color files by `node scripts/mono-logos.mjs`. Add a new logo by adding its source file and a step to that script. Don't show full-color client logos; four brand colors in a row compete with the page.
- Each logo is sized to the same visual area, not the same height, so wide wordmarks and compact marks look equally weighted. `weight` (default 1) gives a logo with thin, small lettering a bit more room.
- Shows a single row on wide containers. When the container is too narrow to fit every logo on one line (≤ 46rem, via a container query), it becomes an auto-scrolling marquee that pauses on hover/focus. With `prefers-reduced-motion`, it becomes a swipeable horizontal row instead.

### TrendChart
Purpose: A line chart with one annotated event, drawn in SVG with no chart library.
Location: `src/components/TrendChart.astro`
Notes:
- Props: `values` (oldest first), `label` (required text alternative stating the point), `event?: { index, label }`, `valueLabel?` (e.g. "+65%"), `startLabel?`, `endLabel?`, `animate?` (default true), `class?`.
- Gray before the event, orange after it: the story is the change. Labels are HTML over the SVG, so they stay readable at any width.
- Draws itself in once when it scrolls into view; under `prefers-reduced-motion` it just appears. Without JavaScript it draws on load.
- Wrap it in `ChartFrame`. For interactive or non-line charts, use `ChartPlayground`.

### ChartFrame
Purpose: The standard wrapper for every chart: takeaway title, explanation, chart, source, data table.
Location: `src/components/ChartFrame.astro`
Notes:
- Props: `title` (the takeaway as a sentence), `dek?` (what's plotted: measure, unit, period), `source?`, `table?: { columns, rows }` (adds a "View the data" disclosure), `titleAs?: p | h2 | h3 | h4` (use `h3` in posts), `surface?: card | plain`, `class?`.
- Write titles as findings ("Clicks rose 65% after the refresh"), not labels ("Clicks by week").
- Illustrative or sample data must say so in `source`.

### FeatureList
Purpose: A short list of services, principles, or deliverables.
Location: `src/components/FeatureList.astro`
Notes:
- Props: `items: { title, text, glyph?, href? }[]`, `columns?: 2 | 3 | 4`, `headingLevel?`, `class?`.
- Items sit on a hairline, not in boxes (they aren't clickable unless given `href`). Each gets its `ChartGlyph`, or a two-digit number when there's no glyph.
- Services use the same glyph as their blog topic: content `hierarchy`, data visualization `compare`, measurement `trend`, SEO `search`.

### Testimonial + TestimonialGroup
Purpose: Client quotes.
Location: `src/components/Testimonial.astro`, `src/components/TestimonialGroup.astro`, data in `src/data/testimonials.ts`
Notes:
- `Testimonial` props: `quote`, `name`, `role?`, `photo?` (square; initials are shown without one), `class?`.
- `TestimonialGroup` props: `items`, `title?`, `eyebrow?`, `tone?`. It renders nothing while `items` is empty, so the home page and SEO Helpline page already include it and it appears as soon as `src/data/testimonials.ts` has entries.
- Real quotes only, with permission, worded as the person said them. Never invent or paraphrase one.

### StatRow
Purpose: A row of proof-point numbers.
Location: `src/components/StatRow.astro`
Notes:
- Props: `items: { value, unit?, label, note? }[]`, `class?`. `note` is the source or period.
- Only confirmed numbers. An unknown value stays visibly unknown (`[N]`) until it's confirmed; don't ship a placeholder to a live page.

### CaseStudyCard
Purpose: A short case study: problem, what was done, result, and one headline number.
Location: `src/components/CaseStudyCard.astro`
Notes:
- Props: `title`, `client?`, `problem`, `approach`, `result`, `metric?: { value, label }`, `glyph?`, `href?`, `headingLevel?`, `class?`.
- With `href`, the whole card links to the full write-up (stretched title link) and lifts on hover.
- Real engagements only. Describe the client generically ("B2B manufacturer") unless you have permission to name them.

### BookingEmbed
Purpose: The TidyCal booking calendar, with graceful loading.
Location: `src/components/BookingEmbed.astro`
Notes:
- Props: `path` (TidyCal path, e.g. `jdegbau/seo-helpline-consultation`), `linkLabel?`, `demo?` (placeholder only, no TidyCal script).
- A calendar-shaped placeholder holds the space until the calendar appears. If it hasn't after 8 seconds, the message says so and the direct booking link is emphasized. The direct link is always shown below, and a no-JavaScript fallback links to TidyCal.

### ChartGlyph
Purpose: Small chart symbols used as the icon set for topics and services.
Location: `src/components/ChartGlyph.astro`
Notes:
- Props: `name` (`trend`, `compare`, `search`, `hierarchy`, `code`, `measure`, `flow`, `part`, `scatter`), `size?` (px, default 24), `label?`, `class?`.
- Context lines use the current text color; one mark is orange, following the chart rule "orange for the story, gray for context". They match the chart types drawn on `PostCover`.
- Decorative by default. Pass `label` when the glyph is the only thing conveying its meaning.

### PostCover
Purpose: Generated cover art for posts, in the brand's chart style: a scene filled with details from the post, or a chart for posts about data.
Location: `src/components/PostCover.astro`; scenes in `src/lib/cover-scenes.mjs`, charts and cover choice in `src/lib/cover-art.mjs`
Notes:
- Props: `seed` (usually the post slug), `cover?` (a scene object, usually `post.cover`), `kind?`/`data?` (shorthand for a chart cover), `label?` (topic shown as a small chip), `ratio?: 16/9 | 21/9 | 4/3 | 1/1`, `class?`.
- `BlogCard`, the article header (when the post has no `featured_image`), and the social share images (`src/lib/og-cards.mjs`) all draw from the same function, so a post looks the same everywhere.
- Covers are the only images on post cards. Don't put photos, stock art, or AI images on cards.
- See "Post covers" below for how to make one.

#### Post covers
Every cover keeps one look: navy panels on graph paper, one orange mark with a soft glow for the story, JetBrains Mono for any text, a fade at the bottom. What changes per post is the scene and the details in it, taken from the post itself.

**1. Pick the scene that shows what the post is about** (not just its topic):

| Scene | Use it for | Fields (all text drawn large; keep it short) |
|---|---|---|
| `browser` | A URL or page: parameters, redirects, canonicals, what the address bar shows | `url`, `highlight` (part of the URL in orange), `bookmarks` + `bookmark` (a bookmarks bar, one in orange), `body: page \| serp`, `note` |
| `serp` | A Google search: a query, a ranking, SERP features, People Also Ask | `query`, `questions` (up to 5), `label` (default "People also ask"), `highlight` (index, from 0), `note` |
| `editor` | Code from the post: snippets, scripts, tracking, config | `file`, `lines` (up to 10, about 48 characters fit), `start` (first line number), `highlight` (line number, from 1), `note` |
| `timeline` | Events over time: sessions, hits, crawls, a cutoff | `ticks` (axis labels), `marker` (label on the orange line), `marker_at` (0.15–0.85) |
| `document` | Articles, outlines, briefs, content strategy | `file`, `title`, `headings` (up to 7), `highlight` (index, from 0), `note` |
| `checklist` | Steps, audits, requirements | `title`, `items` (up to 6), `highlight` (index, from 0; items before it show as done), `note` |
| `chart` | Posts about data, or with a real chart in them | `kind` (one of the 14 charts below), `data` (3–24 real numbers) |

**2. Fill it with the post's own specifics**: the actual parameter, query, code line, question, or time the post is about. The orange mark goes on the one detail the post explains. `note` (up to 40 characters) is an orange callout pointing at it; use it for the post's answer in a few words ("added by Google, not indexed"), not for the title.

**3. Write it in the front matter**, for example:

```yaml
cover:
  scene: browser
  url: example.com/products/?srsltid=AfmBOoqSE-AmgwEVDycwF0ws
  highlight: srsltid
  note: added by Google, not indexed
```

**4. Preview it**: `npm run covers -- <part of the slug>` writes the card (16:9) and header (4:3) to `cover-previews/` and refreshes the share images in `public/assets/img/og/`. Check that the orange detail is readable on the card, nothing important is cut with "…", and it doesn't look like the cover next to it on `/blog/`.

Rules:
- Use `example.com` (or the post's own example domain) in URLs, not a real company's site, unless the post is about that site.
- Don't invent results or numbers. Questions and queries can be illustrative; chart `data` must come from the post.
- Don't repeat the title on the cover; the card already shows it.
- The schema in `src/content.config.ts` checks every field, so a typo fails the build with the post and field named.

**Defaults.** A post without `cover` gets its topic's scene (`TOPICS` in `cover-art.mjs`): SEO posts a search for their title, content posts an outline with their title, dev posts an editor, data viz and measurement posts a chart. Chart covers without a `kind` take the topic's charts in turn, oldest first, skipping the chart the previous chart post used, so neighbors don't repeat and new posts never change older covers. Made-up data is seeded from the slug; `cover_seed: anything` redraws it. `cover: funnel` (a bare chart name) and `cover_data` still work as shorthand for a chart cover.

**Charts.** 14 types, each suited to a kind of story (`KIND_USES` in `cover-art.mjs`): `trend`, `compare`, `search`, `hierarchy`, `code`, `measure`, `flow`, `part`, `scatter`, `funnel`, `heatmap`, `slope`, `dumbbell`, `histogram`. `/components/` shows every cover in use, every scene, and every chart.

### Portrait
Purpose: Josh's photo (or another photo prepared the same way) with the site's photo treatment.
Location: `src/components/Portrait.astro`
Notes:
- Props: `crop?: portrait | avatar`, `photo?` (a `{ base, widths, width, height }` source for a different photo), `alt?`, `shape?: rect | circle`, `treatment?: graded | natural`, `sizes?`, `caption?`, `loading?`, `class?`.
- Serves AVIF and WebP with a JPEG fallback from `public/assets/img/josh/`. The crops and sizes are listed in `src/data/author.ts` (`photo`).
- `graded` (default) is slightly cooler and calmer with a navy shade at the bottom, so the photo sits in the dark page. Use it for every photo so they read as one set.
- Pass `alt=""` when the name is printed right beside the photo.

### Navigation
Purpose: Site-wide header and mobile menu.
Location: `src/components/Navigation.astro`
Notes:
- Shared across pages; `BaseLayout` renders it with `<Search />` in its default slot (Search appears once).
- Desktop (64rem and up): the logotype on the left; the page links, a hairline, search, and two call-to-action buttons grouped on the right. The current page gets the brand's orange cursor bar under its label.
- Both of the site's next steps are buttons in the header, on purpose: the SEO Helpline as an outline button, then Contact (labeled "Work with me") last as the standard primary button (orange, navy text, arrow). Keep the plain link list to three items. The order is About, Blog, GTM Templates, then SEO Helpline and Contact.
- External links open in a new tab and show an external-link icon plus screen-reader text.
- The header sits flat on the page at the top and gains a glass surface, hairline, and shadow once the page scrolls. Its height never changes, so anything pinned under it (the post share bar, the table of contents) can use `--jdb-header-h`.
- Mobile: a search icon and a menu button (two bars that cross into an X). The menu is full screen under the header: large links on graph paper, the current page marked with the logotype's block cursor, and the SEO Helpline and Contact as full-width buttons at the bottom with the email address under it.
- While the menu is open the page behind it is `inert` and doesn't scroll; Escape closes it and returns focus to the menu button, and it closes itself if the window grows to the desktop layout.

### PostMeta
Purpose: Slim share and progress bar for long posts.
Location: `src/components/PostMeta.astro`
Notes:
- Props: `title`, `url` (absolute).
- Hidden until the reader scrolls past the element marked `data-article-header` (`ArticleHeader`), then slides in under the site header with the post title, share links (X, LinkedIn, email, copy link), and the reading-progress bar (`#progress-bar`, driven by `progress-bar.min.js`, growing from the center).
- Dates and reading time live in `ArticleHeader`, so they aren't repeated here.

### ArticleHeader
Purpose: The top of a blog post.
Location: `src/components/ArticleHeader.astro`
Notes:
- Props: `post`.
- Breadcrumbs, topic chip, title, the excerpt as a subtitle, a byline (photo, name linking to About, published and updated dates, reading time), and the post's `PostCover`, on the hero's graph paper. Marked `data-article-header` so `PostMeta` knows when to appear.
- The header image is the post's `featured_image` when it has one (with the graded photo treatment, cropped to 4:3, alt text from `featured_image_alt`), otherwise its generated cover. Use `featured_image` sparingly, for an image that belongs to the post, like the dog-at-the-dashboards illustration on the data viz guide. Cards always show the cover.

### SEO
Purpose: Shared SEO metadata component.
Location: `src/components/SEO.astro`
Notes:
- Used in layout wrappers for page metadata.
- `noindex` adds `<meta name="robots" content="noindex">` and omits the canonical link, `og:url`, and default JSON-LD schema (a custom `schema` prop is still emitted).

### Search
Purpose: Site-wide search trigger and modal panel.
Location: `src/components/Search.astro`
Notes:
- Shared across pages.
- Opens with `/` or Ctrl/⌘+K, closes with Escape or a click outside. The `/` hint is hidden on touch devices.
- The trigger looks like a search field on desktop ("Search guides" with the `/` key) and is an icon button on phones. Results open in a popover under it, like an editor's command palette.
- The index (`/search.json`: title, excerpt, tags) is prefetched when someone hovers, focuses, or touches the trigger.
- Matching ignores case, accents, and punctuation; every word must appear in the title, excerpt, or tags, and title matches rank first. Matches are highlighted, a result count is shown, and the three newest posts are suggested before anything is typed.
- Arrow keys move between results; Enter in the field opens the top result.

### SummaryCard
Purpose: At-a-glance summary block: title, one-line definition, and labeled rows.
Location: `src/components/SummaryCard.astro`
Notes:
- Props: `title`, `definition?`, `eyebrow?` (default `tl;dr`), `items?: { label, value, tone? }[]`.
- `tone` is `good | warn | bad | neutral` and colors the row with the status tokens. `value` accepts simple HTML.
- Optional default slot (a mini chart, image) sits beside the text when there's room and stacks below it when there isn't.
- Examples: Use it when / Avoid it when / Best alternative; Pros / Cons / Verdict.

### Callout
Purpose: Aside for tips, warnings, notes, and "why this works" insights.
Location: `src/components/Callout.astro`
Notes:
- Props: `type?: insight | tip | warning | note` (default `note`), `title?`.
- Wraps the existing `.jdb-callout` styles in `main.css` (section 22): insight uses the default orange box, tip uses `--tip`, warning uses `--warn`, note uses `--quiet`.
- Body is the default slot; markdown works inside it in MDX.

### Steps
Purpose: Numbered how-to steps on a connecting rail.
Location: `src/components/Steps.astro`
Notes:
- `layout="row"` puts short steps side by side, with the rail running across, once the container is at least 52rem wide. Use it for three to five short steps; long steps read better in the default column.
- Wrap a normal ordered list (a markdown `1.` list in MDX). A bold phrase at the start of an item reads as the step title.
- Optional `label` names the group for screen readers.
- Images inside items get spacing and rounded corners.

```mdx
<Steps label="How to read a Sankey chart">

1. **Start at the left.** Each node is a starting group.
2. **Follow the widest band.** Width is quantity.

</Steps>
```

### Tabs + TabPanel
Purpose: Accessible tabbed content (instructions per tool, code in several languages).
Location: `src/components/Tabs.astro`, `src/components/TabPanel.astro`
Notes:
- `<Tabs label="Build it in" group="build-tool">` wraps `<TabPanel label="Excel">…</TabPanel>` children.
- Without JavaScript the panels stack under their labels. With it, an ARIA tablist is built (arrow keys, Home, End).
- Tab groups that share a `group` switch together, and the choice is remembered in `localStorage` (safe if storage is blocked).
- CSS classes use the `jdb-tabset` prefix; `jdb-tabs` belongs to the header navigation.

### BeforeAfter
Purpose: Before/after comparison of any two visuals, with a "What changed" caption.
Location: `src/components/BeforeAfter.astro`
Notes:
- Images: `before` / `after` props as `{ src, alt, width?, height? }`. Other content (charts, code): the `before` and `after` named slots.
- `beforeLabel` / `afterLabel` default to Before / After. `caption` explains the change.
- `layout="slider"` (images only) overlays the two images with a draggable, keyboard-accessible divider. It falls back to side by side without JavaScript. Use two images of the same size.
- Side by side when each pane gets about 16rem, stacked otherwise.

### AnnotatedFigure
Purpose: Figure with numbered callout markers and a matching numbered legend.
Location: `src/components/AnnotatedFigure.astro`
Notes:
- Props: `src` + `alt` (alt is required when `src` is set), or a default slot for inline SVG; `callouts: { x, y, title, text? }[]`; `title?` (the takeaway); `caption?` (one line on what's shown); `source?`.
- Renders inside `ChartFrame`.
- `x` and `y` are percentages from the visual's top-left corner. The legend carries the meaning, so markers are decorative for screen readers.
- Use for chart anatomy, UI teardowns, annotated screenshots.

### DownloadCard
Purpose: Card offering one or more downloads (cheat sheets, datasets, templates).
Location: `src/components/DownloadCard.astro`
Notes:
- Props: `title`, `description?`, `files: { label, href, format, size? }[]`. The first file gets the primary button.
- Local files go in `public/assets/downloads/` and get the `download` attribute. External links (e.g. a Google Sheets copy link) open in a new tab.

### VideoEmbed
Purpose: Privacy-friendly, click-to-load YouTube embed with VideoObject schema.
Location: `src/components/VideoEmbed.astro`
Notes:
- Props: `youtubeId`, `title`, `description`, `uploadDate` (ISO date), `duration?` (ISO 8601, e.g. `PT8M30S`), `chapters?: { start, title }[]` (start in seconds).
- Shows the thumbnail until clicked, then loads a `youtube-nocookie.com` iframe. Chapter buttons start playback at that time.
- Emits its own VideoObject JSON-LD, with chapters as `Clip` parts.

### PostSeriesNav
Purpose: Previous/next links and the numbered list of parts for a multi-part series.
Location: `src/components/PostSeriesNav.astro`
Notes:
- Props: `series`, `current` (slug of the post being viewed).
- Posts join a series with `series` + `seriesOrder` front matter. The post template renders this automatically.
- Renders nothing until two or more posts share the series.

### RelatedPosts
Purpose: Grid of related posts ranked by shared tags.
Location: `src/components/RelatedPosts.astro`
Notes:
- Props: `current?` (slug to exclude), `tags?` (defaults to the current post's tags), `limit?` (default 3), `title?` (default "Keep reading").
- Falls back to the newest posts when nothing matches. Renders `BlogCard`.

### ChartPlayground
Purpose: Live Chart.js chart with toggles that show what a design choice does. (Chart-specific.)
Location: `src/components/ChartPlayground.astro`, loader in `src/lib/chart-loader.ts`
Notes:
- Props: `id`, `type`, `data`, `options?`, `plugins?: ('sankey' | 'treemap')[]`, `controls?: { label, patch, checked? }[]`, `alt` (required text description), `title?` (the takeaway), `dek?` (what's plotted; `caption` still works as an older name), `source?`, `table?: { columns, rows }`, `height?` (px, default 360).
- Renders inside `ChartFrame`, so it shares the title, source line, and "View the data" table with every other chart.
- Each control is a checkbox; when it's on, its `patch` is deep-merged into the config (objects merge, arrays replace, so patch a whole `datasets` array).
- Config is plain JSON: no functions or scriptable options. Colors can be site tokens written as `"var(--jdb-orange-500)"`.
- Chart.js 4.6.1 and plugins load once per page from jsDelivr with SRI, lazily when the chart nears the viewport. The site's dark theme defaults are applied, and animation is off for `prefers-reduced-motion`.
- To upgrade a library, edit the pinned URL and hash in `src/lib/chart-loader.ts` (instructions are in the file).
- `table` adds a "View the data" panel for screen readers, and as a fallback if the chart can't load.

## Measuring the redesign (Tag Manager hooks)
The main conversion points carry a `data-jdb-track` attribute naming the action, so one Tag Manager trigger can measure all of them before and after design changes:
- `hero-primary`, `hero-secondary`, `about-primary` (page hero buttons)
- `cta-primary`, `cta-secondary` (every `CallToAction`)
- `nav-contact`, `nav-helpline` (the Contact and SEO Helpline buttons in the header and mobile menu)
- `helpline-choose-time`, `helpline-ask-first`, `booking-direct` (SEO Helpline page)
- `newsletter` (the footer signup form)
- `share-x`, `share-linkedin`, `share-email`, `share-copy` (post share bar)

In Tag Manager: add a Custom JavaScript variable that returns `{{Click Element}}.closest('[data-jdb-track]')?.dataset.jdbTrack`, a Click (All Elements) trigger where that variable is not undefined, and a GA4 event tag (e.g. `cta_click` with parameter `cta` = the variable). Use a Form Submission trigger on `[data-jdb-track="newsletter"]` for signups. Give new conversion points a `data-jdb-track` name in the same style.

## Post body styles
Post bodies get `jdb-prose jdb-prose--article` (in `src/pages/blog/[slug].astro`): 18px text at a 68ch measure, a larger first paragraph, a hairline and extra space above each H2 written in the post, and styled markdown tables, figures, and lists (`main.css` section 37).

Older posts contain raw HTML from the site's previous CSS framework (`columns`, `card`, `notification`, `is-size-7`, `has-text-grey`, …). `main.css` section 38 maps that markup onto the current design so those posts match. Don't use those classes in new posts; use `ChartFrame`, `Callout`, and the other components instead.

## Brand and type
The visual rules live in the tokens at the top of `public/assets/css/main.css`; the components page shows them.
- **Two faces, two jobs.** Schibsted Grotesk (`--jdb-font-sans`) sets everything people read: headlines, UI, body. JetBrains Mono (`--jdb-font-mono`) is only for what is literally code: the logotype, code samples, `kbd`. Don't set labels, dates, or buttons in mono.
- **Headlines carry the page.** Large, heavy, tightly tracked (`--jdb-track-display` / `--jdb-track-heading`). Heading sizes are fluid between a phone size and a desktop size.
- **Graph paper is the one texture.** It appears behind heroes (`--jdb-grid-line`, `--jdb-grid-size`, under a soft orange wash, `--jdb-hero-wash`), on generated post covers, and behind the closing call to action, which bookends the hero. Don't add other washes or textures.
- **Images: covers, charts, and one photo treatment.** Post cards use generated `PostCover` art, never photos. Photos use the `graded` treatment (`Portrait`, article header images, the 404 clip). Client logos are one color (`Logos`).
- **Bailey is part of the site.** Josh's dog appears in his portrait, the data viz guide's header, the 404 page clip, and the footer status bar ("supervised by Bailey", linking to `/about/#bailey`). Keep the cameos small and occasional.
- **Orange is a signal.** The brand orange marks the main action and the current location (the active nav item, the cursor in the logotype and home headline). Don't use it for decoration.
- **Labels are plain.** Eyebrows are short, sentence-case, and only used where the heading alone would be ambiguous. No `//`, `#`, or `$` prefixes, no all caps.
- **Fewer boxes.** Use a hairline rule and spacing to group content; reserve filled cards for things that are clickable or need their own region.
- **Motion is quiet and purposeful.** One easing curve (`--jdb-ease`) and three durations. The only motion: the logotype and home-hero cursor blink, charts drawing their line in once (`TrendChart`), a short crossfade between pages (cross-document view transitions), the post share bar sliding in, and hover/press feedback on things you can click. All of it is off under `prefers-reduced-motion`.

## Interaction guidelines (UX principles)
These rules come from established UX research (the "Laws of UX" collection at lawsofux.com). They shape the components; **don't name them in site copy**, just follow them.

- **Big, close targets (Fitts's Law).** Anything clicked or tapped on its own is at least `--jdb-target` (44px). Make whole cards clickable instead of tiny links inside them.
- **Fewer, clearer choices (Hick's Law, Choice Overload).** One primary button per view, at most one secondary. Keep the main nav to five items.
- **Follow conventions (Jakob's Law).** The logo goes home, `/` and Ctrl/⌘+K open search, Escape closes overlays, external links are marked, visited links in prose look visited, and posts show breadcrumbs.
- **Respond fast (Doherty Threshold).** Give feedback in under 400ms: press states on buttons, "Sending…" on submit, data prefetched on intent.
- **Hover means clickable (Similarity, Uniform Connectedness).** Only links lift on hover (`--jdb-lift`). Static cards and non-link tags don't react.
- **Group by proximity and region (Proximity, Common Region).** Use the spacing scale: tight inside a group, larger between groups, and a card or section surface for content that belongs together.
- **Make the important thing stand out (Von Restorff).** Reserve orange fills and outlines for the main action.
- **End well (Peak-End Rule).** Confirmation, empty, and error states say what happens next and offer one next step.
- **Be forgiving with input (Postel's Law, Tesler's Law).** Use `autocomplete`/`inputmode`, trim whitespace, match search terms in any order, and only flag errors after interaction.
- **Chunk information (Miller's Law, Chunking).** Cap lists of results, use subheads every few paragraphs, and keep prose at about 68ch.
- **Respect reduced motion.** Decorative animation is disabled under `prefers-reduced-motion`.

## Content guidelines (Orbit Media approach)
The site follows Andy Crestodina and Orbit Media's approach to content and conversion (see *Content Chemistry* and the Orbit blog). Apply these when writing pages or posts.

**Every page**
- **Say what you do, for whom, in the header.** Use a descriptive headline, not a clever one. A visitor should get it in five seconds.
- **Answer questions, address objections, add evidence.** Answer what visitors want to know, cover their hesitations (FAQs work well), and back up claims with proof such as logos, specifics, and testimonials. Never invent proof.
- **End with one clear next step.** Use `CallToAction`. Primary action: the SEO Helpline or the contact form. Secondary: the newsletter or the blog.
- **Use descriptive labels.** Use labels like "SEO Helpline", not vague ones like "Solutions". Keep the main nav short with Contact last.
- **Make it scannable.** Write short paragraphs, use a meaningful subhead every few paragraphs, use bullets for lists, and bold sparingly.

**Blog posts**
- **Fit the content mission.** The blog is where marketers and analysts get practical guides on content strategy, data visualization, measurement, and SEO, so they can make better decisions and prove the value of their work. Skip topics that don't fit.
- **Target a real question.** Pick a topic with a clear search or audience need, put the key phrase in the title, H1, URL, and excerpt, and answer the question early.
- **Go deeper than what already ranks.** Add something new: original data or research, a framework, worked examples, visuals, or quotes from contributors (ally-based content).
- **Show the work.** Use charts, screenshots, and annotated figures (`ChartPlayground`, `AnnotatedFigure`, `BeforeAfter`). Every visual needs alt text.
- **Link internally.** Link to related posts. The template adds `RelatedPosts`, a subscribe prompt, and the author box automatically.
- **Promote every post.** Plan the email, social, and ally outreach (people quoted or mentioned) before you publish. Update and re-promote strong older posts rather than letting them decay. Set `updated` in the front matter when you do.

## The components page
`/components/` (noindex) is the live reference. It opens with the color, type, and spacing tokens (contrast ratios copied from the comments in `main.css`; update both together), then shows each component as an editor tab with its file, one sentence on what it's for, its props, and a live demo. A sidebar explorer groups components into folders and marks the one being read.

## Component creation checklist
When adding a new component:
1. Create the component in `src/components/`.
2. Add it to this README.
3. Add an example to `src/pages/components.astro`: wrap the demo in `<Spec name id what props>` (from `src/pages/_components/Spec.astro`) inside the right folder, and add the same `id` to the `explorer` list at the top of that file so it appears in the sidebar.
4. Reuse existing design tokens and class conventions.
5. Keep props explicit and minimal.
