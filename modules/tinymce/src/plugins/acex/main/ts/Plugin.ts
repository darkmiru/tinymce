/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Autocompletion from './ui/Autocompletion';
import Settings from './api/Settings';

/**
 * This class contains all core logic for the emoticons plugin.
 *
 * @class tinymce.emoticons.Plugin
 * @private
 */

export default function () {
  PluginManager.add('acex', function (editor, pluginUrl) {

    const data = {
      config: Settings.getAcexConfig(editor),
      pluginUrl
    };
    Autocompletion.init(editor, data);
  });
}
