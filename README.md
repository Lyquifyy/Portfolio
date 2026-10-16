# Zander Erwin — Portfolio

Personal site, live at <https://lyquifyy.github.io/Portfolio/>.

One page: intro, profile, experience, work, security, a panel that pulls recent GitHub activity, résumés, backlog, contact. A ⌘K / Ctrl+K palette jumps anywhere, opens links, downloads résumés, flips the theme and toggles an X-ray view. Content lives in `src/data/` and matches the résumés.

## Effects

Everything in `src/fx/` is hand-written; there is no animation library.

- `Wireframe` — a wireframe `</>` on a 2D canvas with a hand-rolled perspective projection. Drag to orbit, with inertia.
- `ProjectSheet` — a card grows into a full-screen sheet (a FLIP transform) and closes back into place. Deep-linkable via `#p-<id>`.
- `DineSensePulse` — live counts from DineSense's production database through `pulse()`, a count-only function callable with the publishable key.
- `DynamicIsland` — a working recreation of Programmed's Live Activity: rest timer, Set done, +15s, Skip.
- `Heatmap` — 13 weeks of public pushes from the GitHub events API, drawn on canvas.
- The skills list cross-references every project and job that used each skill; names in the profile prose open the matching project or job.
- `Timeline` — the four roles drawn to scale by month; hovering a bar or a job highlights the other.
- Résumé cards read their PDF's size and last-modified date with a HEAD request; backlog horizons are drawn as proportional bars; contact shows the current time in Wichita.
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
