# Next.js version pinned deliberately

This project was originally scaffolded on Next.js 16, but is pinned to **15.5.22** (see `package.json`) because Vercel's `@vercel/next` builder currently rejects Next 16 production builds with a misleading "No entrypoint found" error, even though `next build` itself succeeds locally and in CI — a known, currently-unresolved Vercel/Next 16 compatibility issue (see `DEVLOG.md`). Do not bump `next`/`eslint-config-next` past the 15.x line without first confirming Vercel deploys succeed.
