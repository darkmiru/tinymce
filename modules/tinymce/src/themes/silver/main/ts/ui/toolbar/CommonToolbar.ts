/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Boxes, Focusing, Keying, SplitFloatingToolbar as AlloySplitFloatingToolbar, SplitSlidingToolbar as AlloySplitSlidingToolbar, Tabstopping, Toolbar as AlloyToolbar, ToolbarGroup as AlloyToolbarGroup } from '@ephox/alloy';
import { Arr, Option, Result } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';
import { ToolbarMode } from '../../api/Settings';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import * as Channels from '../../Channels';
import { renderIconButtonSpec } from '../general/Button';
import { ToolbarButtonClasses } from './button/ButtonClasses';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { receivingConfig } from '../../ReadOnly';

export interface MoreDrawerData {
  lazyMoreButton: () => AlloyComponent;
  lazyToolbar: () => AlloyComponent;
  lazyHeader: () => AlloyComponent;
}
export interface ToolbarSpec {
  type: ToolbarMode;
  uid: string;
  cyclicKeying: boolean;
  onEscape: (comp: AlloyComponent) => Option<boolean>;
  initGroups: ToolbarGroup[];
  attributes?: Record<string, string>;
  backstage: UiFactoryBackstage;
}
export interface MoreDrawerToolbarSpec extends ToolbarSpec {
  getSink: () => Result<AlloyComponent, string>;
  moreDrawerData?: MoreDrawerData;
}

export interface ToolbarGroup {
  title: Option<string>;
  items: AlloySpec[];
}

const renderToolbarGroupCommon = (toolbarGroup: ToolbarGroup) => {
  const attributes = toolbarGroup.title.fold(() => {
    return {};
  },
    (title) => {
      return { attributes: { title } };
    });
  return {
    dom: {
      tag: 'div',
      classes: ['tox-toolbar__group'],
      ...attributes
    },

    components: [
      AlloyToolbarGroup.parts().items({})
    ],

    items: toolbarGroup.items,
    markers: {
      // nav within a group breaks if disabled buttons are first in their group so skip them
      itemSelector: '*:not(.tox-split-button) > .tox-tbtn:not([disabled]), .tox-split-button:not([disabled]), .tox-toolbar-nav-js:not([disabled])'
    },
    tgroupBehaviours: Behaviour.derive([
      Tabstopping.config({}),
      Focusing.config({})
    ])
  };
};

const renderToolbarGroup = (toolbarGroup: ToolbarGroup) => {
  return AlloyToolbarGroup.sketch(renderToolbarGroupCommon(toolbarGroup));
};

const getToolbarbehaviours = (toolbarSpec: ToolbarSpec, modeName) => {
  const onAttached = AlloyEvents.runOnAttached(function (component) {
    const groups = Arr.map(toolbarSpec.initGroups, renderToolbarGroup);
    AlloyToolbar.setGroups(component, groups);
  });

  return Behaviour.derive([
    DisablingConfigs.toolbarButton(toolbarSpec.backstage.shared.providers.isReadonly()),
    receivingConfig(),
    Keying.config({
      // Tabs between groups
      mode: modeName,
      onEscape: toolbarSpec.onEscape,
      selector: '.tox-toolbar__group'
    }),
    AddEventsBehaviour.config('toolbar-events', [ onAttached ])
  ]);
};

const renderMoreToolbarCommon = (toolbarSpec: MoreDrawerToolbarSpec) => {
  const modeName = toolbarSpec.cyclicKeying ? 'cyclic' : 'acyclic';

  return {
    uid: toolbarSpec.uid,
    dom: {
      tag: 'div',
      classes: ['tox-toolbar-overlord']
    },
    parts: {
      // This already knows it is a toolbar group
      'overflow-group': renderToolbarGroupCommon({
        title: Option.none(),
        items: []
      }),
      'overflow-button': renderIconButtonSpec({
        name: 'more',
        icon: Option.some('more-drawer'),
        disabled: false,
        tooltip: Option.some('More...'),
        primary: false,
        borderless: false
      }, Option.none(), toolbarSpec.backstage.shared.providers)
    },
    splitToolbarBehaviours: getToolbarbehaviours(toolbarSpec, modeName)
  };
};

const renderFloatingMoreToolbar = (toolbarSpec: MoreDrawerToolbarSpec) => {
  const baseSpec = renderMoreToolbarCommon(toolbarSpec);
  const overflowXOffset = 4;

  const primary = AlloySplitFloatingToolbar.parts().primary({
    dom: {
      tag: 'div',
      classes: ['tox-toolbar__primary']
    }
  });

  return AlloySplitFloatingToolbar.sketch({
    ...baseSpec,
    lazySink: toolbarSpec.getSink,
    getOverflowBounds: () => {
      // Restrict the left/right bounds to the editor header width, but don't restrict the top/height
      const headerElem = toolbarSpec.moreDrawerData.lazyHeader().element();
      const headerBounds = Boxes.absolute(headerElem);
      const docElem = Traverse.documentElement(headerElem);
      const docBounds = Boxes.absolute(docElem);
      return Boxes.bounds(
        headerBounds.x() + overflowXOffset,
        docBounds.y(),
        headerBounds.width() - overflowXOffset * 2,
        docBounds.height()
      );
    },
    parts: {
      ...baseSpec.parts,
      overflow: {
        dom: {
          tag: 'div',
          classes: ['tox-toolbar__overflow'],
          attributes: toolbarSpec.attributes
        }
      }
    },
    components: [ primary ],
    markers: {
      overflowToggledClass: ToolbarButtonClasses.Ticked
    }
  });
};

const renderSlidingMoreToolbar = (toolbarSpec: MoreDrawerToolbarSpec) => {
  const primary = AlloySplitSlidingToolbar.parts().primary({
    dom: {
      tag: 'div',
      classes: ['tox-toolbar__primary']
    }
  });

  const overflow = AlloySplitSlidingToolbar.parts().overflow({
    dom: {
      tag: 'div',
      classes: ['tox-toolbar__overflow']
    }
  });

  const baseSpec = renderMoreToolbarCommon(toolbarSpec);

  return AlloySplitSlidingToolbar.sketch({
    ...baseSpec,
    components: [ primary, overflow ],
    markers: {
      openClass: 'tox-toolbar__overflow--open',
      closedClass: 'tox-toolbar__overflow--closed',
      growingClass: 'tox-toolbar__overflow--growing',
      shrinkingClass: 'tox-toolbar__overflow--shrinking',
      overflowToggledClass: ToolbarButtonClasses.Ticked
    },
    onOpened: (comp) => {
      comp.getSystem().broadcastOn([ Channels.toolbarHeightChange() ], { type: 'opened' });
    },
    onClosed: (comp) => {
      comp.getSystem().broadcastOn([ Channels.toolbarHeightChange() ], { type: 'closed' });
    }
  });
};

const renderToolbar = (toolbarSpec: ToolbarSpec) => {
  const modeName = toolbarSpec.cyclicKeying ? 'cyclic' : 'acyclic';

  return AlloyToolbar.sketch({
    uid: toolbarSpec.uid,
    dom: {
      tag: 'div',
      classes: ['tox-toolbar'].concat(toolbarSpec.type === ToolbarMode.scrolling ? [ 'tox-toolbar--scrolling' ] : [])
    },
    components: [
      AlloyToolbar.parts().groups({})
    ],

    toolbarBehaviours: getToolbarbehaviours(toolbarSpec, modeName)
  });
};

export { renderToolbarGroup, renderToolbar, renderFloatingMoreToolbar, renderSlidingMoreToolbar };
