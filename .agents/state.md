# State

## Goal

Maintain `omp-multi-pass` on pi, pi-bolt, and omp: multi-account subscriptions, Gemini
App, ClinePass, Cline accounts, Command Code, and Kilo from one package.

## Progress

- Live repo: https://github.com/dumbzombies/omp-multi-pass, branch `main`.
- Version `1.3.1`, commit `311f463`, pushed to `main`.
- Installed/linked locally with `omp install . --force`; `omp plugin list`
  reports `omp-multi-pass@1.3.1` and the installed tree resolves to this repo.
- `/subs` menus use native `ctx.ui.select`; every action is wrapped so a failure
  notifies instead of crashing. The top menu shows account/login counts and the
  current model, with Settings and Share & import submenus.
- OAuth logins now persist to omp's `agent.db` credential store
  (`authStorage.credentials.upsertOAuth`) and to `auth.json`. Session start
  migrates `auth.json` into that store, including API keys. Token keeper
  refreshes mirror back into the store.
- Login URLs and device-code verification pages auto-open through
  `termux-open-url`/`open`/`cmd start`/`xdg-open`; failures are non-fatal.
- `/subs status` notifies instead of blocking outside TUI.
- Tests updated for omp 18.12.6: removed `--offline`/`--no-context-files`,
  fixture extensions passed with `--extension`; 19/19 checks pass.
- Kilo integration unchanged from 1.3.0.
- Installed plugin load-tested in omp RPC: zero `extension_error`.

## Blockers

None in code. The previously stored `kilo-2` credential is no longer in omp's
`auth.json` or `agent.db`, so a real Kilo model call needs `/subs add` or
`/subs login` again before live auth can be re-verified.

## Next actions

- Restore the Kilo subscription with `/subs add`, then restart omp to load
  the current extension build.
- Live Cline/ClinePass/Kilo OAuth model calls still need real accounts.
