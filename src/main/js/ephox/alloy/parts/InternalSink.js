define(
  'ephox.alloy.parts.InternalSink',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.katamari.api.Fun'
  ],

  function (EventHandler, PartType, Fun) {
    var suffix = 'sink';
    var partType =  PartType.optional(
      { sketch: Fun.identity },
      [ ],
      suffix,
      '<alloy.sink>',
      Fun.constant({ }),
      Fun.constant({
        dom: {
          tag: 'div'
        },
        behaviours: {
          positioning: {
            // TODO: Make an internal sink also be able to be used with relative layouts
            useFixed: true
          }
        },
        events: {
          // Probably a behaviour: cut mania
          'keydown': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate
              simulatedEvent.cut();
            }
          }),
          'mousedown': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate or mousedown
              simulatedEvent.cut();
            }
          }),
          'click': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate
              simulatedEvent.cut();
            }
          })
        }
      })
    );

    return {
      partType: Fun.constant(partType),
      suffix: Fun.constant(suffix)
    }
  }
);