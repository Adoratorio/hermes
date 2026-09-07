import { DELTA_MODE, KEY, type KeyMultipliers, type Vec2 } from './types.ts';

const LINE_DELTA = 80;
const JUMP_DELTA = 9999999;

const ARROW_KEYS: ReadonlySet<string> = new Set([KEY.LEFT, KEY.UP, KEY.RIGHT, KEY.DOWN]);
const SCROLL_KEYS: ReadonlySet<string> = new Set(Object.values(KEY));

const getDeltaMode = (mode: number): number => DELTA_MODE[mode] ?? DELTA_MODE[0] ?? 1;

export function isWindow(node: HTMLElement | Window): node is Window {
  return typeof Window !== 'undefined' && node instanceof Window;
}

export function isArrowKey(key: string): boolean {
  return ARROW_KEYS.has(key);
}

export function isScrollKey(key: string): boolean {
  return SCROLL_KEYS.has(key);
}

// Key events originating from text-entry contexts must never scroll.
// Null-safe: some targets are not HTMLElements (document, window).
export function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== 'string') {
    return false;
  }
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable
  );
}

export function getScrollPosition(root: HTMLElement | Window): Vec2 {
  if (isWindow(root)) {
    return { x: root.scrollX, y: root.scrollY };
  }
  return { x: root.scrollLeft, y: root.scrollTop };
}

export function normalizeWheelDelta(event: WheelEvent): Vec2 {
  const mode = getDeltaMode(event.deltaMode);

  return {
    x: event.deltaX * mode,
    y: event.deltaY * mode,
  };
}

export function normalizeKeyDelta(
  key: string,
  multiplier: number | KeyMultipliers = 1,
  shift = false,
): Vec2 {
  const m = (typeof multiplier === 'number' ? multiplier : multiplier[key as KEY]) ?? 1;

  switch (key) {
    case KEY.SPACE: {
      return { x: 0, y: (shift ? -window.innerHeight : window.innerHeight) * m };
    }
    case KEY.PAGEDOWN: {
      return { x: 0, y: window.innerHeight * m };
    }
    case KEY.PAGEUP: {
      return { x: 0, y: -window.innerHeight * m };
    }
    case KEY.DOWN: {
      return { x: 0, y: LINE_DELTA * m };
    }
    case KEY.UP: {
      return { x: 0, y: -LINE_DELTA * m };
    }
    case KEY.RIGHT: {
      return { x: LINE_DELTA * m, y: 0 };
    }
    case KEY.LEFT: {
      return { x: -LINE_DELTA * m, y: 0 };
    }
    case KEY.PAGESTART: {
      return { x: 0, y: -JUMP_DELTA };
    }
    case KEY.PAGEEND: {
      return { x: 0, y: JUMP_DELTA };
    }
    default: {
      return { x: 0, y: 0 };
    }
  }
}

export function getTouch(list: TouchList, id: number): Touch | undefined {
  for (const touch of list) {
    if (touch.identifier === id) {
      return touch;
    }
  }

  return undefined;
}
