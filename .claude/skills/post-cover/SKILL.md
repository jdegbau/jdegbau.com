---
name: post-cover
description: Make or update the generated cover image for a jdegbau.com blog post. Use when asked for a post cover, featured image, blog image, or thumbnail, when writing a new post, or when a cover doesn't fit its post.
---

# Post cover

Covers are drawn in code, not generated as images, so they always match the brand. Your job is to choose a scene and fill it with specifics from the post, in the post's `cover` front matter.

1. Read "Post covers" in `src/components/README.md`. It lists the scenes, their fields, and the rules.
2. Read the whole post. Write down what it is really about in one line, and the single concrete detail it explains: a URL parameter, a query, a code line, a question, a time, a step.
3. Pick the scene that shows that detail (a URL → `browser`; a search or SERP feature → `serp`; code → `editor`; something over time → `timeline`; structure or outline → `document`; steps → `checklist`; data → `chart`). Use `chart` only when the post is about data. If none of them can show it, or the user wants a hand-drawn cover or one made from their image, use the `custom-cover` skill instead.
4. Fill the fields with text from the post. Put the orange `highlight` on that detail. Add a `note` of at most 40 characters only if it states the post's answer in a few words. Use `example.com` instead of real third-party domains. Never make up numbers for `data`.
5. Add the `cover:` block to the post's front matter.
6. Run `npm run covers -- <part of the slug>` and look at `cover-previews/<slug>.card.png`, `<slug>.header.png`, and `public/assets/img/og/<slug>.png`. Fix anything cut off with "…" that matters, or text too small to read on the card (shorten it). Compare with the covers next to it on `/blog/` (shown on `/components/`) so neighbors don't look alike.
7. Tell the user which scene you chose and why, and show them the card preview.
