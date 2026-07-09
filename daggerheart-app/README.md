# Daggerheart App — Component Library ("the bricks")

The reusable UI building blocks for the Daggerheart companion app, built on the
grimoire design tokens. This is the foundation the full React app will be assembled from.

## Just want to look at it?
Open **`preview-gallery.html`** in your browser — a self-contained gallery showing every
component in its states. No install needed.

## Components (src/components/)
Button · Tag · Card · Panel · SectionHeader · StatTile · PipTrack · Tooltip · Select · SearchPicker · Modal

Each component is colocated as `Name.tsx` + `Name.module.css`, with a demo in `src/gallery/`.
Design tokens live in `src/theme/` (`tokens.css` = CSS variables, `tokens.ts` = typed values).

## Run the live dev version (optional, needs Node.js)
```
npm install
npm run dev      # hot-reloading dev server
npm run build    # production build -> dist/
```

Stack: Vite + React + TypeScript. Styling: plain CSS Modules + the grimoire token variables
(no UI framework dependency). Verified: strict TS compile, production build, and SSR render all pass.
