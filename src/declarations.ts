export enum MODE {
  VIRTUAL = 'virtual',
  FAKE = 'fake',
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
  container : HTMLElement | Window,
  hook : HTMLElement,
  passive : boolean,
  emitGlobal : boolean,
  touchClass : string,
  touchMultiplier : number,
}

export interface HermesEvent {
  type : EVENTS,
  delta : Vec2,
  originalEvent : Event,
}
