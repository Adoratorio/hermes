# Changelog

## 2.0.0

- ESM-only, TypeScript 7 toolchain, `debug` option, unified `[Hermes]` errors.
- One keydown listener maps keys to the enabled group (`keys`, `spacebar`, `arrows`); only scroll keys are reported and shift+space scrolls up.
- `KEYCODE` replaced by `KEY` (`KeyboardEvent.key` values); `KeyMultipliers` keyed by `KEY`.
- Legacy `mousewheel` listener and `wheelDelta` fallback removed.
- `on()` replaces the handler instead of throwing; `listen`, `bound`, `root`, `touchMultiplier` and `keyMultiplier` accessors.
- `passive` is honoured for keydown listeners.
- Add optional root-relative page sizing without changing legacy defaults.
- Do not emit momentum when a touch gesture is cancelled or held still before release.
- Preserve native button activation, modified shortcuts and editing inside open shadow roots.
- Include source files and inline source maps for consumer debugging.
- Typecheck tests, verify packed exports, and document active maintainers separately from contributors.
