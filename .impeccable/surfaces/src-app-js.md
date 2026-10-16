---
version: 1
slug: "src-app-js"
primary_target: "src/App.js"
related_targets: ["src/App.css","src/components/SystemSketch.jsx","src/components/WorkoutDemo.jsx","src/components/ArchitecturePreview.jsx","src/hooks/useRequestTrace.js"]
---

# Portfolio home

Mode: Experience, with software hiring teams as the primary audience.

The visitor should understand Zander's engineering focus immediately, inspect DineSense / Programmed / ExpenseTracker, see concrete career evidence, and reach the software résumé or email without searching.

The visual direction is an engineering exhibition: a cobalt opening and close, oversized Bricolage typography, an interactive exploded SVG stack, and one shared neutral presentation field for all project examples. The signature interaction highlights the interface, application logic, or data layer and explains it in plain language. Real DineSense previews, an actual Programmed screenshot, and a labeled Live Activity adaptation carry the project storytelling. Programmed uses its own Barlow Condensed / Archivo typography and v4 + Lit colors inside the artifact, sourced from the local The-Locker app. The obsolete hero status/location/scroll strip is removed at the user’s request.

Motion thesis: one finite request/response sequence travels through the hero’s interface, logic, and data layers. The architecture preview reuses that grammar. Each sequence plays once on entering view, can be replayed, cancels when offscreen or hidden, and skips movement under reduced-motion preference. A masked headline entrance, screen-change transition, set-confirmation bulbs, and rest track provide local feedback. No new animation dependencies or perpetual loops.

Native scrolling, native detail disclosures, visible content, reduced-motion support, and mobile navigation are required. No background production APIs, simulated live metrics, hidden project modals, or speculative backlog. Keep the distinction between shipped, pilot, and in-development work.

Base source: claude/gracious-ritchie-7konnt at 0e5871b, verified against the deployed bundle. No publication has been requested.
