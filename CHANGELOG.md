# Changelog

This file records changes from 2.0.0 onward. See [GitHub releases](https://github.com/Adoratorio/hermes/releases) for published release notes. Dates are shown where a matching GitHub release exists.

## Unreleased

### Documentation

- Clarify the default root, page sizing, native mode, runtime accessors and global event payloads.

- Refine contributor guidance and release notes; consolidate maintainer contacts in the README.

## [2.0.0](https://github.com/Adoratorio/hermes/releases/tag/v2.0.0) — 2026-09-08

### Breaking changes

- Use native ES modules; CommonJS builds are not provided.
- `KEYCODE` replaced by `KEY` (`KeyboardEvent.key` values); `KeyMultipliers` keyed by `KEY`.
- Legacy `mousewheel` listener and `wheelDelta` fallback removed.

### Changes

- Add a `debug` option and consistent `[Hermes]` errors.
- One keydown listener maps keys to the enabled group (`keys`, `spacebar`, `arrows`); only scroll keys are reported and shift+space scrolls up.
- `on()` replaces the handler instead of throwing; `listen`, `bound`, `root`, `touchMultiplier` and `keyMultiplier` accessors.
- `passive` is honoured for keydown listeners.
- Add optional root-relative page sizing without changing legacy defaults.
- Do not emit momentum when a touch gesture is cancelled or held still before release.
- Preserve native button activation, modified shortcuts and editing inside open shadow roots.

### Maintenance

- Update the development toolchain to TypeScript 7.
- Include source files and inline source maps for consumer debugging.
- Typecheck tests and verify packed exports.
