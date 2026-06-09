# Repository Instructions

## Next.js

- This is a Next.js 16.2.7 App Router project. Read the relevant local doc under `node_modules/next/dist/docs/` before changing Next APIs or file conventions; older Next assumptions can be wrong here.
- Entrypoints are `app/layout.tsx`, `app/page.tsx`, and `app/globals.css`; there is no `src/` or `pages/` tree.
- Tailwind is v4 through `@tailwindcss/postcss`; theme tokens live in `app/globals.css` with `@theme inline`. Do not add a Tailwind v3 config unless a change truly needs one.
- Alias `@/*` maps to the repository root, not `src/`.

## Portfolio Direction

- Build this as a single-page personal portfolio centered on an animated, low-poly, Earth-recognizable globe with playful/adventurous styling.
- Use the globe as the primary navigation surface: clickable location markers should open info cards for projects, skills, travel, life, or stories.
- Initial required markers are Lusaka, Zambia and London, England; keep marker data easy to extend rather than hard-coding copy into the scene.
- Prefer a hybrid visual language: recognizable Earth geography, but stylized/fantasy lighting, atmosphere, stars, and card treatments instead of a corporate portfolio look.

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
