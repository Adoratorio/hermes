import {
  MODE,
  EVENTS,
  KEYCODE,
  Vec2,
  HermesEvent,
  HermesOptions,
} from './declarations';
import { normalizeWheelDelta, normalizeKeyDelta, getTouch } from './utils';

class Hermes {
  static MODE = MODE;
  static EVENTS = EVENTS;
  static KEYCODE = KEYCODE;

  private options : HermesOptions;
  private handler : Function = () => {};
  private listening : boolean = true;
  private binded : boolean = false;
  private prevTouchPosition : Vec2 = { x: 0, y: 0 };
  private prevTouchTime : number = 0;
  private speed : Vec2 = { x: 0, y: 0 };
  private lastScrollPosition : Vec2 = { x: 0, y: 0 };
  private touchPointId : number = 0;

  constructor(options : Partial<HermesOptions>) {
    const defaults : HermesOptions = {
      mode: Hermes.MODE.VIRTUAL,
      events: [
        Hermes.EVENTS.WHEEL,
        Hermes.EVENTS.TOUCH,
        Hermes.EVENTS.KEYS,
      ],
      root: document.querySelector('.hermes-container') as HTMLElement,
      passive: true,
      emitGlobal: false,
      touchClass: '.prevent-touch',
      touchMultiplier: 2,
      keyMultiplier: 1,
    }
    this.options = {...defaults, ...options};

    if ((options.mode === Hermes.MODE.VIRTUAL || options.mode === Hermes.MODE.NATIVE)
       && typeof options.root === 'undefined') {
      throw new Error('Container cannot be undefined');
    }
  }

  private bind() {
    this.binded = true;
    if (this.options.mode === Hermes.MODE.VIRTUAL) {
      this.options.events.forEach((event) => {
        switch (true) {
          case event === 'wheel':
            this.options.root.addEventListener('wheel', this.wheel, { passive: this.options.passive });
            this.options.root.addEventListener('mousewheel', this.wheel, { passive: this.options.passive });
            break;

          case event === 'touch':
            this.options.root.addEventListener('touchstart', this.touchStart, { passive: this.options.passive });
            this.options.root.addEventListener('touchend', this.touchEnd, { passive: this.options.passive });
            this.options.root.addEventListener('touchcancel', this.touchEnd, { passive: this.options.passive });
            break;

          case event === 'keys':
            this.options.root.addEventListener('keydown', this.keydownAll);
            break;

          case event === 'spacebar' && this.options.events.indexOf(Hermes.EVENTS.KEYS) < 0:
            this.options.root.addEventListener('keydown', this.keydownSpacebar);
            break;

          case event === 'arrows' && this.options.events.indexOf(Hermes.EVENTS.KEYS) < 0:
            this.options.root.addEventListener('keydown', this.keydownArrows);
            break;

          default:
            console.warn(`'${event}' is not recognized`);
        }
      });
    } else if (this.options.mode === Hermes.MODE.NATIVE) {
      this.options.root.addEventListener('scroll', this.scroll, { passive: this.options.passive });
      const e = this.options.root as HTMLElement;
      const w = this.options.root as Window;
      this.lastScrollPosition = {
        x: (w.pageXOffset || e.scrollLeft || 0),
        y: (w.pageYOffset || e.scrollTop || 0)
      };
    } else {
      console.warn(`'${this.options.mode}' is not a supported mode`);
    }
  }

  private unbind() : void {
    this.options.root.removeEventListener('wheel', this.wheel);
    this.options.root.removeEventListener('mousewheel', this.wheel);
    this.options.root.removeEventListener('touchstart', this.touchStart);
    this.options.root.removeEventListener('touchend', this.touchEnd);
    this.options.root.removeEventListener('touchcancel', this.touchEnd);
    this.options.root.removeEventListener('touchmove', this.touchMove);
    this.options.root.removeEventListener('keydown', this.keydownAll);
    this.options.root.removeEventListener('keydown', this.keydownSpacebar);
    this.options.root.removeEventListener('keydown', this.keydownArrows);
    if (this.options.mode === Hermes.MODE.NATIVE) {
      this.options.root.removeEventListener('scroll', this.scroll);
    }
    this.binded = false;
  }

