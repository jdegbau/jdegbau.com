/**
 * Side projects shown on /projects/ and /projects/<slug>/.
 *
 * Each entry drives both the card on the index and the project's own page
 * (src/pages/projects/[slug].astro). Screenshots live in
 * public/assets/img/projects/ and were taken from each project's own repo.
 * Keep claims to what the project actually does; no made-up usage numbers.
 */

export type ShotDevice = 'browser' | 'phone' | 'panel';

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
  device: ShotDevice;
  /** Shown in the browser frame's address bar. */
  url?: string;
  caption?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  name: string;
  /** Small label above the name: what kind of thing it is. */
  kind: string;
  /** One line: what it is and who it's for. Used on cards and as the lede. */
  tagline: string;
  /** Meta description for the project's page. */
  description: string;
  seoTitle: string;
  status: string;
  /** Year the project started (from its first commit). */
  since: number;
  stack: string[];
  /** The main call to action. */
  primary?: ProjectLink;
  /** `private`: the site exists but only its owner can sign in (grey badge, no "it's free" pitch). */
  access?: 'open' | 'private';
  secondary?: ProjectLink;
  /** Lead visual on the card and in the page header. */
  hero: Shot;
  /** Leave hero undefined and set `illustration` for an inline SVG instead of a screenshot. */
  illustration?: 'reading-log';
  /** Paragraphs under "What it is". Simple HTML allowed. */
  overview: string[];
  features: { title: string; text: string }[];
  gallery: Shot[];
  /** Paragraphs under "Why I built it" / "How it's built". */
  story: { heading: string; paragraphs: string[] }[];
  /** Rows in the at-a-glance card. Values may contain simple HTML. */
  facts: { label: string; value: string }[];
  /** schema.org applicationCategory, for SoftwareApplication markup. */
  schemaCategory: string;
  operatingSystem: string;
}

const CWS = 'https://chromewebstore.google.com/detail/seo-fetcher/jebfcaafldnmfgdbfdijbajhdmdapfnc';

