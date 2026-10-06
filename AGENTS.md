<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FingerFiasco (fingerfiasco-next)

Next.js 16 App Router (Turbopack) + React 19 + Tailwind v4 + TypeScript. Typing speed-test tool targeting "typing speed test / wpm test" keywords.

## Commands

- `npm run dev` / `npm run build` / `npm run start` / `npm run lint` (eslint, no tests, no CI).
- Verify order: `npm run lint`, then `npm run build`. Both must pass.
- Shell is Windows PowerShell 5.1: chain with `; if ($?) { ... }`, never `&&`. Use `workdir` instead of `cd`.

## Architecture

- `app/` routes: `/`, `/punctuation`, `/numbers` live in the `(test)` route group (URLs unchanged) with a shared `layout.tsx` hosting `TypingGame`; `/developers` stands alone (+ `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`). Never render `TypingGame` in a page — the shared layout is what keeps tab switches remount-free.
- Typing core: `components/TypingGame.tsx` + `hooks/useTypingEngine.ts`. Scroll offset lives in a ref applied as a direct DOM `transform` and the caret is measured after it in ONE layout effect — never split into separate marginTop/cursor states (causes caret drift). Line height is measured from rendered rows, never hardcoded. Mount-vs-reset in the engine is keyed on the `${mode}|${level}|${durationMs}` string — never a boolean `mounted` flag (effect cleanup runs before every re-invocation, so a flag silently swallows all post-mount resets).
- Word banks: `lib/words.ts` — 5 `EnglishLevel` pools (1 easy → 5 expert); punctuation/numbers modes are transforms on top. Selected via `?level=` (`parseLevel` validates).
- Options UI: `components/ConfigBar.tsx` above the game mirrors Monkeytype's three groups (content toggles, levels 1–5, durations) as param-preserving Links; slim `Navbar.tsx` holds only brand + Developers/GitHub. Never add modes that don't exist (no words/quote/zen/custom).
- `lib/site.ts` holds `SITE_URL` (canonical/OG/sitemap source, confirmed live at `https://fingerfiasco-next.onrender.com`). Override via `NEXT_PUBLIC_SITE_URL` (also set in `render.yaml`, then redeploy — metadata is baked at build time).
- Render gotcha: `buildCommand` must install dev deps (`npm install --include=dev`); never set `NODE_ENV=production` in `render.yaml` (npm prunes devDependencies and the Tailwind/PostCSS build fails with "Cannot find module '@tailwindcss/postcss'").
- Styling: Mobbin monochrome tokens in `app/globals.css` (ink `#141414`, soft `#f3f3f3`, pills for all interactive, light-only). Entrance animations use fill-mode `backwards`, never `both` (`both` freezes transforms into stacking contexts and traps the level dropdown under `#game`). `#info-container` is explicitly layered above the game surface.
- Dead weight: `next-themes` is still in `package.json` but unused (dark mode removed) — remove on next dep pass. Footer component returns `null` by design.

## SEO workflow

- Canonical site identity lives in `lib/site.ts`; per-route title/description/canonical/h1 in each `app/**/page.tsx`; JSON-LD (`Organization`/`WebSite`/`WebApplication`) in `app/layout.tsx`.
- Banned schema types (zero rich-result benefit, never add): `FAQPage`, `HowTo`, `SpecialAnnouncement`, `ClaimReview`, `CourseInfo`, `EstimatedSalary`, `LearningVideo`, `VehicleListing`. Never reference FID (replaced by INP).
- After touching any page, route, metadata, or image: delegate an audit to the `seo-reviewer` subagent (`.opencode/agents/seo-reviewer.md`, read-only), then fix findings and re-verify with `lint` + `build` + checking `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` in the build output.
- Reference checklists auto-load from `~/.claude/skills/seo-*/` (installed from `AgriciDaniel/claude-seo` via manual copy of `install.sh`'s file steps; runtime/Chromium setup intentionally skipped). Rankings also depend on content/backlinks outside this repo — own technical + on-page SEO here, don't promise positions.