  private wheel : any = (event : WheelEvent) : void => {
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.WHEEL,
      delta: normalizeWheelDelta(event),
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private scroll : any = (event : UIEvent) : void => {
    const e = this.options.root as HTMLElement;
    const w = this.options.root as Window;
    const delta : Vec2 = {
      x: (w.pageXOffset || e.scrollLeft || 0) - this.lastScrollPosition.x,
      y: (w.pageYOffset || e.scrollTop || 0) - this.lastScrollPosition.y,
    }
    this.lastScrollPosition = {
      x: (w.pageXOffset || e.scrollLeft || 0),
      y: (w.pageYOffset || e.scrollTop || 0),
    }
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.SCROLL,
      delta,
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private keydownAll : any = (event : KeyboardEvent) : void => {
    if ((event.target as HTMLElement).tagName === 'INPUT') return;
    if ((event.target as HTMLElement).tagName === 'TEXTAREA') return;
    if ((event.target as HTMLElement).isContentEditable) return;
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.KEYS,
      delta: normalizeKeyDelta(event.keyCode, this.options.keyMultiplier),
      originalEvent: event,
    };
    
    this.callHandler(customEvent);
  }
  
  private keydownSpacebar : any = (event : KeyboardEvent) : void => {
    if ((event.target as HTMLElement).tagName === 'INPUT') return;
    if ((event.target as HTMLElement).tagName === 'TEXTAREA') return;
    if ((event.target as HTMLElement).isContentEditable) return;
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.SPACEBAR,
      delta: normalizeKeyDelta(event.keyCode, this.options.keyMultiplier),
      originalEvent: event,
    };
    
    this.callHandler(customEvent);
  }
  
  private keydownArrows : any = (event : KeyboardEvent) : void => {
    if ((event.target as HTMLElement).tagName === 'INPUT') return;
    if ((event.target as HTMLElement).tagName === 'TEXTAREA') return;
    if ((event.target as HTMLElement).isContentEditable) return;
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.ARROWS,
      delta: normalizeKeyDelta(event.keyCode, this.options.keyMultiplier),
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private touchStart : any = (event : TouchEvent) : void => {
    if (this.touchPointId !== 0) return;
    this.touchPointId = event.touches[0].identifier;
    this.options.root.addEventListener('touchmove', this.touchMove);
    this.prevTouchPosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  private touchMove : any = (event : TouchEvent) : void => {
    const touchPoint : Touch | undefined = getTouch(event.touches, this.touchPointId);
    if (touchPoint === undefined) return;
    const delta : Vec2 = {
      x: -(touchPoint.clientX - this.prevTouchPosition.x) * this.options.touchMultiplier,
      y: -(touchPoint.clientY - this.prevTouchPosition.y) * this.options.touchMultiplier,
    };

    this.prevTouchPosition = {
      x: touchPoint.clientX,
      y: touchPoint.clientY,
    };

    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.TOUCH,
      delta,
      originalEvent: event,
    };

    // Calculate touch speed
    const now = performance.now();
    const deltaT = now - this.prevTouchTime;
    // Calculate speed only if there is a time delta
    // prevent bug on safari pitch to zoom
    if (deltaT !== 0) {
      const speed = {
        x: delta.x / deltaT * 16,
        y: delta.y / deltaT * 16,
      }
      this.speed = {
        x: speed.x * 0.9 + this.speed.x * 0.1,
        y: speed.y * 0.9 + this.speed.y * 0.1,
      }
    }
    this.prevTouchTime = now;

    this.callHandler(customEvent);
  }

  private touchEnd : any = (event : TouchEvent) : void => {
    if (getTouch(event.changedTouches, this.touchPointId) === undefined) return;
    this.touchPointId = 0;
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.TOUCH,
      delta: this.speed,
      originalEvent: event,
    }
    this.callHandler(customEvent);
    this.options.root.removeEventListener('touchmove', this.touchMove);
  }

  private callHandler = (event : HermesEvent) : void => {
    if (this.listening) {
      this.handler(event);
      if (this.options.emitGlobal) {
        const eventInit : CustomEventInit = {};
        eventInit.detail = event;
        const customEvent : CustomEvent = new CustomEvent(`hermes-${event.type}`, eventInit);
        window.dispatchEvent(customEvent);
      }
    }
  }

  public on(handler : Function) : void {
    if (this.binded) throw new Error('A handler is already binded');
    this.handler = handler;
    this.unbind();
    this.bind();
  }

  public off() : void {
    this.handler = () => {};
    this.unbind();
  }

  public destroy() : void {
    this.off();
  }
  
  public set listen(listening : boolean) {
    this.listening = listening;
  }
}

export default Hermes;
