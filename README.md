# Raj Gohil — Portfolio

A snap-scroll portfolio with alternating light-aurora / cinematic-dark
sections and a signature "reel" interaction: each work section shows four
project cards that fly in from off-screen, page by drag / arrow keys /
horizontal trackpad scroll, and open into case-study modals.

**Stack:** Vite · React · TypeScript · hand-written CSS. No animation or
3D libraries.

## Running it

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # production build → dist/
npm run preview    # serve the production build
```

## Content — CMS-ready JSON

**Everything editable lives in [`src/content/content.json`](src/content/content.json):**
identity (name, role, kinetic `rotation` lines, statement, email, socials),
per-section metadata (heading, sub, and `theme: "light" | "dark"`), the
closing CTA, and all projects with full case-study fields.

[`src/content/portfolio.ts`](src/content/portfolio.ts) is only the typed
loader — point it at your CMS's JSON output later and nothing else changes.

- **Projects** are `[PLACEHOLDER]` examples — replace with real work. Keep
  each section's project count a multiple of 4 (the reel pages by 4).
- **Screenshots:** set `image` on a project (reel card + case hero) or on
  any screen: files go in `public/`, referenced as `"/file.png"`. Cards
  render as clean empty frames until an image is set.
- **Section themes** are content: flip `sections.*.theme` between
  `"light"` and `"dark"` to re-chapter the site.
- **Resume:** drop `public/resume.pdf`. **Share card:** drop a 1200×630
  `public/og.png` and set `og:url` in [index.html](index.html) to your domain.

## Interaction reference

- **Sections:** one scroll per section (snap), ↑/↓ or PageUp/PageDown,
  dot rail (theme-aware) on the right.
- **The reel:** drag horizontally, ←/→ keys, horizontal trackpad scroll,
  or the page dots. Cards fly in on arrival and out on exit.
- **Case studies:** click a card → modal (`#/p/slug`), Esc / outside-click
  to close, Tab is trapped inside, focus returns on close.
- **Reduced motion** disables flights, auroras, masks, and the preload
  choreography while keeping everything usable.

See [enhancement.md](enhancement.md) for the running award-readiness plan.

## Git-based CMS

The portfolio includes a lightweight admin at `/admin`. It edits
`src/content/content.json` directly through the GitHub API: publishing makes
a normal Git commit, so Vercel automatically deploys the new content. There
is no database or separate content service.

The admin offers a dashboard, profile/closing editor, project list (add,
edit, delete, reorder), section editor, and an Advanced JSON view for the
full case-study schema. It is intentionally an owner-only tool: a GitHub
OAuth login is checked against `GITHUB_OWNER` before any content endpoint can
be accessed.

### One-time Vercel setup

1. Create a GitHub OAuth App. Its callback URL must be
   `https://YOUR-DOMAIN/api/auth/callback` (use your Vercel preview URL while
   setting it up, then add the production URL).
2. Add these environment variables in Vercel (for Production and Preview):

   ```text
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   CMS_SESSION_SECRET=<a long random value>
   GITHUB_OWNER=rajgohil28
   GITHUB_REPO=portfolio
   GITHUB_BRANCH=main
   CMS_CONTENT_PATH=src/content/content.json
   ```

3. Redeploy, then visit `/admin` and sign in with the `rajgohil28` GitHub
   account. The OAuth token is kept in a signed, HttpOnly, eight-hour session
   cookie and is never sent to the browser JavaScript.

For local CMS API testing, deploy to Vercel or use `vercel dev`; plain
`npm run dev` serves the admin UI but does not run the `/api` functions.
