// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Hermes, { type HermesEvent } from '../src/index.ts';
import { normalizeKeyDelta, normalizeWheelDelta } from '../src/utils.ts';

function keydown(target: EventTarget, key: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
}

function wheel(target: EventTarget, deltaY: number, deltaMode = 0): void {
  target.dispatchEvent(new WheelEvent('wheel', { deltaY, deltaMode, bubbles: true }));
}

let root: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = '';
  root = document.createElement('div');
  document.body.append(root);
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
});

describe('Hermes key events', () => {
  it('reports only the space key when just "spacebar" is enabled', () => {
    const hermes = new Hermes({ root, events: ['spacebar'] });
    const handler = vi.fn<(event: HermesEvent) => void>();
    hermes.on(handler);

    keydown(root, 'ArrowDown');
    keydown(root, ' ');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0].type).toBe('spacebar');
    expect(handler.mock.calls[0]?.[0].delta).toEqual({ x: 0, y: 800 });
  });

  it('reports each key once when spacebar and arrows are both enabled', () => {
    const hermes = new Hermes({ root, events: ['spacebar', 'arrows'] });
    const handler = vi.fn<(event: HermesEvent) => void>();
    hermes.on(handler);

    keydown(root, 'ArrowUp');
    keydown(root, ' ');
    keydown(root, 'PageDown');

    expect(handler.mock.calls.map((call) => call[0].type)).toEqual(['arrows', 'spacebar']);
    expect(handler.mock.calls[0]?.[0].delta).toEqual({ x: 0, y: -80 });
  });

  it('reports every scroll key, and nothing else, when "keys" is enabled', () => {
    const hermes = new Hermes({ root, events: ['keys', 'arrows'] });
    const handler = vi.fn<(event: HermesEvent) => void>();
    hermes.on(handler);

    keydown(root, 'Home');
    keydown(root, 'a');
    keydown(root, 'ArrowLeft');

    expect(handler.mock.calls.map((call) => call[0].type)).toEqual(['keys', 'keys']);
  });

  it('ignores keys pressed inside editable elements', () => {
    const hermes = new Hermes({ root, events: ['keys'] });
    const handler = vi.fn();
    hermes.on(handler);
    const input = document.createElement('input');
    root.append(input);

    keydown(input, ' ');

    expect(handler).not.toHaveBeenCalled();
  });

  it('scrolls up on shift+space and honours per-key multipliers', () => {
    expect(normalizeKeyDelta(' ', 1, true)).toEqual({ x: 0, y: -800 });
    expect(normalizeKeyDelta('ArrowDown', { ArrowDown: 0.5 })).toEqual({ x: 0, y: 40 });
    expect(normalizeKeyDelta('ArrowRight', { ArrowDown: 0.5 })).toEqual({ x: 80, y: 0 });
    expect(normalizeKeyDelta('Escape')).toEqual({ x: 0, y: 0 });
  });
});

describe('Hermes wheel and native scroll', () => {
  it('scales line and page deltas', () => {
    expect(normalizeWheelDelta(new WheelEvent('wheel', { deltaY: 3, deltaMode: 1 }))).toEqual({
      x: 0,
      y: 84,
    });
    expect(normalizeWheelDelta(new WheelEvent('wheel', { deltaY: 1, deltaMode: 2 }))).toEqual({
      x: 0,
      y: 500,
    });
  });

  it('emits a single event per wheel tick', () => {
    const hermes = new Hermes({ root, events: ['wheel'] });
    const handler = vi.fn<(event: HermesEvent) => void>();
    hermes.on(handler);

    wheel(root, 120);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]).toMatchObject({ type: 'wheel', delta: { x: 0, y: 120 } });
  });

  it('reports the scroll delta in native mode', () => {
    const hermes = new Hermes({ root, mode: 'native' });
    const handler = vi.fn<(event: HermesEvent) => void>();
    hermes.on(handler);

    root.scrollTop = 40;
    root.dispatchEvent(new Event('scroll'));
    root.scrollTop = 100;
    root.dispatchEvent(new Event('scroll'));

    expect(handler.mock.calls.map((call) => call[0].delta.y)).toEqual([40, 60]);
  });
});

describe('Hermes lifecycle', () => {
  it('replaces the handler on a second on() and gates emission with listen', () => {
    const hermes = new Hermes({ root, events: ['wheel'] });
    const first = vi.fn();
    const second = vi.fn();
    hermes.on(first);
    hermes.on(second);
    expect(hermes.bound).toBe(true);

    wheel(root, 10);
    hermes.listen = false;
    wheel(root, 10);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    hermes.off();
    hermes.listen = true;
    wheel(root, 10);
    expect(second).toHaveBeenCalledTimes(1);
    expect(hermes.bound).toBe(false);
  });

  it('throws without a root when no fallback container exists', () => {
    expect(() => new Hermes()).toThrow('[Hermes] Container cannot be undefined');
  });
});
