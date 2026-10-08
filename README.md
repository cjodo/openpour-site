# OpenPour — site

The landing page for [OpenPour](https://github.com/cjodo/openpour), the
open-source automatic pour-over coffee machine.

This repository holds only the website. The machine itself — CAD, firmware,
control app, BOM and build guides — lives in
[`cjodo/openpour`](https://github.com/cjodo/openpour).

## Stack

- [TanStack Start](https://tanstack.com/start) v1 (React 19, SSR/SSG, Vite 8)
- [Tailwind CSS](https://tailwindcss.com) v4 — theme tokens live in
  `src/styles.css`, loaded through native CSS `@import`
- [lucide-react](https://lucide.dev) for icons
- TypeScript, ESLint, Prettier, Vitest

## Run it

```sh
bun install
bun run dev      # http://localhost:8080
bun run build    # production build
bun run test     # route smoke test
bun run lint
```

`bun` is preferred (there is a `bun.lock`); `npm install && npm run dev` works
too.

## Layout

```text
src/routes/index.tsx    the whole page — nav, hero, how it works, features,
                        build steps, repo table, CTA, footer
src/routes/__root.tsx   document shell: fonts, page metadata, 404 and error screens
src/styles.css          design tokens (dark base, amber primary) and the
                        blueprint-grid / glow-amber utilities
src/assets/*.jpg        the two product images
src/server.ts           SSR error wrapper
src/test/               route smoke test
```

The page is a single route with anchor navigation (`#how`, `#features`,
`#build`) — no client state, no data fetching, so it renders as static HTML.

Editing copy? Almost everything visible is a plain string array near the top of
`src/routes/index.tsx`: `features`, `buildSteps`, `repoRows`.

## Deploying

`bun run build` emits a Nitro/Cloudflare-Workers bundle. Any static or
edge host works; the site has no backend, no environment variables and no
build-time secrets.

## Licence

Not yet declared. Add one here if the site should share the machine's licence.
