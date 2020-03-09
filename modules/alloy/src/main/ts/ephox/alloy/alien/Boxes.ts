import { window } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Height, Location, Width, Element, VisualViewport } from '@ephox/sugar';

import { CssPositionAdt } from './CssPosition';
import * as OuterPosition from '../frame/OuterPosition';

const pointed = (point: CssPositionAdt, width: number, height: number): BoxByPoint => ({
  point: Fun.constant(point),
  width: Fun.constant(width),
  height: Fun.constant(height)
});

export interface Rect {
  readonly x: () => number;
  readonly y: () => number;
  readonly width: () => number;
  readonly height: () => number;
}

const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x: Fun.constant(x),
  y: Fun.constant(y),
  width: Fun.constant(width),
  height: Fun.constant(height)
});

export interface Bounds {
  readonly x: () => number;
  readonly y: () => number;
  readonly width: () => number;
  readonly height: () => number;
  readonly right: () => number;
  readonly bottom: () => number;
}

export interface BoxByPoint {
  readonly point: () => CssPositionAdt;
  readonly width: () => number;
  readonly height: () => number;
}

const bounds = (x: number, y: number, width: number, height: number): Bounds => {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y),
    width: Fun.constant(width),
    height: Fun.constant(height),
    right: Fun.constant(x + width),
    bottom: Fun.constant(y + height)
  };
};

const box = (element: Element): Bounds => {
  const xy = Location.absolute(element);
  const w = Width.getOuter(element);
  const h = Height.getOuter(element);
  return bounds(xy.left(), xy.top(), w, h);
};

// NOTE: We used to use AriaFocus.preserve here, but there is no reason to do that now that
// we are not changing the visibility of the element. Hopefully (2015-09-29).
const absolute = (element: Element): Bounds => {
  const position = OuterPosition.find(element);
  const width = Width.getOuter(element);
  const height = Height.getOuter(element);
  return bounds(position.left(), position.top(), width, height);
};

const win = (): Bounds => {
  return VisualViewport.getBounds(window);
};

export {
  pointed,
  rect,
  bounds,
  box,
  absolute,
  win
};
