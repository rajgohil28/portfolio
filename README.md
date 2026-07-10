# Raj Gohil — Portfolio

A hand-built, single-page portfolio designed as a digital exhibition:
an "Observatory" of numbered plates set against a living generative field.

**Stack:** Vite · React · TypeScript · hand-written CSS · Canvas 2D.
No animation, styling, or 3D libraries — every visual is generated in
[src/lib/field.ts](src/lib/field.ts) and [src/lib/plates.ts](src/lib/plates.ts).

## Running it

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # production build → dist/
npm run preview    # serve the production build
```

## Editing your content

**Everything editable lives in one file: [`src/content/site.ts`](src/content/site.ts).**
Name, title, positioning, bio, projects, results, experience, honours,
social links, and contact copy. Entries marked `[PLACEHOLDER]` are
realistic examples written for the design — swap in your real work.

- **Projects** — each has a `seed` (any integer; change it to reroll its
  generative artwork) and a `motif` (`orbit`, `lattice`, `strata`, `bloom`).
- **Resume** — drop your PDF at `public/resume.pdf` (or point
  `social.resume` at a URL).
- **Fonts** — loaded in [index.html](index.html): Cabinet Grotesk (display),
  Switzer (body), Spline Sans Mono (labels).
- **Colors** — design tokens at the top of
  [src/styles/global.css](src/styles/global.css) (`--ink`, `--paper`, `--flare`).

## Design system

- Warm near-black ink `#0b0a08` / warm off-white paper `#eae2d6`,
  one vermilion accent `#ff4a1f`.
- Signature interactions: the hero flow-field (bends around the cursor,
  drifts with scroll), cursor-following generative project plates,
  the contact beacon (magnetic ring, copies email on click), and a
  context-labelled custom cursor + instrument-gauge scroll rail.
- All motion respects `prefers-reduced-motion` (static field render,
  no preloader, no reveals). Custom cursor and hover plates disable
  on touch devices; everything is keyboard-navigable.
