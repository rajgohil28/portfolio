# Portfolio — Gap Analysis to Award-Winning

_Last updated: 2026-07-10. Scope: what actually stands between this build and
Awwwards / CSSDA / FWA-tier recognition **for this specific brief** (Apple-like,
calm, precise, product-first)._

---

## 0. The reframe (read this first)

The previous version of this document argued the site needs WebGL, Three.js,
GLSL shaders, custom cursors, and physics-heavy motion. **For this brief, most of
that is the wrong direction and would lose, not win.**

The brief is explicit: _minimal, calm, precise, elegant, product-first_, and it
literally says **"avoid excessive animation, custom cursors, noisy effects."**
Sites win awards in this lane the way Apple, Linear, Vercel, Family, and Arc do —
through **restraint executed to an obsessive standard**, not spectacle. The bar
here is _craft density_: perfect type, perfect timing, real content, and
transitions that tell a story. Adding a fluid shader background would read as a
student trying too hard.

So "what's missing" is not more effects. It's **precision, authenticity, and the
one signature idea the brief already handed us** (the section-to-section morph)
executed for real.

---

## 1. Where it stands honestly

**Strong foundation:** clean React + Vite + TypeScript, a real design-token
system, hash-routed case studies, snap-scroll with keyboard support, a
reduced-motion path, and zero-weight generated product mockups. The architecture
is genuinely good and fast.

**But it is currently mid-refactor and regressed against the brief.** The recent
collage/magnetic/cursor edits introduced problems that must be resolved before any
"polish" work matters (see P0). Right now the build does not compile.

---

## P0 — Blocking. Fix before anything else.

### 0.1 The build is broken
`ProjectSection.tsx` has a TypeScript error (`total` declared but never read).
The site does not currently `tsc -b`. Nothing ships until this is green.

