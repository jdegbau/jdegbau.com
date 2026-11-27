---
name: custom-cover
description: Make a bespoke, on-brand cover for a jdegbau.com blog post that overrides the generated one, either drawn from a text description (a hand-made SVG) or converted from an image the user supplies (photo, screenshot, illustration). Use when asked for a custom, bespoke, or hand-made cover, to turn an image or screenshot into a cover, to "override" or "replace" a post's cover, or when no generated scene fits a post.
---

# Custom cover

A bespoke cover replaces a post's generated cover on its blog card, article header, and share image, and keeps the cover look: navy on graph paper, one orange detail with a soft glow, JetBrains Mono, a fade at the bottom. The site draws that frame; you supply either a hand-drawn SVG (`scene: custom`) or an image (`scene: image`). The build rejects off-brand art, so don't work around a check; fix the art.

## 0. Gather

1. Read the whole post (`src/content/blog/`). In one line, write what it is about and the single concrete detail the cover should show.
2. Read "Post covers" and "Bespoke covers" in `src/components/README.md`.
3. **Check a generated scene first.** If `browser`, `serp`, `editor`, `timeline`, `document`, `checklist`, or `chart` can show that detail, say so and offer the `post-cover` skill instead: generated scenes stay consistent for free. Go ahead with a bespoke cover when the user still wants one, or when none fits.
4. Pick the path:
   - The user gave an image, or the idea is a real thing (a photo, an interface, a product, a person) → **B. From an image**.
   - The user described an idea in words → **A. From a description**.
   - Both (an image plus words): use B, and put the words in `note`, `title`, or `mark` placement.

## A. From a description (`scene: custom`)

1. Read `reference/style.md` in this skill folder (canvas, palette, type sizes, building blocks) and look at `src/content/covers/demo-custom.svg`.
2. Sketch the composition in one sentence before drawing: what the context shapes are (navy/gray), and what the one orange detail is. Aim for 3–7 shapes and at most about 8 short labels. It must read at blog-card size (about 380px wide), so use few words, drawn large.
3. Write the fragment to `src/content/covers/<slug>.svg` (no `<svg>` wrapper, no `font-family`; the cover adds both). Put `<circle … fill="url(#glow)"/>` behind the orange detail, first in the file so it sits underneath.
4. Add to the post's front matter, with `focus` on the orange detail as fractions of the canvas:
   ```yaml
   cover:
     scene: custom
     focus: [0.76, 0.73]
   ```
   Add `frame: true` (and an optional `title`, the window's tab text) to draw inside the standard window panel, like the generated scenes. Add `art: <file name>` only if the file isn't named after the slug.
5. Go to **C. Check it**.

## B. From an image (`scene: image`)

1. Get the image as a file. If the user gave a path or URL, use it (download a URL into a new folder in the scratchpad, not the repo). If the image is only pasted into the conversation, there may be no file to read: ask the user to attach it as a file or give its path (e.g. `~/Downloads/x.png`) before going on. Look at it (Read the file) so you know what's in it.
2. Make sure it may be used: it should be the user's own (their screenshot, photo, or illustration) or something they confirm they can publish. No stock watermarks, no other brands' logos as the subject unless the post is about them, and no private data visible in a screenshot (emails, client names, account IDs): if you see any, point it out and crop it out with `--focus`/`--zoom` or ask.
3. Choose the focus: the point in the image (fractions, 0,0 top left) of the detail the post is about. Then prepare it:
   ```sh
   npm run cover-image -- <file> <slug> --focus 0.62,0.40        # add --zoom 1.5 to crop tighter
   ```
   This writes `public/assets/img/covers/<slug>.jpg` (16:9, 1600×900, metadata stripped) and prints the front matter with the focus mapped into the crop. Don't edit colors in the file: the cover tones it.
4. Choose the settings:
   - `tone`: `duotone` (default) for photos and illustrations; `night` for light screenshots and UIs (flips white pages to navy, like dark mode); `graded` only when the photo's color matters, and only on darker photos.
   - `frame`: `bleed` (default) fills the cover; `window` puts it in the window panel, best for screenshots of a page or app (add `title` for the tab text).
   - `mark`: `ring` (default, faces and objects), `box` (a field, a row, a UI element), or `none` (only when the image already has one obvious subject). Size it with `mark_size: [w, h]` as fractions of the image, just larger than the detail.
   - `note`: up to 40 characters that state the post's answer, if it helps. Never the title.
   ```yaml
   cover:
     scene: image
     src: /assets/img/covers/<slug>.jpg
     tone: night
     frame: window
     focus: [0.75, 0.5]
     mark: box
     mark_size: [0.3, 0.12]
   ```
5. Go to **C. Check it**.

## C. Check it

1. Run `npm run covers -- <part of the slug>`. Fix every error; read every `⚠` warning and fix it unless there is a clear reason not to.
2. Look at all three renders (Read the PNGs):
   - `cover-previews/<slug>.card.png` (16:9 blog card): is the orange detail the first thing you see, and is every word readable when imagined at a third of the size?
   - `cover-previews/<slug>.header.png` (4:3 article header): nothing important cut off at the sides?
   - `public/assets/img/og/<slug>.png` (share image; the cover is cropped to a narrow panel around `focus`): is the detail in the panel?
3. Check the brand rules against what you see, not just the lint: one orange detail; everything else navy or gray; no title on the cover; no invented numbers, logos, or quotes; nothing that looks like a generated scene's neighbor on `/blog/` (compare with `/components/`, "Covers in use").
4. Revise and re-render until all of that holds (usually 1–3 rounds). If an image fights the look after trying the tones, say so and suggest a description-based cover instead.
5. Tell the user which path you took and why, show them the card preview, and list the files you added or changed (the post, `src/content/covers/<slug>.svg` or `public/assets/img/covers/<slug>.jpg`). To go back to the generated cover, delete the `cover:` block (and the file).

## Don't

- Don't use `featured_image` for this: it only changes the article header, never the card or share image.
- Don't put a raw, untoned image anywhere on a card, or bake a tone into the file.
- Don't add colors, fonts, filters, gradients, or `<image>` to a custom fragment; the lint lists what's allowed.
- Don't change `src/lib/cover-*.mjs` to make one cover work. If the system can't express something a cover needs, tell the user what's missing.
