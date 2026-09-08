# Hermes

Consistent scroll input from wheel, touch and keyboard events.

## Installation

```bash
npm install @adoratorio/hermes
```

## Usage

This package is ESM-only. Import it as a module:

```typescript
import Hermes from '@adoratorio/hermes';

const hermes = new Hermes({
  root: window,
  mode: Hermes.MODE.VIRTUAL,
  events: [Hermes.EVENTS.WHEEL, Hermes.EVENTS.TOUCH]
});

hermes.on((event) => {
  console.log(event.type, event.delta);
});
```

## Configuration

| Parameter | Type | Default | Description |
| :-------- | :--: | :-----: | :---------- |
| `mode` | `string` | `Hermes.MODE.VIRTUAL` | `VIRTUAL` uses wheel/touch/key events; `NATIVE` listens to native scroll. |
| `events` | `Array<string>` | `[WHEEL, TOUCH, KEYS]` | The events to listen to. |
| `root` | `HTMLElement \| Window`| First `.hermes-container` element | Listener root. Construction throws if neither an explicit root nor that element exists. Use `root: window` for the viewport. |
| `passive` | `boolean` | `true` | Use passive event listeners (improves perf, but prevents `preventDefault()`). |
| `emitGlobal` | `boolean` | `false` | Emit global custom events on the `window`. |
| `touchMultiplier` | `number` | `2` | Multiplier for touch values. |
| `keyMultiplier` | `number \| KeyMultipliers` | `1` | Multiplier applied to keyboard-scroll deltas, globally or per key (keyed by `Hermes.KEY`). |
| `debug` | `boolean` | `false` | Enable namespaced `console.warn` diagnostics for recoverable issues (contract violations always throw). |
| `pageSize` | `'legacy' \| 'root'` | Legacy behavior when omitted | Choose fixed legacy page scaling or the root viewport dimensions. |

Constructor options are optional, but a valid root must be resolved. In `NATIVE` mode the library listens to `scroll`, emits `Hermes.EVENTS.SCROLL` and ignores the configured virtual `events` list. No listeners are attached until `on(handler)` is called.

### Events option

* `Hermes.EVENTS.WHEEL` - wheel events, normalized across `deltaMode`s.
* `Hermes.EVENTS.TOUCH` - touch moves; the release emits one more `touch` event whose delta is the gesture momentum.
* `Hermes.EVENTS.KEYS` - every scroll key: arrows, space (shift+space scrolls up), page up/down, home/end.
* `Hermes.EVENTS.SPACEBAR` / `Hermes.EVENTS.ARROWS` - narrower key groups, used only when `KEYS` is not enabled.

Keys are matched on `KeyboardEvent.key`; the values are exposed as `Hermes.KEY` (`ArrowUp`, `PageDown`, `Home`, ...). Keys pressed inside inputs, textareas, selects and contenteditable elements are ignored.

`Hermes.KEY` maps `LEFT`, `UP`, `RIGHT`, `DOWN` to arrow key values, `SPACE` to `' '`, `PAGEUP`/`PAGEDOWN` to `'PageUp'`/`'PageDown'`, and `PAGESTART`/`PAGEEND` to `'Home'`/`'End'`. Use these values as keys in a `KeyMultipliers` object; omitted multiplier entries use `1`. Home and End use a fixed large jump independent of the key multiplier. Native button activation and modified shortcuts are preserved.

## Methods

```text
// Sets (or replaces) the handler and binds the listeners on the first call
hermes.on(handler: HermesHandler);

// Clears the handler and unbinds listeners
hermes.off();

// Alias for off()
hermes.destroy();

// Getter/Setter that gates emission on/off without unbinding
hermes.listen = false;

// Whether the listeners are currently bound
hermes.bound;

// Read the resolved listener root
hermes.root;

// Multipliers can be changed at runtime
hermes.touchMultiplier = 1.5;
hermes.keyMultiplier = { [Hermes.KEY.SPACE]: 0.5 };
```

## Events

`on(handler)`, `off()` and `destroy()` return `void`. `listen` starts as `true`, and `bound` starts as `false`. `root` and `bound` are read-only accessors. Setting `listen = false` suppresses handler and global-event delivery without removing listeners. `Hermes.isKeyEvent(type)` returns whether a group is `KEYS`, `SPACEBAR` or `ARROWS`.

The handler receives a `HermesEvent` object:

```typescript
interface HermesEvent {
  type: string;          // e.g., 'wheel', 'touch', 'keys'
  delta: Vec2;           // Normalized delta
  originalEvent: Event;  // The underlying DOM event
}
```

When `emitGlobal: true`, each delivered event is also dispatched on `window` as `hermes-<type>` (for example, `hermes-wheel` or `hermes-scroll`), with the same `HermesEvent` in `CustomEvent.detail`. The handler runs before the global event. `originalEvent` is the underlying DOM event; preventing its default action requires non-passive listeners.

## TypeScript Support

Hermes is entirely written in TypeScript and exports specific types like `HermesEvent`, `HermesOptions`, `KeyMultipliers`, and the `MODE`, `EVENTS`, `KEY` and `DELTA_MODE` constants.

## Compatibility

Imports are safe during server-side rendering. Create instances on the client after mounting. The package targets ES2023 and does not include polyfills.

## Page sizing

`pageSize: 'root'` opts in to root viewport dimensions for page-mode wheel
input, space and PageUp/PageDown. The default `pageSize: 'legacy'` preserves
existing wheel scaling and keyboard sensitivity.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, checks and pull requests.
Version history is documented in the [changelog](CHANGELOG.md) and [GitHub releases](https://github.com/Adoratorio/hermes/releases).

## Maintainers

Maintained by [Adoratorio](https://github.com/Adoratorio).

- [Andrea Gottardi](https://github.com/AndreaGottardi)
- [Daniele Borra](https://github.com/borradaniele)
- [Andrea Biason](https://github.com/biazo5)

Contributor credits are preserved in [package.json](package.json) and the Git history.

## License

[MIT](LICENSE).
