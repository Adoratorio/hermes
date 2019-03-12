enum MODE {
  VIRTUAL = 'virtual',
  FAKE = 'fake',
  NATIVE = 'native',
}

enum EVENTS {
  WHEEL = 'wheel',
  TOUCH = 'touch',
  SPACEBAR = 'spacebar',
  ARROWS = 'arrows',
  KEYS = 'keys',
}

interface HermesOptions {
  mode : string,
  events? : Array<EVENTS>,
  container? : HTMLElement,
  hook? : HTMLElement,
  passive? : boolean,
  emitGlobal? : boolean,
}

class Hermes {
  static MODE = MODE;
  static EVENTS = EVENTS;

  private options : HermesOptions;
  private handler : Function | undefined =  undefined;
  private listening : boolean = true;
  private excludedNodes : Array<HTMLElement> = [];

  constructor(options : HermesOptions) {
    const defaults : HermesOptions = {
      mode: Hermes.MODE.VIRTUAL,
      events: [
        Hermes.EVENTS.WHEEL,
        Hermes.EVENTS.TOUCH,
        Hermes.EVENTS.KEYS,
      ],
      container: undefined,
      hook: undefined,
      passive: true,
      emitGlobal: false,
    };
    Object.assign(options, defaults);
    this.options = options;

    if ((options.mode === Hermes.MODE.VIRTUAL || options.mode === Hermes.MODE.NATIVE)
       && typeof options.container === 'undefined') {
      throw new Error('Container cannot be undefined');
    }
    if (options.mode === Hermes.MODE.FAKE && typeof options.hook === 'undefined') {
      throw new Error('Hook cannot be undefined');
    }
  }

  public set touchNodes(nodes : Array<HTMLElement>) {
    this.excludedNodes = nodes;
  }

  public on(handler : Function) : void {
    this.handler = handler;
    // Agganciare eventi
  }

  public off() : void {
    this.handler = undefined;
    // Sganciare eventi
  }

  public listen() : void {
    this.listening = true;
  }

  public unlisten() : void {
    this.listening = false;
  }

  public destroy() : void {
    // Sganciare eventi e distruggere cose
  }
}

export default Hermes;
