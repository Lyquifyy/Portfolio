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

## Structure

- `src/App.js`: work, experience, about, and contact sections.
- `src/components/SystemSketch.jsx`: interactive SVG stack with a replayable request/response sequence.
- `src/components/ArchitecturePreview.jsx`: ExpenseTracker's three-layer architecture and request trace.
- `src/hooks/useRequestTrace.js`: shared finite playback, visibility cleanup, and reduced-motion handling.
- `src/components/WorkoutDemo.jsx`: actual Programmed screenshot and source-styled Live Activity adaptation with set logging, a pausable rest timer, and reset.
- `src/data/`: original project, career, and profile facts. Some historical content is retained here without being promoted on the page.
- `src/App.css` and `src/index.css`: responsive layout and global styles.
- `public/fonts/`: portfolio fonts plus Programmed's bundled Barlow Condensed and Archivo; OFL licenses included.
- `public/images/`: real DineSense and Programmed previews with source attribution.
- `public/resumes/`: original software and cybersecurity PDFs. The site promotes the software résumé.

`PRODUCT.md` records the audience and factual constraints; `DESIGN.md` records the implemented visual system.

The site needs no backend or API keys. Project details use native disclosures; the contact section links directly to email. The former remote activity feeds, EmailJS form, cursor effects, modal project sheets, theme switch, and speculative backlog have been removed from the interface. All essential content remains visible without animation, and reduced-motion preferences disable motion.

## Deployment

```sh
npm run deploy
```

This builds and publishes to `gh-pages`. Run only when ready to update the public site.
