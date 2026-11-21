# omp-multi-pass

oh-my-pi (omp) fork of [pi-multi-pass](https://github.com/hjanuschka/pi-multi-pass), with
[ShawTim/gemini-app2api](https://github.com/ShawTim/gemini-app2api) bundled as a second
extension. MIT; see `NOTICE`.

Read `.agents/state.md` for status, then `.agents/memory.md` for durable knowledge.

## Layout

| Path | Role |
|---|---|
| `extensions/multi-sub.ts` | Subscription manager: `/subs`, `/pool`, `/mp-preset`, auth compat, pools, chains, routing |
| `lib/model-choices.ts` | Catalog filtering and MiniMax preference helpers |
| `lib/share.ts` | Offline OAuth share format |
| `vendor/gemini-app2api/` | Vendored pi-gemini-app provider extension + upstream LICENSE/DISCLAIMER |
| `tests/*-check.mjs` | Plain Node check scripts |
| `tests/fixtures/test-model.mjs` | Dummy `test/dummy` model so omp RPC tests start without a login |

## Commands

```bash
node tests/omp-compat-check.mjs
node tests/model-choices-check.mjs
node tests/minimax-choices-check.mjs
```

No build step; omp loads TypeScript directly. Tests import `.ts` via Node type stripping.
Install deps with `npm install`. Host packages `@earendil-works/pi-*` are provided by omp;
for local Node tests, link them from the omp plugin node_modules if unavailable.

## Conventions

- Global config: `~/.omp/agent/multi-pass.json`; credentials `~/.omp/agent/auth.json`.
- Project config: host-native dir first (`.omp`, `.pi`), other one fallback.
- Never trust `modelRegistry.authStorage` without checking `hasAuth`/`get`; omp exposes
  no `authStorage` and older objects have no `hasAuth`.
- Extension-provided models (gemini-app) are absent from the pi-ai builtin catalog;
  resolve them through `PROVIDER_TEMPLATES[provider].models`.
- Keep vendored upstream files intact apart from the documented omp adapter in
  `vendor/gemini-app2api/extensions/pi/index.js`.
- After a large verified change, update `.agents/state.md` and `.agents/memory.md`.
