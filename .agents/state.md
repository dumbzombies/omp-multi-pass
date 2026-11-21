# State

## Goal

Maintain `omp-multi-pass` on pi, pi-bolt, and omp: multi-account subscriptions, Gemini
App, ClinePass, Cline accounts, Command Code, and Kilo from one package.

## Progress

- Live repo: https://github.com/dumbzombies/omp-multi-pass, branch `main`.
- Version `1.3.1`; local source verified, package reinstall pending.
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

## Blockers

None in code. The previously stored `kilo-2` credential is no longer in omp's
`auth.json` or `agent.db`, so a real Kilo model call needs `/subs add` or
`/subs login` again before live auth can be re-verified.

## Next actions

- Commit, push, run `omp install git:github.com/dumbzombies/omp-multi-pass`,
  restore the Kilo subscription if desired, and restart omp.
- Live Cline/ClinePass/Kilo OAuth model calls still need real accounts.
