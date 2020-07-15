/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Api from './api/Api';
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import Buttons from './ui/Buttons';

export type CustomHeadSpecs = Cell<string>;

export default function () {
  PluginManager.add('fullpage', function (editor) {
    const headState = Cell(''), footState = Cell('');

    Commands.register(editor, headState);
    Buttons.register(editor);
    FilterContent.setup(editor, headState, footState);

    // @todo 업데이트 시에 추가할 것. (API 새로 추가.)
    const api = Api.get(headState);

    return api;
  });
}
