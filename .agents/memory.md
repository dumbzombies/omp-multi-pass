# Memory

## 2026-11-21 — Fork created and converted to oh-my-pi

- omp-multi-pass v1.0.0 is a fork of pi-multi-pass v1.14.0 by hjanuschka. Upstream remote
  is `upstream`; the public origin is `github.com/dumbzombies/omp-multi-pass`.
- Bundled `pi-gemini-app` 0.1.8 (ShawTim/gemini-app2api) under `vendor/gemini-app2api/`,
  including its LICENSE, DISCLAIMER.md and README. Attribution in `NOTICE` and README.
- Package registers two extensions: `./extensions` and
  `./vendor/gemini-app2api/extensions/pi/index.js`. `"type": "module"` added.
- Environment inspected: omp 19.0.1, hosted `@earendil-works/pi-*` 0.82.1.

## 2026-11-21 — Auth compatibility fix

- Crash was `authStorage.hasAuth is not a function` in `/subs`. Root cause: the extension
  trusted any truthy `modelRegistry.authStorage`; hosts may expose an object with only
  `get`/`set` (no `hasAuth`), and omp exposes no `authStorage` at all.
- Fix in `getAuthStorage`: duck-type `hasAuth` + `get`; otherwise use
  `getProviderAuthStatus()` / `readStoredCredential()`. Logout falls back to
  host `runtime.logout` or a locked edit of `auth.json`.
- Config path: `.omp/multi-pass.json` preferred, `.pi/multi-pass.json` still read.

## 2026-11-21 — Gemini App integration facts

- Native Gemini App models are exactly: `gemini-neon` (mode 3), `gemini-hydrogen`
  (mode 1), `gemini-flash-lite` (mode 6), plus `gemini-auto` (host-side selection).
  `gemini-argon` is a temporary alias for `gemini-neon`. `gemini-argon-thinking` and
  `gemini-flash` are internal/legacy wire names, not selectable models.
- Free-tier accounts only expose `gemini-auto`; `filterGeminiModels` enforces this.
- The provider's pi-ai helpers `getCurrentSystemPrompt`, `getCurrentTools`,
  `toToolDeclaration` are absent in omp's pi-ai 0.82.1. The vendored `index.js` now falls
  back to `transcript.js` implementations.
- Multi-account support: `gemini-app` is a `PROVIDER_TEMPLATES` entry with vendored
  models, its own OAuth adapter, `modifyModels` tier filter, and `streamSimple` from the
  vendored stream handler. Subscription ids are `gemini-app-1`, `gemini-app-2`, ...
- Native provider registration differs: `createProvider()` returns an object with
  `getModels()`, `auth.oauth`, and no flat `models`/`oauth` fields.

## 2026-11-21 — Test harness conversion

- RPC tests now spawn `omp` instead of `pi`; omp rejects `--no-prompt-templates`, which
  was removed.
- omp requires a selected model in RPC mode. `tests/fixtures/test-model.mjs` writes a
  dummy `test/dummy` provider into the temp agent dir and tests pass `--model test/dummy`.
- `tests/fixtures/minimax-choices.ts` must not spread the extension API object: omp's
  methods are not enumerable, so the fixture wraps it with `Object.create(pi)`.
- `tests/omp-compat-check.mjs` exercises the exact crash shapes: no `authStorage`, and a
  stale object with only `get`. It also loads both extensions and asserts the gemini-app
  base provider and subscription registration.
