# Enhancement Plan — From "Very Good" to Award-Winning

_Last updated: 2026-07-11. Grounded in the current build: snap-scroll site, the
"reel" (4-up collage, fly-in arrivals, drag paging, image-ready empty cards),
the light aurora pilot on Enterprise AI, dark sections elsewhere, custom cursor,
and the new modal-card case study._

## The one-sentence north star

An award jury spends 90 seconds on a site. In those 90 seconds this site must
deliver: **one breath-taking arrival, one interaction they've never felt
before (the reel), visual proof of real work, and zero rough edges.** Every
item below serves one of those four.

---

## Tier 1 — The decisions that define the site

### 1.1 Commit the whole site to the aurora-light language ⭐ highest leverage
The Enterprise AI section now speaks a confident language: gradient-white
aurora, strict black/white/grey type, monochrome detail. The rest of the site
still speaks last week's dark dialect. Two languages = template feel; one
language = art direction.

- Propagate `.sec-light` to Mobile, XR, Games with **per-section aurora
  tints** (the tokens are ready: retint `--g1..--g4` per section — e.g. warm
  peach/gold for Mobile, cool violet/silver for XR, mint/citrus for Games).
  The whole scroll then reads as *one sky changing weather* — that's the
  storytelling award juries screenshot.
- Rebuild **Intro and Closing** in the same language: white aurora at its
  quietest (intro) and warmest (closing). Kill the leftover dark tiles;
  replace with the reel's own empty-card motif drifting at low opacity —
  foreshadowing the work sections.
- Restyle the **case-study modal card** to match (it's still dark-themed
  around a light card): light surface, monochrome type, aurora bleeding
  faintly behind the modal.
- Keep ONE deliberate dark moment if contrast is wanted — e.g. the Games
  section — a designed chapter break, not a leftover.

### 1.2 Real screenshots in the reel (the credibility ceiling)
The cards are now image-ready frames (`project.image`) — deliberately empty.
Empty frames read as "under construction" to a jury. Nothing else on this
list matters as much as 8–12 real, art-directed screenshots:
- Export at 2× the largest rendered size (~1200px wide landscape, ~500px
  portrait), AVIF/WebP, consistent chrome (same browser frame / device frame
  treatment across a section).
- Art-direct them: consistent zoom level, aligned horizons, one accent moment
  per shot. Screenshots ARE the design system here.
- Give the same treatment to case-study screens (the modal still renders the
  old generated mockups — swap `Shot` usage to the same image-or-empty frame
  pattern for visual consistency with the reel).

### 1.3 A signature intro moment (the arrival)
The intro is currently the weakest section — name, links, floating tiles.
Award sites win the first 5 seconds. Options in order of taste-per-effort:
- **Type-first:** the name sets huge (viewport-width, like the section
  headings), words rising through the existing mask system; the aurora
  blooms from white as it settles. Zero new tech — reuses `.w-mask` + aurora.
- The reel foreshadow: 4 empty cards fly through the intro background on the
  same flight physics, hinting at the mechanic before it's met.
- A single line of kinetic text under the name that cycles roles
  ("enterprise AI / consumer apps / XR / play") with the word-mask.

---

## Tier 2 — Interaction & motion craft

### 2.1 Finish the reel as THE signature
It's already distinctive (fly-in arrivals, drag paging, deal-and-shuffle).
Close the gaps that keep it from demo-perfect:
- **Keyboard:** ← / → page the active section's reel (buttons exist; wire
  the keys in `App.tsx` alongside ↑↓ section nav). A11y and jury-friendly.
- **Wheel-X / trackpad:** horizontal two-finger scroll should page too —
  trackpad users never discover drag.
- **Drag physics:** during drag, let cards separate slightly (each card
  translates at its own factor, like the flight depths) instead of the whole
  plane moving as one — makes the drag feel like holding four objects.
- **Page dots** under the counter (two tiny dots) so state is visible at a
  glance; counter alone requires reading.
- **Preload adjacent page images** once images land, so paging never pops.

### 2.2 Case-study modal: enter like a product reveal
The new centered-card modal is the right shape. Make its entrance earn the
click: scale-up from 0.96 with a soft shadow bloom (250ms), backdrop aurora
dimming, and stagger the hero (kicker → title → facts → visual) with the
existing `.ent` pattern. Add **focus trap** (Tab cycles inside the dialog)
and swipe-down / drag-down to dismiss on touch.

### 2.3 Micro-interactions inventory (one pass, site-wide)
- Pills: add a 1px inner highlight on hover (light theme) — they currently
  only lift.
- Reel cards: on press (`:active`), scale 0.985 — tactile confirmation.
- Dot rail: on light sections the dots must swap to dark tokens (they're
  still white-on-white over the aurora section — check and theme them by
  active section).
- Cursor: label ("View / Drag / Next") already exists — add a subtle scale
  pulse when the label changes so state changes are felt.
- `::selection` and focus rings: verify they're monochrome on light sections.

### 2.4 Sound of the site = its easing
One audit pass: every transition uses either `--ease` or `--spring` (a few
hardcoded cubic-beziers crept into drag snap-back and the modal). One
easing vocabulary is what makes a site feel *composed* rather than animated.

---

## Tier 3 — Content & credibility

- **Replace placeholder reality:** 24 fictional projects with fabricated
  metrics is a liability the moment a real person looks closely. Cut to the
  6–10 real ones, real numbers, real links (`rajgohil` URLs are guesses),
  real `resume.pdf`. Fewer real projects beat many invented ones — and the
  reel handles 4 or 8 per section gracefully.
- **Author beat:** one quiet strip (photo optional) between Games and
  Contact — name, one paragraph of positioning, 3 logos/roles. Trust needs
  a human.
- **Copy pass at the section level:** headings are strong; subs can lose
  ~20% of their words. Short is confident.

## Tier 4 — Technical excellence (the invisible award criteria)

- **Share/OG:** `og:title/description/image` (design a real 1200×630 card
  in the site's aurora language), favicon set, canonical URL. Juries and
  clients share links; the preview card is the first impression.
- **Mobile reel:** the % slot layout needs a defined small-screen behavior —
  likely a single-column swipe stack (the drag mechanic already exists;
  reuse it as the primary mobile navigation). Audit ≤ 700px seriously.
- **Performance budget:** Lighthouse ≥ 95 all categories. Watch: aurora blur
  layers (already `will-change`-scoped), noise overlay (fixed, fine), image
  weights once screenshots land (lazy-load below fold, `fetchpriority=high`
  for the first section only).
- **A11y:** focus trap in modal (2.2), `aria-live` page announcements exist —
  extend to "Page 2 of 2, projects 5 to 8"; verify reduced-motion covers the
  aurora drift, flights, and modal entrance (it currently covers cards/masks).
- **Unknown routes:** `#/p/not-a-slug` should render home, not a blank modal.
- **Deploy:** put it on a real domain with immutable-cache assets — an
  award submission needs a URL, not a localhost.

---

## Suggested order of attack

1. **1.1** Propagate the light language (one afternoon — tokens exist).
2. **1.3** Intro arrival moment (type-first option).
3. **2.1** Reel finishing touches (keys, wheel-x, dots, drag physics).
4. **2.2 + 2.3** Modal entrance + micro-interaction pass.
5. **1.2 + Tier 3** Real screenshots and real content (user-dependent; the
   frames are ready and waiting).
6. **Tier 4** OG, mobile reel, Lighthouse, deploy.

Steps 1–4 are pure code and take the site's *feel* to award grade; step 5 is
what makes a jury believe it; step 6 is what stops anything from undermining
the first five.
