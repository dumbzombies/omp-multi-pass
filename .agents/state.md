# State

## Goal

Maintain the published oh-my-pi fork (`omp-multi-pass`) with the `authStorage.hasAuth`
crash fixed and the Gemini App provider bundled as a normal and extra subscription.

## Progress

- Live: https://github.com/dumbzombies/omp-multi-pass, public, MIT, branch `main`.
- omp metadata, ESM package, `.omp/` config paths, `.pi/` project fallback.
- Auth compatibility: duck-typed `authStorage`, direct `auth.json` reads, logout fallback.
- Vendored pi-gemini-app 0.1.8 with LICENSE/DISCLAIMER and omp transcript fallbacks.
- `gemini-app` subscription template with native models, OAuth, tier filter, stream.
- Subscription catalogs merge `models-store.json` at registration; catalog filtering works
  without omp's missing registration introspection.
- RPC tests run on `omp` with a dummy model fixture.
- Verification: all 19 `tests/*-check.mjs` pass; both extensions load in omp RPC with no
  `extension_error`.
- GitHub push protection workaround documented in `memory.md`: public OAuth client secret
  is split into two literals, not merged.

## Blockers

None.

## Next actions

- Real `/login gemini-app` and a native Gemini turn still need a Google account; not run.
- Any further changes: commit and push to `origin main`.
