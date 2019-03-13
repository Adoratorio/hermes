import { MODE, EVENTS, HermesOptions } from './declarations';

class Hermes {
  static MODE = MODE;
  static EVENTS = EVENTS;

  private options : HermesOptions;
  private handler : Function = () => {};
  private listening : boolean = true;
  private touchNodes : Array<HTMLElement> = [];

  private binded : boolean = false;

  constructor(options : HermesOptions) {
    const defaults = {
      mode: Hermes.MODE.VIRTUAL,
      events: [
        Hermes.EVENTS.WHEEL,
        Hermes.EVENTS.TOUCH,
        Hermes.EVENTS.KEYS,
      ],
      container: document.body,
      hook: document.querySelector('.hermes-hook') || document.body,
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

    this.generateTouchNodes();
  }

  public generateTouchNodes() {
    this.touchNodes = Array.from(document.querySelectorAll(this.options.touchClass));
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
            // Bind the touch events
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

  private wheel(event : Event) : void {
    this.callHandler(event);
  }

  private scroll(event : UIEvent) : void {
    this.callHandler(event);
  }

  private keydownAll(event : KeyboardEvent) : void {
    this.callHandler(event);
  }

  private keydownSpacebar(event : KeyboardEvent) : void {
    this.callHandler(event);
  }

  private keydownArrows(event : KeyboardEvent) : void {
    this.callHandler(event);
  }

  private callHandler(event : any) : void {
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
