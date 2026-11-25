# Repository Instructions

## Next.js

- This is a Next.js 16.2.7 App Router project. Read the relevant local doc under `node_modules/next/dist/docs/` before changing Next APIs or file conventions; older Next assumptions can be wrong here.
- Entrypoints are `app/layout.tsx`, `app/page.tsx`, and `app/globals.css`; there is no `src/` or `pages/` tree.
- Tailwind is v4 through `@tailwindcss/postcss`; theme tokens live in `app/globals.css` with `@theme inline`. Do not add a Tailwind v3 config unless a change truly needs one.
- Alias `@/*` maps to the repository root, not `src/`.

## Portfolio Direction

- This is a single-page personal portfolio in black and white ASCII: monospace text only, no images, icons, colour or rounded UI chrome.
- The whole page lives in `app/page.tsx`: an animated character field (`Field`) draws the background and the block-letter name, and the copy sits in a plain text column the field fades around.
- Stories come from `content/locations`; the page flattens every location's `stories` into one index. Add a story there rather than hard-coding copy into the page.
- The open story is the URL hash (`/#cross-listing`), so links stay as plain `<a href="#id">`.
- Keep it tasteful: sparse, slow motion, and honour `prefers-reduced-motion`.

## Commands

- Use npm (`package-lock.json` v3); do not create yarn, pnpm, or bun lockfiles.
- Dev server: `npm run dev`.
- Lint: `npm run lint`.
- Typecheck: `npx tsc --noEmit --incremental false` (`tsconfig.json` has `incremental: true`, so keep `--incremental false` to avoid writing `*.tsbuildinfo`).
- Production build: `npm run build`; `npm run start` expects a successful build first.
- No test script or CI workflow is configured.

## Gotchas

- `npm run build` may warn about a parent-directory lockfile and workspace-root inference; it still succeeds in this checkout. Only address it by setting `turbopack.root` in `next.config.ts` if the warning matters.
- Generated/ignored outputs include `.next/`, `out/`, `build/`, `next-env.d.ts`, and `*.tsbuildinfo`; do not hand-edit them.
