import {
  EVENTS,
  KEY,
  MODE,
  type HermesEvent,
  type HermesHandler,
  type HermesOptions,
  type KeyMultipliers,
  type Vec2,
} from './types.ts';
import {
  getScrollPosition,
  isWindow,
  getTouch,
  isArrowKey,
  isEditableTarget,
  isScrollKey,
  normalizeKeyDelta,
  normalizeWheelDelta,
} from './utils.ts';

const KEY_EVENTS: ReadonlySet<EVENTS> = new Set([EVENTS.KEYS, EVENTS.SPACEBAR, EVENTS.ARROWS]);

class Hermes {
  static readonly MODE: typeof MODE = MODE;
  static readonly EVENTS: typeof EVENTS = EVENTS;
  static readonly KEY: typeof KEY = KEY;

  public static isKeyEvent(type: EVENTS): boolean {
    return KEY_EVENTS.has(type);
  }

  #options: HermesOptions;
  #handler: HermesHandler = () => {};
  #listening = true;
  #bound = false;
  #prevTouchPosition: Vec2 = { x: 0, y: 0 };
  #prevTouchTime = 0;
  #speed: Vec2 = { x: 0, y: 0 };
  #lastScrollPosition: Vec2 = { x: 0, y: 0 };
  #touchPointId: number | null = null;

  constructor(options: Partial<HermesOptions> = {}) {
    // Resolve the fallback root only when no explicit root is given, so an
    // explicit root never touches `document` (SSR-safe)
    const root =
      options.root ??
      (typeof document !== 'undefined'
        ? document.querySelector<HTMLElement>('.hermes-container')
        : null);
    if (!root) {
      throw new Error('[Hermes] Container cannot be undefined');
    }

    const defaults: Omit<HermesOptions, 'root'> = {
      mode: Hermes.MODE.VIRTUAL,
      events: [Hermes.EVENTS.WHEEL, Hermes.EVENTS.TOUCH, Hermes.EVENTS.KEYS],
      passive: true,
      emitGlobal: false,
      touchMultiplier: 2,
      keyMultiplier: 1,
      debug: false,
    };
    this.#options = { ...defaults, ...options, root };
  }

