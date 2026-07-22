# Hermes

A utility library for scroll, wheel, keyboard, and touch event normalization.

## Installation

```bash
npm install @adoratorio/hermes
```

## Usage

This package is ESM-only. Import it as a module:

```typescript
import Hermes from '@adoratorio/hermes';

const hermes = new Hermes({
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
| `root` | `HTMLElement \| Window`| fallback | The DOM element used as the event listener root. |
| `passive` | `boolean` | `true` | Use passive event listeners (improves perf, but prevents `preventDefault()`). |
| `emitGlobal` | `boolean` | `false` | Emit global custom events on the `window`. |
| `touchMultiplier` | `number` | `2` | Multiplier for touch values. |
| `keyMultiplier` | `number \| obj` | `1` | Multiplier applied to keyboard-scroll deltas. |
| `debug` | `boolean` | `false` | Enable namespaced `console.warn` diagnostics for recoverable issues (contract violations always throw). |

## Methods

```typescript
// Binds listeners and calls the handler on every event
hermes.on(handler: HermesHandler);

// Clears the handler and unbinds listeners
hermes.off();

// Alias for off()
hermes.destroy();

// Getter/Setter that gates emission on/off without unbinding
hermes.listen = false;
```

## Events

The handler receives a `HermesEvent` object:

```typescript
interface HermesEvent {
  type: string;          // e.g., 'wheel', 'touch', 'keys'
  delta: Vec2;           // Normalized delta
  originalEvent: Event;  // The underlying DOM event
}
```

## TypeScript Support

Hermes is entirely written in TypeScript and exports specific types like `HermesEvent`, `HermesOptions`, and standard constants.