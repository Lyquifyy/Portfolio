# Zander Erwin — Portfolio

Personal site, live at <https://lyquifyy.github.io/Portfolio/>.

One page: intro, profile, experience, work, security, a panel that pulls recent GitHub activity, résumés, backlog, contact. A ⌘K / Ctrl+K palette jumps anywhere, opens links, downloads résumés, flips the theme and toggles an X-ray view. Content lives in `src/data/` and matches the résumés.

## Effects

Everything in `src/fx/` is hand-written; there is no animation library.

- `Cursor` — crosshair that snaps to links and buttons. Fine pointers only.
- `Wireframe` — a wireframe model on a 2D canvas with a hand-rolled perspective projection. Drag to orbit, with inertia.
- `SheetRail` — scroll-driven horizontal rail of project cards inside a sticky viewport. Native scrolling only. Falls back to scroll-snap below 900px.
- `Terminal` — a session transcript that types itself when scrolled into view.
- Theme flip uses the View Transitions API as a circular wipe where available.

All of it respects `prefers-reduced-motion`.

## Stack

- React 19 on Create React App (`react-scripts` 5)
- Plain CSS with custom properties; light and dark follow the system preference
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
