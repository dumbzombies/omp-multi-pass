# State

## Goal

Keep `omp-multi-pass` working on pi, pi-bolt, and omp from one codebase, with the
`authStorage.hasAuth` crash fixed and the Gemini App provider bundled.

## Progress

- Live: https://github.com/dumbzombies/omp-multi-pass, public, MIT, branch `main`.
- Runtime capability detection covers pi/pi-bolt and omp auth, registration, and
  model-refresh differences.
- Project config is host-native: `.omp/` for omp, `.pi/` for pi/pi-bolt, other dir fallback.
- Vendored pi-gemini-app 0.1.8 with LICENSE/DISCLAIMER and omp transcript fallbacks.
- `gemini-app` subscription template with native models, OAuth, tier filter, stream.
- Test fixture writes both `models.json` (pi/pi-bolt) and `models.yml` (omp).
- Verification: all 19 checks pass under omp; both extensions load and `/subs status`
  succeeds under pi-bolt and pi 1.5.2 with zero `extension_error`.

## Blockers

None. True byte-identical parity with omp is limited by missing host APIs
(auth status, provider-config introspection, model refresh composition), not by
extension code.

## Next actions

- Real `/login gemini-app` and a native Gemini turn still need a Google account; not run.
- Push any further changes to `origin main`.
