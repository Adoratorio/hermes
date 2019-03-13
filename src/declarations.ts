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
}

export interface HermesOptions {
  mode : string,
  events : Array<EVENTS>,
  container : HTMLElement,
  hook : HTMLElement,
  passive : boolean,
  emitGlobal : boolean,
  touchClass : string,
}