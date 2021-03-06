import { Event, Events, Bindable } from '@ephox/porkbun';
import { Height, Width, Element } from '@ephox/sugar';

export interface GrowEvent {
  readonly x: number;
  readonly y: number;
}

interface GrowEvents {
  registry: {
    grow: Bindable<GrowEvent>;
  };
  trigger: {
      grow: (x: number, y: number) => void;
  };
}

interface Growth {
  readonly x: number;
  readonly y: number;
}

type GrowthFn = (x: number, y: number) => Growth;

const grower = function (f: GrowthFn) {
  return function (element: Element) {
    const events = Events.create({
      grow: Event(['x', 'y'])
    }) as GrowEvents;

    const mutate =  function (x: number, y: number) {
      const growth = f(x, y);
      const width = Width.get(element);
      const height = Height.get(element);
      Width.set(element, width + growth.x);
      Height.set(element, height + growth.y);
      events.trigger.grow(growth.x, growth.y);
    };

    return {
      mutate,
      events: events.registry
    };
  };
};

const both = grower(function (x, y): Growth {
  return {
    x,
    y
  };
});

const horizontal = grower(function (x, y): Growth  {
  return {
    x,
    y: 0
  };
});

const vertical = grower(function (x, y): Growth  {
  return {
    x: 0,
    y
  };
});

export {
  both,
  horizontal,
  vertical
};
