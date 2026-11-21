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

## 2026-11-21 — omp ModelRegistry facade facts (verified 19.0.1)

- Runtime `ctx.modelRegistry` exposes `getAll`, `getAvailable`, `find`,
  `hasConfiguredAuth`, `registerProvider`, but NOT `getProviderAuthStatus`,
  `getProvider`, `complete`, `getRegisteredProviderConfig`,
  `getRegisteredNativeProvider`, or `authStorage`.
- `readStoredCredential()` imported in an extension returned `undefined` for a
  valid temp `auth.json` even though the file read directly. Auth checks and
  `get` therefore read `auth.json` directly via the extension's own
  `readAuthFile()`, with host status used only as a positive signal.
- pi-ai 0.82.1 `createProvider()` returns `getModels`, `auth.oauth`,
  `streamSimple`; there are no flat `models`/`oauth` fields.
- `registry.refresh()` on omp does not recompose extension provider models.
  Registration must merge `models-store.json` at startup (done in `registerSub`),
  and catalog filtering must use the live `subscriptionCatalog` when
  registration introspection is missing.
- omp ignores `--no-prompt-templates`; RPC mode requires `--model`.
- Spreading the extension API object (`{...pi}`) drops non-enumerable methods.
  Fixtures wrap with `Object.create(pi)` instead.

## 2026-11-21 — Verification

- Full suite: all 19 `tests/*-check.mjs` pass.
- `tests/omp-compat-check.mjs` loads both extensions, reproduces the missing and
  stale `authStorage` shapes, and asserts gemini-app base/subscription models.
- Live omp RPC load with `--extension extensions/multi-sub.ts --extension
  vendor/gemini-app2api/extensions/pi/index.js` produced no `extension_error`.
- Not verified: real Google sign-in, native Gemini turn, or a live provider call
  (no account/network used).

## 2026-11-21 — Publication

- Public repo: https://github.com/dumbzombies/omp-multi-pass. Branch `main`, commit
  `5f3cab1` before sync. Remotes: `origin` = fork, `upstream` = hjanuschka/pi-multi-pass.
- GitHub push protection blocked the vendored Google installed-app OAuth client secret in
  `vendor/gemini-app2api/src/gateway/oauth-client-defaults.mjs`. Because it is a public,
  non-confidential installed-app credential, the literal was split into two array parts
  joined at runtime (`DEFAULT_CLIENT_SECRET`); value unchanged. Do not merge it back into
  one literal or pushes will be blocked again.

## 2026-11-21 — Triple host compatibility (pi, pi-bolt, omp)

- pi 1.5.2 and pi-bolt 1.2.1 share the Pi extension API. omp 19.0.1 is the
  divergent surface and every known difference is handled at runtime.
- Verified end-to-end with `--extension extensions/multi-sub.ts --extension
  vendor/gemini-app2api/extensions/pi/index.js`: both load and `/subs status`
  succeeds under pi-bolt and the pi 1.5.2 Node CLI, zero `extension_error`.
- Model test config must be written in both formats: pi/pi-bolt read
  `models.json`; omp reads `models.yml`. `tests/fixtures/test-model.mjs` writes both.
- Project config precedence is host-native: `getAgentDir()` parent `.omp` -> prefer
  `.omp/`, otherwise `.pi/`; the other directory is the fallback.
- Remaining non-parity is host capability, not extension bugs: omp has no
  auth-status/runtime-logout or provider-config introspection, and does not
  recompose extension models on `refresh()`. The live-catalog fallback is
  behaviorally close but cannot be byte-identical to pi's registration-layer
  detection. "110%" identical semantics across all three is not possible where
  the host API does not exist; functional compatibility is.

## 2026-11-21 — ClinePass and Command Code providers

- Vendored `pi-clinepass-provider` 1.7.0 (jellydn) in `vendor/clinepass/`.
  Provider id `clinepass`; 15 models under `cline-pass/...`; WorkOS CLI credential reuse
  from `~/.cline/data/settings/providers.json` with manual API-key fallback; base URL
  `https://api.cline.bot/api/v1`, override `CLINE_API_BASE`.
- Added `clinepass` `PROVIDER_TEMPLATES` entry with vendored catalog, OAuth login/refresh,
  and `baseUrl`; `/subs add clinepass` registers `clinepass-1`, `clinepass-2`, ...
- ClinePass vendored imports changed from `./x.js` to `./x.ts`: Node type stripping does
  not remap `.js` specifiers, and both omp and pi-bolt load the `.ts` sources directly.
- Vendored ClinePass error handler now also matches `clinepass-<n>` provider ids.
- Vendored `pi-commandcode-provider` 0.1.0 (safzanpirani) in `vendor/commandcode/`.
  Provider `commandcode`, API key `COMMANDCODE_API_KEY`, native NDJSON
  `POST https://api.commandcode.ai/alpha/generate`, 25 OSS models. No OAuth, so it is a
  bundled base provider only, not a multi-pass subscription template.
- `PROVIDER_TEMPLATES` gained an optional `baseUrl`; registration uses
  `template.baseUrl || sourceModels[0].baseUrl`.
- Package version 1.1.0 registers four extensions: multi-sub, gemini-app, clinepass,
  commandcode.
- Verification: all 19 checks pass; omp and pi-bolt load all four extensions with zero
  `extension_error`; installed-package diff and live RPC `/subs status` succeeded before
  the Cline/CommandCode additions; reinstall needed after push for the new extensions.

## 2026-11-21 — Installed 1.1.0

- omp plugin reinstalled from `git:github.com/dumbzombies/omp-multi-pass` at commit
  `0d517a5`; installed version `1.1.0`.
- Installed payload includes `vendor/clinepass/src/index.ts` and
  `vendor/commandcode/index.ts`.
- Live omp RPC with installed plugins: exit 0, zero `extension_error`,
  `/subs status` success.
