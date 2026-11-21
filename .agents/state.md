# State

## Goal

Maintain `omp-multi-pass` on pi, pi-bolt, and omp: multi-account subscriptions, Gemini
App, ClinePass, and Command Code from one package.

## Progress

- Live repo: https://github.com/dumbzombies/omp-multi-pass, branch `main`, version 1.1.0.
- `clinepass` is a multi-subscription template (`clinepass-1` ...): WorkOS CLI reuse or
  static API key, 15 curated models.
- `commandcode` is bundled as a base provider: `COMMANDCODE_API_KEY`, native
  `/alpha/generate` NDJSON stream, 25 OSS models. Not multi-account (no OAuth).
- Package registers four extensions: multi-sub, gemini-app, clinepass, commandcode.
- Vendored ClinePass relative imports converted `.js` -> `.ts` for direct TS loading.
- Verification: 19/19 checks pass; omp and pi-bolt load all extensions with zero
  `extension_error`.
- Earlier omp install is `omp-multi-pass@1.0.0`; must reinstall after this push.

## Blockers

None.

## Next actions

- Commit/push 1.1.0, then reinstall in omp: `omp plugin uninstall omp-multi-pass`,
  `omp install git:github.com/dumbzombies/omp-multi-pass`.
- Live ClinePass login (`/login clinepass` or WorkOS reuse) and a real Cline request are
  not exercised (no account); same for Command Code API-key live calls.