  #debugWarn(message: string): void {
    if (this.#options.debug) {
      console.warn(`[Hermes] ${message}`);
    }
  }

  #bind(): void {
    this.#bound = true;
    const { root, passive, events, mode } = this.#options;

    if (mode === Hermes.MODE.NATIVE) {
      root.addEventListener('scroll', this.#scroll, { passive });
      this.#lastScrollPosition = getScrollPosition(root);
      return;
    }

    if (mode !== Hermes.MODE.VIRTUAL) {
      this.#debugWarn(`'${mode}' is not a supported mode`);
      return;
    }

    let bindKeys = false;
    for (const event of events) {
      switch (event) {
        case EVENTS.WHEEL: {
          root.addEventListener('wheel', this.#wheel, { passive });
          break;
        }
        case EVENTS.TOUCH: {
          root.addEventListener('touchstart', this.#touchStart, { passive });
          root.addEventListener('touchend', this.#touchEnd, { passive });
          root.addEventListener('touchcancel', this.#touchCancel, { passive });
          break;
        }
        case EVENTS.KEYS:
        case EVENTS.SPACEBAR:
        case EVENTS.ARROWS: {
          bindKeys = true;
          break;
        }
        default: {
          this.#debugWarn(`'${event}' is not recognized`);
        }
      }
    }

    // A single keydown listener serves keys/spacebar/arrows, so a key is never
    // reported twice when more than one of them is enabled
    if (bindKeys) {
      root.addEventListener('keydown', this.#keydown, { passive });
    }
  }

  #unbind(): void {
    const { root } = this.#options;
    root.removeEventListener('wheel', this.#wheel);
    root.removeEventListener('touchstart', this.#touchStart);
    root.removeEventListener('touchend', this.#touchEnd);
    root.removeEventListener('touchcancel', this.#touchCancel);
    root.removeEventListener('touchmove', this.#touchMove);
    root.removeEventListener('keydown', this.#keydown);
    root.removeEventListener('scroll', this.#scroll);
    this.#touchPointId = null;
    this.#bound = false;
  }

  // Map a pressed key to the event type it should be reported as, honouring
  // which key groups are enabled. `keys` covers every scroll key; `spacebar`
  // and `arrows` are narrower groups used when `keys` is not enabled.
  #resolveKeyEvent(key: string): EVENTS | null {
    const { events } = this.#options;
    if (events.includes(EVENTS.KEYS)) {
      return isScrollKey(key) ? EVENTS.KEYS : null;
    }
    if (key === KEY.SPACE && events.includes(EVENTS.SPACEBAR)) {
      return EVENTS.SPACEBAR;
    }
    if (isArrowKey(key) && events.includes(EVENTS.ARROWS)) {
      return EVENTS.ARROWS;
    }
    return null;
  }

  get #pageSize(): Vec2 | undefined {
    if (this.#options.pageSize !== 'root') {
      return undefined;
    }
    const { root } = this.#options;
    return isWindow(root)
      ? { x: root.innerWidth, y: root.innerHeight }
      : { x: root.clientWidth, y: root.clientHeight };
  }

  #wheel = (event: Event): void => {
    this.#callHandler({
      type: Hermes.EVENTS.WHEEL,
      delta: normalizeWheelDelta(event as WheelEvent, this.#pageSize),
      originalEvent: event,
    });
  };

  #scroll = (event: Event): void => {
    const position = getScrollPosition(this.#options.root);
    const delta: Vec2 = {
      x: position.x - this.#lastScrollPosition.x,
      y: position.y - this.#lastScrollPosition.y,
    };
    this.#lastScrollPosition = position;

    this.#callHandler({
      type: Hermes.EVENTS.SCROLL,
      delta,
      originalEvent: event,
    });
  };

  #keydown = (event: Event): void => {
    const keyEvent = event as KeyboardEvent;
    const target = keyEvent.composedPath()[0] ?? keyEvent.target;
    if (
      keyEvent.defaultPrevented ||
      keyEvent.ctrlKey ||
      keyEvent.metaKey ||
      keyEvent.altKey ||
      isEditableTarget(target as EventTarget | null)
    ) {
      return;
    }
    const type = this.#resolveKeyEvent(keyEvent.key);
    if (type === null) {
      return;
    }

    this.#callHandler({
      type,
      delta: normalizeKeyDelta(
        keyEvent.key,
        this.#options.keyMultiplier,
        keyEvent.shiftKey,
        this.#pageSize?.y,
      ),
      originalEvent: event,
    });
  };

  #touchStart = (event: Event): void => {
    const touchEvent = event as TouchEvent;
    // `null` sentinel: touch identifiers are 0-based on some browsers (Android)
    const [touch] = touchEvent.touches;
    if (this.#touchPointId !== null || !touch) {
      return;
    }
    this.#touchPointId = touch.identifier;
    // Start each gesture from a clean slate so a quick tap after a fling does
    // not emit the previous gesture's leftover momentum.
    this.#speed = { x: 0, y: 0 };
    this.#prevTouchTime = performance.now();
    this.#prevTouchPosition = { x: touch.clientX, y: touch.clientY };
    this.#options.root.addEventListener('touchmove', this.#touchMove, {
      passive: this.#options.passive,
    });
  };

  #touchMove = (event: Event): void => {
    const touchEvent = event as TouchEvent;
    if (this.#touchPointId === null) {
      return;
    }
    const touchPoint = getTouch(touchEvent.touches, this.#touchPointId);
    if (touchPoint === undefined) {
      return;
    }
    const delta: Vec2 = {
      x: -(touchPoint.clientX - this.#prevTouchPosition.x) * this.#options.touchMultiplier,
      y: -(touchPoint.clientY - this.#prevTouchPosition.y) * this.#options.touchMultiplier,
    };
    this.#prevTouchPosition = { x: touchPoint.clientX, y: touchPoint.clientY };

    // Track the gesture speed (per 16ms frame, smoothed) for the release event.
    // Skip zero time deltas: Safari pinch-to-zoom reports them.
    const now = performance.now();
    const deltaT = now - this.#prevTouchTime;
    if (deltaT !== 0) {
      const speedX = (delta.x / deltaT) * 16;
      const speedY = (delta.y / deltaT) * 16;
      this.#speed = {
        x: speedX * 0.9 + this.#speed.x * 0.1,
        y: speedY * 0.9 + this.#speed.y * 0.1,
      };
    }
    this.#prevTouchTime = now;

    this.#callHandler({
      type: Hermes.EVENTS.TOUCH,
      delta,
      originalEvent: event,
    });
  };

  #touchCancel = (event: Event): void => {
    if (
      this.#touchPointId === null ||
      getTouch((event as TouchEvent).changedTouches, this.#touchPointId) === undefined
    ) {
      return;
    }
    this.#touchPointId = null;
    this.#speed = { x: 0, y: 0 };
    this.#options.root.removeEventListener('touchmove', this.#touchMove);
  };

  #touchEnd = (event: Event): void => {
    const touchEvent = event as TouchEvent;
    if (this.#touchPointId === null) {
      return;
    }
    if (getTouch(touchEvent.changedTouches, this.#touchPointId) === undefined) {
      return;
    }
    this.#touchPointId = null;
    this.#options.root.removeEventListener('touchmove', this.#touchMove);
    // A held finger has no release momentum; recent movement keeps its velocity.
    if (performance.now() - this.#prevTouchTime > 100) {
      this.#speed = { x: 0, y: 0 };
    }
    // The release event carries the gesture speed as delta (momentum)
    this.#callHandler({
      type: Hermes.EVENTS.TOUCH,
      delta: { x: this.#speed.x, y: this.#speed.y },
      originalEvent: event,
    });
  };

  #callHandler(event: HermesEvent): void {
    if (!this.#listening) {
      return;
    }
    this.#handler(event);
    if (this.#options.emitGlobal) {
      window.dispatchEvent(new CustomEvent(`hermes-${event.type}`, { detail: event }));
    }
  }

  // Sets (or replaces) the handler and binds the listeners on first call
  public on(handler: HermesHandler): void {
    this.#handler = handler;
    if (!this.#bound) {
      this.#bind();
    }
  }

  public off(): void {
    this.#handler = () => {};
    this.#unbind();
  }

  public destroy(): void {
    this.off();
  }

  public get listen(): boolean {
    return this.#listening;
  }

  public set listen(listening: boolean) {
    this.#listening = listening;
  }

  public get root(): HTMLElement | Window {
    return this.#options.root;
  }

  public get touchMultiplier(): number {
    return this.#options.touchMultiplier;
  }

  public set touchMultiplier(touchMultiplier: number) {
    this.#options.touchMultiplier = touchMultiplier;
  }

  public get keyMultiplier(): number | KeyMultipliers {
    return this.#options.keyMultiplier;
  }

  public set keyMultiplier(keyMultiplier: number | KeyMultipliers) {
    this.#options.keyMultiplier = keyMultiplier;
  }

  public get bound(): boolean {
    return this.#bound;
  }
}

export type { HermesEvent, HermesHandler, HermesOptions, KeyMultipliers, Vec2 } from './types.ts';
export { DELTA_MODE, EVENTS, KEY, MODE } from './types.ts';
export default Hermes;
