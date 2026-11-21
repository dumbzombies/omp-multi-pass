# Repository Guidelines

## Project Overview

`omp-multi-pass` is an extension for **pi**, **pi-bolt**, and **oh-my-pi (omp)**. It manages
multiple OAuth subscriptions per provider (Anthropic, Codex, Copilot, Google, Antigravity,
MiniMax, Gemini App), plus rotation pools, fallback chains, model presets, project
restrictions, limits checks, routing traces, and offline OAuth sharing.

It is a fork of [hjanuschka/pi-multi-pass](https://github.com/hjanuschka/pi-multi-pass)
and bundles [ShawTim/gemini-app2api](https://github.com/ShawTim/gemini-app2api) as a second
extension. MIT; attribution in `NOTICE`.

## Architecture & Data Flow

```
host factory -> load config -> register subscription providers -> runtime routing
```

- `extensions/multi-sub.ts` default export receives the host extension API (`pi`) and:
  - registers commands `/subs`, `/pool`, `/mp-preset`;
  - registers providers `minimax-2`, `openai-codex-3`, `gemini-app-1`, ... via
    `pi.registerProvider(name, registration)`;
  - subscribes to `session_start`, `model_select`, `input`, `before_agent_start`, `agent_end`;
  - installs status/footer and model filtering hooks.
- Config load: host agent dir `multi-pass.json` (global), project config (host-native
  `.omp/` or `.pi/`, other dir as fallback), and `MULTI_SUB` env merges.
- Startup registration clones the base provider catalog plus `models-store.json`
  overlay into each subscription provider. Model lists are refreshed where the host
  supports it; omp does not recompose extension providers, hence the startup merge.
- Routing selects a subscription, applies pools/chains/project restrictions, and
  retries with the next candidate on rate limits or failures.
- Auth is read from the host `auth.json` through a compatibility layer. Do not assume
  `modelRegistry.authStorage`, `getProviderAuthStatus`, or `getRegisteredProviderConfig`
  exist; omp exposes none of them.
- `vendor/gemini-app2api/extensions/pi/` registers the base `gemini-app` provider,
  `/login gemini-app`, `/gemini-quota`, and the native HTTP/2 stream handler.
  `extensions/multi-sub.ts` imports its model catalog, OAuth adapter, and stream handler
  to expose Gemini App as normal subscriptions.

## Key Directories

| Path | Purpose |
|---|---|
| `extensions/multi-sub.ts` | Entire subscription manager; one large module by design |
| `lib/model-choices.ts` | Catalog merge/filter helpers, MiniMax preference rules |
| `lib/share.ts` | Offline OAuth share string/QR protocol |
| `vendor/gemini-app2api/` | Vendored Gemini App extension, `src/`, LICENSE, DISCLAIMER |
| `tests/` | Plain Node check scripts, no test framework |
| `tests/fixtures/` | RPC model fixture and MiniMax routing fixture |
| `docs/` | Share protocol and header SVG |

## Development Commands

```bash
npm install                      # deps; host provides @earendil-works/pi-*

node tests/omp-compat-check.mjs  # auth compat + both extensions load
node tests/model-choices-check.mjs

# full suite
for f in tests/*-check.mjs; do node "$f" || break; done
```

No build step, bundler, lint, or `npm test`. TypeScript is loaded directly by the host;
tests rely on Node type stripping. Host packages (`@earendil-works/pi-ai`,
`pi-coding-agent`) resolve from the host or a linked `node_modules`.

## Code Conventions & Common Patterns

- Tabs for indentation, double quotes, semicolons; async/await throughout.
- Match the sections already in `extensions/multi-sub.ts` rather than adding new
  abstractions. Helpers live near their subsystem; avoid new files unless scoped.
- Imports use `"path"`, `"fs"`, `"os"` style (no `node:` prefix) for host compatibility.
- Host capability detection is mandatory: check method existence and fall back.
  Never call `authStorage.hasAuth` or `getRegisteredProviderConfig` unguarded.
- Config writes: `proper-lockfile` + temp write + `renameSync`; preserve unknown fields.
- User-facing failures go through `ctx.ui.notify`/status, never swallowed silently.
- Model metadata: base catalog from `getBuiltinModels`, merge remote
  `models-store.json` overlay; extension providers without a builtin catalog use
  `PROVIDER_TEMPLATES[provider].models`.
- Keep vendored upstream files intact except documented adapters in
  `vendor/gemini-app2api/extensions/pi/index.js`.
- Do not commit secrets or merge the split public OAuth client secret literal.

## Important Files

| File | Why |
|---|---|
| `package.json` | `pi.extensions`, files list, deps, ESM `"type": "module"` |
| `extensions/multi-sub.ts` | Commands, provider registration, routing, config, auth |
| `lib/model-choices.ts` | `subscriptionCatalog`, `ordinaryModelChoices`, MiniMax ranking |
| `vendor/gemini-app2api/extensions/pi/index.js` | omp adapter for transcript helpers |
| `tests/fixtures/test-model.mjs` | Dummy `test/dummy` provider; writes `models.json` and `models.yml` |
| `tests/fixtures/minimax-choices.ts` | RPC fixture for routing/model-selection tests |
| `NOTICE` | Upstream attribution |
| `.agents/state.md` | Current status; read before substantive work |

## Runtime/Tooling Preferences

- Runtime: Node ESM (Node 26 tested); pi / pi-bolt / omp provide the extension API.
- Package manager: npm, lockfile v3. `typescript` and `@types/*` are dev-only.
- No emitted JS, no build artifacts; publish `extensions/`, `lib/`, `vendor/`, `docs/`.
- Host config dirs: `~/.omp/agent` (omp), `~/.pi/agent` (pi/pi-bolt).
- Test models: pi/pi-bolt read `models.json`; omp reads `models.yml`.

## Testing & QA

- 19 `tests/*-check.mjs` scripts using `node:assert/strict`; no framework.
- Tests spawn the host in RPC mode with `--offline`, a temp `PI_CODING_AGENT_DIR`,
  dummy `test/dummy` model, and explicit extensions.
- `tests/omp-compat-check.mjs` reproduces both broken `authStorage` shapes and asserts
  Gemini App base/subscription registration.
- RPC tests currently spawn `omp`; pi/pi-bolt compatibility is verified manually by
  loading both extensions and running `/subs status`.
- Live Google login, native Gemini turns, and real provider calls are not tested
  (require accounts/network).
- After a change: run the closest check, then `node tests/omp-compat-check.mjs`; run the
  full suite for shared routing/auth/config changes.
