# Zander Erwin — Portfolio

A software engineering portfolio, live at https://lyquifyy.github.io/Portfolio/.

## Source baseline

This redesign starts from `claude/gracious-ritchie-7konnt` at `0e5871b`, verified against the deployed GitHub Pages source map on October 16, 2026. `gh-pages` contains the published build, not the React source. The redesign is on `codex/portfolio-engineering-redesign` and has not been deployed.

## Run locally

```sh
npm install
npm start
```

Create React App serves the site under `/Portfolio/` to match GitHub Pages.

```sh
npm test -- --watchAll=false
npm run build
```

## Motion

Nothing on the page waits for a click. One scroll loop (`src/motion/scroll.js`) drives it all; there is no animation library.

- Wheel-driven inertial scrolling on fine pointers. Touch, keyboard and the scrollbar stay native, and any scroll the loop did not cause hands control straight back.
- Every section reads its own scroll progress from a CSS variable (`--p`) and animates in plain CSS, so headings rise word by word, paragraphs read themselves in, stages and cards stagger, and it all runs in reverse on the way back up.
- The hero stack assembles on load, then requests cycle through it on their own; resting on a layer selects it, the drawing leans towards the pointer, and the layers drift apart as the intro scrolls away.
- The DineSense screens cycle, the Programmed Live Activity works through a session, and the ExpenseTracker trace loops, all while on screen. Touching any of them takes over for a while, then the demo resumes.
- A rail down the left gutter maps the page as a request path: a packet rides it with the scroll and each section lights as a station.
- The skill ticker drifts on its own and moves with the page; the header tucks away on the way down and returns as paper once the intro has passed.

`prefers-reduced-motion` turns all of it off and leaves every block at its final state.

## Structure

- `src/App.js`: work, experience, about, and contact sections.
- `src/components/SystemSketch.jsx`: interactive SVG stack with a replayable request/response sequence.
- `src/components/ArchitecturePreview.jsx`: ExpenseTracker's three-layer architecture and request trace.
- `src/hooks/useRequestTrace.js`: the request pass that runs on its own while in view, rests, and runs again; visibility, hold-on-touch, and reduced-motion handling.
- `src/motion/`: the scroll loop, the progress hook, and the `Scrub` block that staggers its children.
- `src/fx/`: `Title` (rising headings), `Words` (prose that reads in), `Ticker`, `SignalRail`, `Magnet`.
- `src/components/WorkoutDemo.jsx`: actual Programmed screenshot and source-styled Live Activity adaptation with set logging, a pausable rest timer, and reset.
- `src/data/`: original project, career, and profile facts. Some historical content is retained here without being promoted on the page.
- `src/App.css` and `src/index.css`: responsive layout and global styles.
- `public/fonts/`: portfolio fonts plus Programmed's bundled Barlow Condensed and Archivo; OFL licenses included.
- `public/images/`: real DineSense and Programmed previews with source attribution.
- `public/resumes/`: original software and cybersecurity PDFs. The site promotes the software résumé.

`PRODUCT.md` records the audience and factual constraints; `DESIGN.md` records the implemented visual system.

The site needs no backend or API keys. Project details use native disclosures; the contact section links directly to email. The former remote activity feeds, EmailJS form, cursor effects, modal project sheets, theme switch, and speculative backlog remain out of the interface. All essential content is visible without animation, and reduced-motion preferences disable motion.

## Deployment

```sh
npm run deploy
```

This builds and publishes to `gh-pages`. Run only when ready to update the public site.
