/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Keys from './core/Keys';

export default function () {
  PluginManager.add('autolink', function (editor) {
    Keys.setup(editor);

    // @todo tinymce 업그레이드 시 반영할 것. ios에서 한글 입력 조합 문제로 인해 강제로 이 부분 호출이 필요함.
    return Keys.apis;
  });
}
