export enum MODE {
  VIRTUAL = 'virtual',
  NATIVE = 'native',
}

export enum EVENTS {
  WHEEL = 'wheel',
  TOUCH = 'touch',
  SPACEBAR = 'spacebar',
  ARROWS = 'arrows',
  KEYS = 'keys',
  SCROLL = 'scroll',
}

export enum KEYCODE {
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  SPACE = 32,
  PAGEUP = 33,
  PAGEDOWN = 34,
  PAGESTART = 36,
  PAGEEND = 35,
}

export enum DELTA_SCALE { STANDARD = 1, OTHERS = -3 };

export const DELTA_MODE : Array<number> = [1.0, 28.0, 500.0];

export interface Vec2 {
  x : number,
  y : number,
}

export interface HermesOptions {
  mode : string,
  events : Array<EVENTS>,
  root : HTMLElement | Window,
  passive : boolean,
  emitGlobal : boolean,
  touchClass : string,
  touchMultiplier : number,
  keyMultiplier : number | KeyMultipliers,
}

export interface HermesEvent {
  type : EVENTS,
  delta : Vec2,
  originalEvent : Event,
}

export interface KeyMultipliers extends Record<number, number> {
  [KEYCODE.LEFT] : number,
  [KEYCODE.UP] : number,
  [KEYCODE.RIGHT] : number,
  [KEYCODE.DOWN] : number,
  [KEYCODE.SPACE] : number,
  [KEYCODE.PAGEUP] : number,
  [KEYCODE.PAGEDOWN] : number,
  [KEYCODE.PAGESTART] : number,
  [KEYCODE.PAGEEND] : number,
}