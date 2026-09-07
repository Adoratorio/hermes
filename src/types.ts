export const MODE = {
  VIRTUAL: 'virtual',
  NATIVE: 'native',
} as const;

export type MODE = (typeof MODE)[keyof typeof MODE];

export const EVENTS = {
  WHEEL: 'wheel',
  TOUCH: 'touch',
  SPACEBAR: 'spacebar',
  ARROWS: 'arrows',
  KEYS: 'keys',
  SCROLL: 'scroll',
} as const;

export type EVENTS = (typeof EVENTS)[keyof typeof EVENTS];

// Values of `KeyboardEvent.key` for the keys that scroll a page
export const KEY = {
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  SPACE: ' ',
  PAGEUP: 'PageUp',
  PAGEDOWN: 'PageDown',
  PAGESTART: 'Home',
  PAGEEND: 'End',
} as const;

export type KEY = (typeof KEY)[keyof typeof KEY];

// Multipliers applied to `WheelEvent.deltaX/Y` for each `WheelEvent.deltaMode`
// (0 = pixels, 1 = lines, 2 = pages)
export const DELTA_MODE: readonly number[] = [1, 28, 500];

export interface Vec2 {
  x: number;
  y: number;
}

export interface HermesOptions {
  mode: MODE;
  events: EVENTS[];
  root: HTMLElement | Window;
  passive: boolean;
  emitGlobal: boolean;
  touchMultiplier: number;
  keyMultiplier: number | KeyMultipliers;
  debug: boolean;
}

export interface HermesEvent {
  type: EVENTS;
  delta: Vec2;
  originalEvent: Event;
}

export type HermesHandler = (event: HermesEvent) => void;

export type KeyMultipliers = Partial<Record<KEY, number>>;
