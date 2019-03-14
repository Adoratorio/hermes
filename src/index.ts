import {
  MODE,
  EVENTS,
  HermesOptions,
  HermesEvent,
  Vec2,
  KEYCODE,
} from './declarations';
import { normalizeDelta } from './utils';

class Hermes {
  static MODE = MODE;
  static EVENTS = EVENTS;
  static KEYCODE = KEYCODE;

  private options : HermesOptions;
  private handler : Function = () => {};
  private listening : boolean = true;
  private binded : boolean = false;
  private touchStartPosition : Vec2 = { x: 0, y: 0 };
  private lastScrollPosition : Vec2 = { x: 0, y: 0 };

  constructor(options : Partial<HermesOptions>) {
    const defaults = {
      mode: Hermes.MODE.VIRTUAL,
      events: [
        Hermes.EVENTS.WHEEL,
        Hermes.EVENTS.TOUCH,
        Hermes.EVENTS.KEYS,
      ],
      container: document.querySelector('.hermes-container') as HTMLElement,
      hook: document.querySelector('.hermes-hook') as HTMLElement,
      passive: true,
      emitGlobal: false,
      touchClass: '.prevent-touch',
    }
    this.options = {...defaults, ...options};

    if ((options.mode === Hermes.MODE.VIRTUAL || options.mode === Hermes.MODE.NATIVE)
       && typeof options.container === 'undefined') {
      throw new Error('Container cannot be undefined');
    }
    if (options.mode === Hermes.MODE.FAKE && typeof options.hook === 'undefined') {
      throw new Error('Hook cannot be undefined');
    }
  }

  private bind() {
    if (this.options.mode === Hermes.MODE.VIRTUAL) {
      this.options.events.forEach((event) => {
        switch (true) {
          case event === 'wheel':
            this.options.container.addEventListener('wheel', this.wheel, { passive: this.options.passive });
            this.options.container.addEventListener('mousewheel', this.wheel);
            break;

          case event === 'touch':
            this.options.container.addEventListener('touchstart', this.touchStart);
            this.options.container.addEventListener('touchend', this.touchEnd);
            break;

          case event === 'keys':
            this.options.container.addEventListener('keydown', this.keydownAll);
            break;

          case event === 'spacebar' && this.options.events.indexOf(Hermes.EVENTS.KEYS) < 0:
            this.options.container.addEventListener('keydown', this.keydownSpacebar);
            break;

          case event === 'arrows' && this.options.events.indexOf(Hermes.EVENTS.KEYS) < 0:
            this.options.container.addEventListener('keydown', this.keydownArrows);
            break;

          default:
            console.warn(`'${event}' is not recognized`);
        }
      });
    } else if (this.options.mode === Hermes.MODE.NATIVE) {
      this.options.container.addEventListener('scroll', this.scroll, { passive: this.options.passive });
      const w = this.options.container as Window;
      this.lastScrollPosition = { x: w.pageXOffset, y: w.pageYOffset };
    } else if (this.options.mode === Hermes.MODE.FAKE) {
      this.options.hook.addEventListener('scroll', this.scroll, { passive: this.options.passive });
    } else {
      console.warn(`'${this.options.mode}' is not a supported mode`);
    }
  }

  private unbind() : void {

  }

  private wheel : any = (event : WheelEvent) : void => {
    const delta : Vec2 = normalizeDelta(event);

    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.WHEEL,
      delta,
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private scroll : any = (event : UIEvent) : void => {
    const w = this.options.container as Window;
    const delta = {
      x: w.pageXOffset - this.lastScrollPosition.x,
      y: w.pageYOffset - this.lastScrollPosition.y,
    }
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.WHEEL,
      delta,
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private keydownAll : any = (event : KeyboardEvent) : void => {
    let delta : Vec2 = { x: 0, y: 0 };
    if (event.keyCode === Hermes.KEYCODE.SPACE) {
      delta = { x: 0, y: window.innerHeight };
    }
    if (event.keyCode === Hermes.KEYCODE.DOWN) {
      delta = { x: 0, y: 80 };
    }
    if (event.keyCode === Hermes.KEYCODE.UP) {
      delta = { x: 0, y: -80 };
    }
    if (event.keyCode === Hermes.KEYCODE.RIGHT) {
      delta = { x: 80, y: 0 };
    }
    if (event.keyCode === Hermes.KEYCODE.LEFT) {
      delta = { x: -80, y: 0 };
    }
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.KEYS,
      delta,
      originalEvent: event,
    };
    
    this.callHandler(customEvent);
  }
  
  private keydownSpacebar : any = (event : KeyboardEvent) : void => {
    let delta : Vec2 = { x: 0, y: 0 };
    if (event.keyCode === Hermes.KEYCODE.SPACE) {
      delta = { x: 0, y: window.innerHeight };
    }
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.SPACEBAR,
      delta,
      originalEvent: event,
    };
    
    this.callHandler(customEvent);
  }
  
  private keydownArrows : any = (event : KeyboardEvent) : void => {
    let delta : Vec2 = { x: 0, y: 0 };
    if (event.keyCode === Hermes.KEYCODE.DOWN) {
      delta = { x: 0, y: 80 };
    }
    if (event.keyCode === Hermes.KEYCODE.UP) {
      delta = { x: 0, y: -80 };
    }
    if (event.keyCode === Hermes.KEYCODE.RIGHT) {
      delta = { x: 80, y: 0 };
    }
    if (event.keyCode === Hermes.KEYCODE.LEFT) {
      delta = { x: -80, y: 0 };
    }
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.ARROWS,
      delta,
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private touchStart : any = (event : TouchEvent) : void => {
    this.options.container.addEventListener('touchmove', this.touchMove);
    this.touchStartPosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  private touchMove : any = (event : TouchEvent) : void => {
    const delta : Vec2 = {
      x: -(event.touches[0].clientX - this.touchStartPosition.x),
      y: -(event.touches[0].clientY - this.touchStartPosition.y),
    };

    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.TOUCH,
      delta,
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private touchEnd : any = (event : TouchEvent) : void => {
    this.options.container.removeEventListener('touchmove', this.touchMove);
  }

  private callHandler = (event : HermesEvent) : void => {
    this.handler(event);
  }

  public on(handler : Function) : void {
    this.handler = handler;
    this.unbind();
    this.bind()
  }

  public off() : void {
    this.handler = () => {};
    // Sganciare eventi
  }

  public listen() : void {
    this.listening = true;
  }

  public unlisten() {
    this.listening = false;
  }

  public destroy() : void {
    // Sganciare eventi e distruggere cose
  }
}

export default Hermes;