export const projects: Project[] = [
  {
    slug: 'seo-fetcher',
    name: 'SEO Fetcher',
    kind: 'Chrome extension',
    tagline: 'An on-page SEO inspector for Chrome: indexability, snippets, issues, and AI crawler access for the page you’re on.',
    description: 'SEO Fetcher is a free Chrome extension that shows whether a page can be indexed, how it looks in search and when shared, what’s wrong with it, and how search and AI crawlers are treated.',
    seoTitle: 'SEO Fetcher: a free on-page SEO inspector for Chrome',
    status: 'On the Chrome Web Store',
    since: 2025,
    stack: ['JavaScript', 'Manifest V3', 'No build step'],
    primary: { label: 'Install from the Chrome Web Store', href: CWS },
    secondary: { label: 'View the code on GitHub', href: 'https://github.com/jdegbau/seo-fetcher' },
    hero: {
      src: '/assets/img/projects/seo-fetcher-issues.webp',
      alt: 'The SEO Fetcher panel on its Issues tab, listing one error, two warnings and several notices, each with a short explanation.',
      width: 800,
      height: 1500,
      device: 'panel',
    },
    overview: [
      'Open SEO Fetcher on any page and it answers the questions I ask on every audit: can this page be indexed, how will it look in Google and when someone shares it, what’s broken, and which search and AI crawlers are allowed in.',
      'Everything runs in your browser. There’s no account, no server, and no tracking.',
    ],
    features: [
      { title: 'Indexability at a glance', text: 'The toolbar icon shows I, N or C on every page (indexable, noindex, or canonicalised elsewhere), and the Data tab gives the reason: status code, robots directives, canonical, robots.txt.' },
      { title: 'Search and share previews', text: 'Desktop and mobile Google snippets cut where Google cuts them, with character and pixel meters, plus Facebook, LinkedIn and X share cards.' },
      { title: 'About 30 issue checks', text: 'Sorted errors first, each explained with the page’s own numbers. Mute a check for one site or everywhere.' },
      { title: 'Crawl and AI access', text: 'robots.txt rules for search engines, AI search, AI assistants and AI training crawlers, matched the way Google matches them, plus llms.txt and hreflang validation.' },
      { title: 'Links, images, headings', text: 'Counts and full lists with nofollow and generic anchors, alt text, image sizes and the LCP image. Both export to CSV.' },
      { title: 'Everyday tools', text: 'A JavaScript toggle, copy the page as Markdown, PageSpeed and Wayback quick links, saved RegEx for Search Console and GA4, and keyboard shortcuts.' },
    ],
    gallery: [
      { src: '/assets/img/projects/seo-fetcher-seo-data.webp', alt: 'The Data tab: an indexability verdict above a Google snippet preview and title and description meters.', width: 800, height: 1500, device: 'panel', caption: 'Data: the indexability verdict and snippet preview.' },
      { src: '/assets/img/projects/seo-fetcher-counts.webp', alt: 'The Counts tab with totals for links, images and headings.', width: 800, height: 1500, device: 'panel', caption: 'Counts: links, images and headings.' },
      { src: '/assets/img/projects/seo-fetcher-crawl-ai.webp', alt: 'The Crawl and AI tab listing which search and AI crawlers robots.txt allows.', width: 800, height: 1500, device: 'panel', caption: 'Crawl & AI: who robots.txt lets in.' },
      { src: '/assets/img/projects/seo-fetcher-quick-links.webp', alt: 'The Tools tab with quick links to PageSpeed Insights, the Wayback Machine and site: searches.', width: 800, height: 1500, device: 'panel', caption: 'Tools: quick links and copy actions.' },
    ],
    story: [
      {
        heading: 'Why I built it',
        paragraphs: [
          'I wanted the verdict first (can this page be indexed, and if not, why not) with the evidence one click away, in the same dark, code-editor look as the rest of my work.',
          'As search changed, so did the checks: robots.txt access for AI crawlers, llms.txt validation, and a comparison of the server’s HTML with what JavaScript renders.',
        ],
      },
      {
        heading: 'How it’s built',
        paragraphs: [
          'Plain JavaScript loaded directly by Chrome (Manifest V3), with no build step and no dependencies. The SEO rules (robots.txt matching, hreflang, canonicals, the issue checks) are pure functions with unit tests, separate from the browser code.',
          'It opens in Chrome’s side panel by default, or as a floating panel or toolbar popup, and works in other Chromium browsers.',
        ],
      },
    ],
    facts: [
      { label: 'What', value: 'Free Chrome extension for on-page SEO checks' },
      { label: 'For', value: 'SEOs, content editors and developers' },
      { label: 'Privacy', value: 'Runs locally; no account, server or tracking' },
      { label: 'Needs', value: 'Chrome 116+ or another Chromium browser' },
    ],
    schemaCategory: 'DeveloperApplication',
    operatingSystem: 'Chrome',
  },
  {
    slug: 'pseudoku',
    name: 'Pseudoku',
    kind: 'Daily puzzle',
    tagline: 'A daily logic puzzle: fill a 4×4 grid so every row and column matches its clue, in five guesses or fewer.',
    description: 'Pseudoku is a free daily logic puzzle. Fill a 4×4 grid with the numbers 1 to 9 so every row and column matches its clue. Five guesses, one new puzzle a day.',
    seoTitle: 'Pseudoku: a free daily 4×4 number logic puzzle',
    status: 'Live, new puzzle daily',
    since: 2024,
    stack: ['HTML', 'CSS', 'JavaScript modules', 'Canvas'],
    primary: { label: 'Play today’s puzzle', href: 'https://pseudoku.jdegbau.com/' },
    secondary: { label: 'View the code on GitHub', href: 'https://github.com/jdegbau/cryptogrid' },
    hero: {
      src: '/assets/img/projects/pseudoku-guess.webp',
      alt: 'A Pseudoku puzzle after two guesses: cells colored green for correct, yellow for close and red for wrong, with the clues for row 1 and column C shown above the grid.',
      width: 600,
      height: 1256,
      device: 'phone',
    },
    overview: [
      'Fill a 4×4 grid with the numbers 1 to 9 so every row and column matches its clue, like “Sum of numbers is 28” or “Sum of numbers is even.” A few cells are filled in for you.',
      'You get five guesses. Each one colors every cell: green if it’s right, yellow if it’s within 2, red if it’s further off. Everyone gets the same puzzle on the same day.',
    ],
    features: [
      { title: 'One puzzle a day', text: 'A new puzzle every midnight, Chicago time. Monday is the easiest and Sunday the hardest.' },
      { title: 'Exactly one answer', text: 'A solver checks every puzzle before it ships, so there’s always one solution and no guessing between two.' },
      { title: 'Hot-and-cold feedback', text: 'Correct, close or wrong on every cell, and the number pad remembers what you’ve already tried.' },
      { title: 'Spoiler-free sharing', text: 'Share your result as text or as a picture sized for stories and Instagram posts, colors only, no numbers.' },
      { title: 'Stats and streaks', text: 'Win rate, streaks and guess distribution, charted.' },
      { title: 'Comfortable to play', text: 'Light and dark themes, a high-contrast color set, and an option to hide the timer. Installs to your home screen.' },
    ],
    gallery: [
      { src: '/assets/img/projects/pseudoku-how-to-play.webp', alt: 'The How to play sheet: three numbered rules and a key for correct, close, wrong and given cells.', width: 600, height: 1256, device: 'phone', caption: 'The rules fit on one screen.' },
      { src: '/assets/img/projects/pseudoku-guess.webp', alt: 'A puzzle two guesses in, with green, yellow and red cells and three guesses left.', width: 600, height: 1256, device: 'phone', caption: 'Two guesses in: green is right, yellow is within 2.' },
    ],
    story: [
      {
        heading: 'Why I built it',
        paragraphs: [
          'Pseudoku pairs the color feedback of daily word games with number clues, on a grid small enough to play on a phone in a few minutes.',
        ],
      },
      {
        heading: 'How it’s built',
        paragraphs: [
          'Plain HTML, CSS and JavaScript modules with no build step or framework. A generator makes the puzzles, a solver proves each has exactly one solution, and puzzles are ranked by how much searching the solver needs so the hardest land on Sundays.',
          '1,092 puzzles (three years’ worth) run from 10 November 2026 to 5 November 2029. A multiple of seven keeps each puzzle on the same weekday when the list repeats. Unit tests and the uniqueness check run on every pull request.',
        ],
      },
    ],
    facts: [
      { label: 'What', value: 'Free daily number puzzle in the browser' },
      { label: 'Play time', value: 'A few minutes; five guesses' },
      { label: 'Difficulty', value: 'Easiest Monday, hardest Sunday' },
      { label: 'Puzzles', value: '1,092 unique puzzles through November 2029' },
    ],
    schemaCategory: 'GameApplication',
    operatingSystem: 'Any (web browser)',
  },
  {
    slug: 'the-longest-at-bat',
    name: 'The Longest At-Bat',
    kind: 'Baseball game',
    tagline: 'Can you beat Brandon Belt’s 21-pitch record? A pitch-by-pitch at-bat simulator built on 2025 MLB averages.',
    description: 'The Longest At-Bat is a free baseball game: try to beat the 21-pitch MLB record for the longest at-bat, one pitch at a time, with odds based on 2025 MLB averages.',
    seoTitle: 'The Longest At-Bat: can you beat the 21-pitch MLB record?',
    status: 'Live',
    since: 2018,
    stack: ['HTML', 'CSS', 'JavaScript', 'SVG', 'Cloudflare Workers'],
    primary: { label: 'Play the game', href: 'https://at-bat.jdegbau.com/' },
    secondary: { label: 'View the code on GitHub', href: 'https://github.com/jdegbau/the-longest-at-bat' },
    hero: {
      src: '/assets/img/projects/at-bat-strikeout.webp',
      alt: 'The game after a five-pitch strikeout: a scoreboard, a strike zone plot with numbered pitches, a pitch-by-pitch log, and a summary comparing the at-bat to the record.',
      width: 1600,
      height: 1025,
      device: 'browser',
      url: 'at-bat.jdegbau.com',
    },
    overview: [
      'On April 22, 2018, Brandon Belt saw 21 pitches in a single at-bat, the longest in Major League history. This game asks whether you can beat it.',
      'Each pitch you choose to take, swing, swing for the fences or bunt. The game tracks it like a broadcast: the count, the bases, where every pitch crossed the plate, and how long the at-bat would have taken under the pitch clock.',
    ],
    features: [
      { title: 'Real odds', text: 'Balls, strikes, fouls, whiffs and hits are based on 2025 MLB averages from Baseball Savant, FanGraphs and Baseball-Reference.' },
      { title: 'Pick your hitter', text: 'Contact, power or patient, batting right, left or switch. Each changes how often you miss, foul off or read a pitch.' },
      { title: 'A different pitcher every time', text: 'Each pitcher has their own pitch mix, velocity, control and stuff, and tires as their pitch count climbs.' },
      { title: 'A real game situation', text: 'Every at-bat starts in a random, realistic inning, score and base state.' },
      { title: 'Broadcast-style tracking', text: 'A strike-zone plot, a pitch-by-pitch log and a hit-location chart.' },
      { title: 'Context when it ends', text: 'How your at-bat compares to the record, the 3.9-pitch average and the league strikeout rate.' },
    ],
    gallery: [
      { src: '/assets/img/projects/at-bat-start.webp', alt: 'The start screen: the story of Brandon Belt’s 21-pitch at-bat and a Let’s Find Out button.', width: 1600, height: 1025, device: 'browser', url: 'at-bat.jdegbau.com', caption: 'The challenge.' },
      { src: '/assets/img/projects/at-bat-choose-batter.webp', alt: 'Choosing a batter: bats right, left or switch, and contact, power or patient hitter.', width: 1600, height: 1025, device: 'browser', url: 'at-bat.jdegbau.com', caption: 'Pick a hitter.' },
      { src: '/assets/img/projects/at-bat-strikeout.webp', alt: 'A finished at-bat with pitch locations plotted and the pitch-by-pitch log.', width: 1600, height: 1025, device: 'browser', url: 'at-bat.jdegbau.com', caption: 'Five pitches, then strike three.' },
    ],
    story: [
      {
        heading: 'Why I built it',
        paragraphs: [
          'I started this game in 2018, the year Belt set the record, with help from Aquent Gymnasium’s JavaScript Foundations course. It has since grown into a broadcast-style, pitch-by-pitch tracker.',
        ],
      },
      {
        heading: 'How it’s built',
        paragraphs: [
          'Plain HTML, CSS and JavaScript, with the strike zone and field drawn in SVG. The 2025 update rebuilt the odds from league averages (with a full source list saying which numbers are published and which are estimates), added batter and pitcher types, and moved hosting to Cloudflare Workers.',
        ],
      },
    ],
    facts: [
      { label: 'What', value: 'Free baseball simulation in the browser' },
      { label: 'The record', value: '21 pitches, Brandon Belt, April 22, 2018' },
      { label: 'Odds from', value: '2025 MLB averages' },
      { label: 'First version', value: '2018' },
    ],
    schemaCategory: 'GameApplication',
    operatingSystem: 'Any (web browser)',
  },
  {
    slug: 'reading-log',
    name: 'Reading Log',
    kind: 'Personal web app',
    tagline: 'My private reading tracker: a journal for every book, finish-date estimates, a stats dashboard, and a spoiler-aware reading companion.',
    description: 'Reading Log is Josh DeGrasse-Baumann’s personal reading tracker: a journal for every book, finish-date estimates from recent pace, a stats dashboard, and a spoiler-aware AI reading companion.',
    seoTitle: 'Reading Log: a personal reading tracker with stats and an AI companion',
    status: 'Live, sign-in only',
    since: 2026,
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Lovable'],
    access: 'private',
    primary: { label: 'Visit books.jdegbau.com', href: 'https://books.jdegbau.com/' },
    hero: {
      src: '',
      alt: 'Illustration of the Reading Log stats page: a daily reading line colored by book, a goal ring, and a shelf of book spines.',
      width: 1200,
      height: 780,
      device: 'browser',
      url: 'books.jdegbau.com/stats',
    },
    illustration: 'reading-log',
    overview: [
      'Reading Log is the app I use to track what I read. Each book gets a page with its cover, progress and a journal of every session: pages read, how long it took, and any quotes or notes.',
      'It lives at <a href="https://books.jdegbau.com/">books.jdegbau.com</a>. The library is mine alone, so visitors see a sign-in page; the picture here is an illustration of the Stats page.',
    ],
    features: [
      { title: 'A journal for every book', text: 'Log a session in a few taps: pages, a built-in timer that survives a closed tab, and an optional quote. Each book takes its accent color from its cover.' },
      { title: 'Honest finish dates', text: 'Estimates come from the last two weeks of pace, rest days included, and from my own minutes per page by format.' },
      { title: 'A stats dashboard', text: 'Daily reading activity colored by book, with playback, plus streaks, reading speed, ratings by genre and mood, and a bookshelf of spines sized by length.' },
      { title: 'Shareable recaps', text: 'Export the activity chart as a 9:16 video or an image card, ready for a phone’s share sheet.' },
      { title: 'Goals and reminders', text: 'Reading goals with pace and history, a daily reminder, and a late-evening push when a streak is about to break.' },
      { title: 'A spoiler-aware companion', text: 'An AI reading companion that only discusses the book up to the page I’m on, and suggests what to read next from my own ratings.' },
    ],
    gallery: [],
    story: [
      {
        heading: 'Why I built it',
        paragraphs: [
          'I wanted to track reading, not just books: when I read, how fast, which books carried a month, and a realistic date I’ll finish.',
          'It’s also where I practice what I write about on this blog: the Stats page is a working dashboard of my own data.',
        ],
      },
      {
        heading: 'How it’s built',
        paragraphs: [
          'React, TypeScript, Tailwind and shadcn/ui on the front end, with Supabase for the database, sign-in, scheduled push reminders and the companion’s server function. The parts that do the math have tests: finish estimates, goals, streaks and the spoiler parser, which fails closed so a malformed reply never leaks a spoiler.',
        ],
      },
    ],
    facts: [
      { label: 'What', value: 'Personal reading tracker at books.jdegbau.com' },
      { label: 'Access', value: 'Sign-in only; the library is private' },
      { label: 'Tracks', value: 'Sessions, pages, time, quotes, ratings' },
      { label: 'Started', value: 'October 2026' },
    ],
    schemaCategory: 'LifestyleApplication',
    operatingSystem: 'Any (web browser)',
  },
];

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