### 0.2 The collage layout dropped brief-required card content
The new overlapping `CollageCard` renders **only the visual** — it deleted the
**project name, category, and outcome label** that the brief mandates on every
card ("Each card has only: project name, short category, and a minimal outcome
label"). It also removed the explicit "this opens a case study" affordance.

Overlapping collages look editorial in a screenshot but **fail the product brief**:
enterprise buyers scanning a CRM/ERP grid need to read _what each thing is_ and
_what it achieved_ at a glance. The clean, labelled card grid was correct. If you
want more art direction, add it _inside_ the card visual, not by deleting the
metadata. **Recommendation: restore the labelled grid; treat collage as a rejected
exploration.**

### 0.3 Custom cursor + magnetic-everything fights the brief
A `Cursor.tsx` and `useMagnetic` on every link, dot, and card were added. The
brief says avoid custom cursors and excessive animation. Beyond the rule, a custom
cursor actively hurts an Apple-like feel (Apple never hijacks the pointer) and
breaks the native trust the "calm/precise" direction depends on.

**Recommendation:** remove the custom cursor entirely. Keep magnetism only on the
**primary CTA(s)** (contact button) at a _subtle_ strength (~0.15), where it reads
as delight rather than gimmick. Strip it from dots, nav, and cards.

### 0.4 Generated mockups are the #1 credibility gap
The `Shot.tsx` CSS/SVG mockups are clever and performant, but at close range they
read as _placeholder_, not product. Award juries and hiring managers both clock
this instantly: no real screens = no real work shown. **This is the single highest-
impact change on the list.**

**Recommendation:** the code already supports a one-line `image` override per
project/screen. Replace 3–5 hero visuals with real, art-directed screenshots or
tasteful redraws (even 3 real ones beats 10 generated). Keep generated mockups
only as graceful fallbacks. Optimize as AVIF/WebP, sized to container, lazy-loaded
below the fold.

---

## P1 — The craft that actually wins, within the brief

### 1.1 Deliver the signature idea for real: the morph transitions
The brief's most original instruction is the section-to-section _transformation_:
intro elements **organize** into an enterprise grid → cards **recompose** into
phones → screens **gain depth** → spatial elements **resolve** into play. This is
the site's whole thesis and its award hook.

Today these are **fades and slides that only imply** the transformation. To land
it, the _same elements_ must visibly transform across the boundary:

- Use **FLIP** (First-Last-Invert-Play) or shared-element transitions so a web
  card's frame morphs into a phone frame, rather than one fading out and another
  fading in.
- Drive the morph with **scroll progress across the snap boundary** (the site
  already computes a `--p` per section — wire it into the transform, not just a
  parallax nudge).
- Keep each morph **≤ 600ms of perceived motion**, eased, interruptible, and fully
  disabled under reduced-motion. Storytelling, not spectacle.

This one feature, done properly, is worth more than every other item combined.

### 1.2 Motion timing and orchestration
The mechanics exist; the _tuning_ is what separates premium from template.
- Commit to **two easing curves** (one standard ease-out for entrances, one gentle
  spring for tactile press/lift) and use them everywhere — no default `ease`.
- **Stagger with discipline:** 40–70ms between siblings, never more; entrances
  should feel like one gesture, not a queue.
- Add **press states** (scale 0.98) and honest **lift** (translateY + shadow bloom)
  on cards — the brief calls for "slight lift, soft light/shadow, image movement."
- Kill any transition that fires on unrelated re-renders (watch the
  IntersectionObserver-driven classes).

### 1.3 Typographic rhythm and optical detail
Apple-calm lives or dies here.
- Tighten display tracking (−0.02 to −0.03em) on the big headlines; loosen
  micro-labels (+0.12em). Verify optically, not just numerically.
- Enforce a **modular type scale** and consistent baseline rhythm across sections
  so every section _feels_ like the same document.
- Use **`text-wrap: balance`** on all headlines and taglines (partially present —
  make it universal).
- Check number rendering: metrics should use **tabular-nums**; the accent metric
  is the hero of each card — make it unmistakably the focal point.

### 1.4 Case study depth — let visuals explain
The template is structurally right (opportunity → strategy → product → outcome).
To hit "elite PM/designer" standard:
- Every "product experience" screen needs a **real annotated flow or before/after**,
  not a single static mock. Show a _decision_, not a picture.
- Add one **prototype-feel moment** per study (a short autoplaying UI loop or an
  interactive toggle) — the brief asks for prototypes.
- Keep copy as tight as it already is. The writing is good; the _visuals_ are what
  need to carry more.

### 1.5 Scroll-snap reliability
Snap is the core interaction, so it must be flawless.
- Test trackpad (macOS inertial), mouse wheel, touch, and keyboard on real devices.
  Mandatory snap + tall sections is the classic trap — verify long mobile sections
  scroll freely and still re-snap.
- Make sure the dot-rail active state never disagrees with the visible section
  (the taller-than-viewport case was already a bug once).

### 1.6 First-paint / loading choreography
The brief says no slow loading screens — good. But the _first section_ should
resolve with intention: fonts preloaded and `font-display: swap` handled so there's
no bold flash, hero entrance choreographed on `load`, images reserved with aspect
ratios so nothing reflows.

---

## P2 — Finish, credibility, and the details juries check

- **Real content everywhere:** replace all `[PLACEHOLDER]` projects, metrics, and
  the `rajgohil` social URLs with real ones. Add a real `resume.pdf`. Fabricated
  metrics are the fastest way to lose credibility with anyone who looks closely.
- **A short credibility beat:** consider one calm "about" moment — a line of
  positioning, logos/roles, or a portrait — so the work has an author. Optional,
  but it deepens trust.
- **SEO / share:** proper `<title>`/description (present), plus **Open Graph +
  Twitter cards with a real 1200×630 share image**, canonical URL, and a favicon
  set. Award submissions and shared links both need the OG image.
- **Accessibility to AA:** focus-trap the case-study modal, restore focus on close
  (present — verify), ensure every card is keyboard-openable, confirm contrast on
  the accent-on-white metric chips, and confirm the reduced-motion path removes
  _all_ transforms (including the new magnetic/cursor code).
- **Performance budget:** measure Lighthouse; target 95+ across the board. Watch
  the generated-mockup DOM node count (some mockups render many nodes) and the
  font payload.
- **Robustness:** a bad `#/p/unknown-slug` hash should fail gracefully (redirect to
  home or a small not-found), not render blank.
- **Consistency of voice:** one editorial tone across all copy; the current copy is
  strong — keep it uniform as real projects go in.

---

## What NOT to do (guardrails)

These would _lower_ the score for this brief, not raise it:
- ❌ Three.js / WebGL / GLSL background scenes — off-brief, off-brand.
- ❌ A custom cursor — explicitly disallowed and anti-Apple.
- ❌ Magnetism/hover motion on _everything_ — reserve for the primary CTA.
- ❌ Big animated text blocks, marquees, or "scroll-jacking" beyond clean snap.
- ❌ Trading the labelled product grid for a decorative collage.

Restraint is the aesthetic. Every element should justify its presence.

---

## Suggested sequence

1. **Unblock:** fix the `tsc` error; get the build green.
2. **Revert off-brief regressions:** restore the labelled card grid; remove the
   custom cursor; pare magnetism back to the CTA.
3. **Authenticity:** drop in 3–5 real screenshots via the `image` override.
4. **The signature:** implement one section morph (web → mobile) with FLIP/shared
   elements as a proof; if it sings, extend to the other three boundaries.
5. **Tune motion + type** to the standard in P1.2 / P1.3.
6. **Finish:** OG image, a11y trap, real links/resume, Lighthouse pass.

Items 1–4 are what move this from "clean template" to "award contender." Items 5–6
are what make a jury believe it was made by someone who cares about every pixel.
