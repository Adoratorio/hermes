import {
  DELTA_SCALE,
  DELTA_MODE,
  KEYCODE,
  Vec2,
} from './declarations';


const getDeltaMode : Function = (mode : number) : number => DELTA_MODE[mode] || DELTA_MODE[0];

export function normalizeWheelDelta(event: any) : Vec2 {
  if ('deltaX' in event) {
    const mode : number = getDeltaMode(event.deltaMode);

    return {
      x: event.deltaX / DELTA_SCALE.STANDARD * mode,
      y: event.deltaY / DELTA_SCALE.STANDARD * mode,
    };
  }

  if ('wheelDeltaX' in event) {
    return {
      x: event.wheelDeltaX / DELTA_SCALE.OTHERS,
      y: event.wheelDeltaY / DELTA_SCALE.OTHERS,
    };
  }

  // ie with touchpad
  return {
    x: 0,
    y: event.wheelDelta / DELTA_SCALE.OTHERS,
  };
}

export function normalizeKeyDelta(keycode : number) : Vec2 {
  let delta : Vec2 = { x: 0, y: 0 };

  switch (true) {
    case keycode === KEYCODE.SPACE:
      delta = { x: 0, y: window.innerHeight };
      break;

    case keycode === KEYCODE.DOWN:
      delta = { x: 0, y: 80 };
      break;

    case keycode === KEYCODE.UP:
      delta = { x: 0, y: -80 };
      break;

    case keycode === KEYCODE.RIGHT:
      delta = { x: 80, y: 0 };
      break;

    case keycode === KEYCODE.LEFT:
      delta = { x: -80, y: 0 };
      break;

    default:
      delta = { x: 0, y: 0 };
  }

  return delta;
};
