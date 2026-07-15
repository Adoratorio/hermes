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

export const KEYCODE = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
  PAGEUP: 33,
  PAGEDOWN: 34,
  PAGESTART: 36,
  PAGEEND: 35,
} as const;

export type KEYCODE = (typeof KEYCODE)[keyof typeof KEYCODE];

export const DELTA_SCALE = {
  STANDARD: 1,
  OTHERS: -3,
} as const;

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
  touchClass: string;
  touchMultiplier: number;
  keyMultiplier: number | KeyMultipliers;
}

export interface HermesEvent {
  type: EVENTS;
  delta: Vec2;
  originalEvent: Event;
}

export type HermesHandler = (event: HermesEvent) => void;

export interface KeyMultipliers extends Record<number, number> {
  [KEYCODE.LEFT]: number;
  [KEYCODE.UP]: number;
  [KEYCODE.RIGHT]: number;
  [KEYCODE.DOWN]: number;
  [KEYCODE.SPACE]: number;
  [KEYCODE.PAGEUP]: number;
  [KEYCODE.PAGEDOWN]: number;
  [KEYCODE.PAGESTART]: number;
  [KEYCODE.PAGEEND]: number;
}
