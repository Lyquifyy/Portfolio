# Zander Erwin — Portfolio

Personal site, live at <https://lyquifyy.github.io/Portfolio/>.

A one-page site drawn like a drawing set. Chapters are sheets, the nav is a chapter rail, and a title block in the corner reports the active sheet, scroll depth, pointer coordinates and the local clock. Content comes from `src/data/` and is the same material as the résumés. A ⌘K / Ctrl+K palette jumps anywhere, opens links, downloads résumés, flips the theme, toggles X-ray view and replays the intro.

## Effects

Everything in `src/fx/` is hand-written. There is no animation library.

- `ShaderField` — full-screen WebGL fragment shader: fractal-noise contour field with a drafting grid, bent and tinted by the pointer, drifting with scroll. Renders below native resolution and pauses when the tab is hidden.
- `Cursor` — CAD crosshair with a coordinate readout. Over links and buttons the pick-box object-snaps to the element's bounding box. Only on fine pointers.
- `Preloader` — plot sequence: a plotter head wipes the name in, a counter runs to 100, a stamp drops, then the sheet splits to reveal the page. Once per session.
- `SplitReveal`, `WordReveal`, `Scramble` — per-glyph rise, scroll-linked word brightening, and glyph-decode text cycling.
- `Dimension` — a dimension line that measures its own rendered width with ResizeObserver and prints the live pixel count.
- `Wireframe` — 3D wireframe massing model on a 2D canvas with a hand-rolled perspective projection, level markers, and drag-to-orbit with inertia.
- `SkillCloud` — skills on a Fibonacci sphere, throwable, with nearest-word highlight.
- `ScrollLine` — the experience timeline draws itself with scroll; revision triangles fill as the line passes them.
- `SheetRail` — scroll-driven horizontal rail of project sheets inside a sticky viewport. Native scrolling only; nothing is hijacked. Falls back to scroll-snap below 900px.
- `Terminal` — a session transcript that types itself when scrolled into view.
- `Tilt`, `Magnetic` — perspective tilt with specular sweep; buttons pull toward the pointer.
- `TitleBlock` — fixed drawing title block, written to the DOM on a throttled frame.
- Theme flip uses the View Transitions API as a circular wipe from the button where available.

All of it respects `prefers-reduced-motion`: canvases render a single still frame, text appears without staggers, and the intro is skipped.

## Stack

- React 19 on Create React App (`react-scripts` 5)
- Plain CSS with custom properties; paper (light) and blueprint (dark) themes follow the system preference
- Type: Big Shoulders Display, IBM Plex Sans, IBM Plex Mono (Google Fonts)
- EmailJS for the contact form (public client keys only)
- Deployed to GitHub Pages from the `gh-pages` branch

## Develop

```bash
npm install
npm start
```

Opens <http://localhost:3000>. Content lives in `src/data/`; the page layout is `src/App.js`; styles are `src/App.css` and `src/fx/fx.css`.

## Test and build

```bash
npm test -- --watchAll=false
npm run build
```

## Deploy

```bash
npm run deploy
```

Builds and pushes the `build/` folder to the `gh-pages` branch. Résumé PDFs live in `public/resumes/`.
