import { MODE, EVENTS, HermesOptions, HermesEvent, Vec2 } from './declarations';

class Hermes {
  static MODE = MODE;
  static EVENTS = EVENTS;

  private options : HermesOptions;
  private handler : Function = () => {};
  private listening : boolean = true;
  private amount : Vec2 = { x: 0, y: 0};
  private binded : boolean = false;

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
            this.options.container.addEventListener('touchmove', this.touchMove);
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
    } else if (this.options.mode === Hermes.MODE.FAKE) {
      this.options.hook.addEventListener('scroll', this.scroll, { passive: this.options.passive });
    } else {
      console.warn(`'${this.options.mode}' is not a supported mode`);
    }
  }

  private unbind() : void {

  }

  private wheel = (event : Event) : void => {
    console.log('event: ', event);
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.WHEEL,
      amount: { x: 20, y: 20 },
      delta: { x: event.deltaX, y: event.deltaY },
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private scroll = (event : Event) : void => {
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.WHEEL,
      amount: { x: 20, y: 20 },
      delta: { x: 20, y: 20 },
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private keydownAll = (event : Event) : void => {
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.KEYS,
      amount: { x: 20, y: 20 },
      delta: { x: 20, y: 20 },
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private keydownSpacebar = (event : Event) : void => {
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.SPACEBAR,
      amount: { x: 20, y: 20 },
      delta: { x: 20, y: 20 },
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private keydownArrows = (event : Event) : void => {
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.ARROWS,
      amount: { x: 20, y: 20 },
      delta: { x: 20, y: 20 },
      originalEvent: event,
    };

    this.callHandler(customEvent);
  }

  private touchMove = (event : Event) : void => {
    const customEvent : HermesEvent = {
      type: Hermes.EVENTS.TOUCH,
      amount: { x: 20, y: 20 },
      delta: { x: 20, y: 20 },
      originalEvent: event,
    };

    this.callHandler(customEvent);
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
