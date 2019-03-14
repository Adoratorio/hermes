import {
  DELTA_SCALE,
  DELTA_MODE,
  Vec2,
} from './declarations';


const getDeltaMode : Function = (mode : number) : number => DELTA_MODE[mode] || DELTA_MODE[0];

export function normalizeDelta(event: any) : Vec2 {
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
