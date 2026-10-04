# Zander Erwin — Portfolio

Personal site, live at <https://lyquifyy.github.io/Portfolio/>.

A one-page "dossier": masthead, chapter rail, a ⌘K command palette, experience and project index drawn from my résumés, a security chapter, and a panel that pulls my latest GitHub activity at runtime (with a static fallback if the API is unreachable).

## Stack

- React 19 on Create React App (`react-scripts` 5)
- Plain CSS with custom properties; light and dark themes follow the system preference
- Type: Instrument Serif, IBM Plex Sans, IBM Plex Mono (Google Fonts)
- EmailJS for the contact form (public client keys only)
- Deployed to GitHub Pages from the `gh-pages` branch

## Develop

```bash
npm install
npm start
```

Opens <http://localhost:3000>. Content lives in `src/data/`; the page layout is `src/App.js`; styles are `src/App.css`.

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
