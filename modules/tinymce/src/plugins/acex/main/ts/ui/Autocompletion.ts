/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// import { Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

// import { dataFrom } from '../core/Lookup';

const init = (editor: Editor, data: any): void => {
  const config = data.config;

  editor.ui.registry.addAutocompleter('acex', {
    ch: '@',
    columns: 1,
    minChars: 0,
    maxResults: config.maxResults || 10,
    fetch: (pattern, maxResults) => {
      if (config.fetch) {
        return config.fetch(editor, pattern, maxResults);
        // return config.fetch(pattern, maxResults).then((results) => {
        //   return dataFrom(results, pattern, Option.some(maxResults));
        // });
      }
      return null;
    },
    onAction: (autocompleteApi, rng, value, meta) => {
      if (config.onAction) {
        config.onAction(editor, autocompleteApi, rng, value, meta);
      } else {
        editor.selection.setRng(rng);
        editor.insertContent('@' + value);
        autocompleteApi.hide();
      }
    }
  });
};

export {
  init
};