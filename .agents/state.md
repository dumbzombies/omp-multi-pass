# State

## Goal

Maintain `omp-multi-pass` on pi, pi-bolt, and omp: multi-account subscriptions, Gemini
App, ClinePass, Cline accounts, Command Code, and Kilo from one package.

## Progress

- Live repo: https://github.com/dumbzombies/omp-multi-pass, branch `main`.
- Version `1.3.0` (Kilo integration); installed version may still be 1.2.0.
- `/subs add` and `/subs login` now complete OAuth in place, write `auth.json`, refresh
  models. No `/login` detour.
- `cline`: Cline account/credits provider, 17 frontier/free models, `cline-N`
  subscriptions, same WorkOS/API-key auth as ClinePass.
- `clinepass`: curated 15-model ClinePass roster, `clinepass-N` subscriptions.
- `commandcode`: base provider, `COMMANDCODE_API_KEY`; Go $1 plan works via
  `/alpha/generate`.
- `kilo`: Kilo Gateway provider plus `kilo-N` subscriptions. Device OAuth,
  live catalog from `https://api.kilo.ai/api/gateway/models`, native Responses
  transport on older pi-ai, organization headers per account.
- `extensions/multi-sub.ts` default export is async because Kilo registration
  fetches its catalog; all host loads await it.
- Verification: 19/19 checks pass; omp + pi-bolt load all five extensions with
  zero `extension_error`.

## Blockers

None.

## Next actions

- Live Cline/ClinePass OAuth and real model calls still need a real account; not run.
- Restart omp to load the Kilo build in a running session.
