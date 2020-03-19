/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// import { Fun, Strings, Option } from '@ephox/katamari';
import { Fun, Option } from '@ephox/katamari';

const textMatches = (text: string, lowerCasePattern: string): boolean => {
  // return Strings.contains(text.toLowerCase(), lowerCasePattern);
  return text.toLowerCase().indexOf(lowerCasePattern) === 0;
};

const dataFrom = (list: any[], pattern: string, maxResults: Option<number>): Array<{value: string, icon: string, text: string }> => {
  const matches = [];
  const lowerCasePattern = pattern.toLowerCase();
  const reachedLimit = maxResults.fold(() => Fun.never, (max) => (size) => size >= max);
  for (let i = 0; i < list.length; i++) {
    // TODO: more intelligent search by showing title matches at the top, keyword matches after that (use two arrays and concat at the end)
    if (pattern.length === 0 || textMatches(list[i].text, lowerCasePattern)) {
      matches.push(list[i]);
      if (reachedLimit(matches.length)) {
        break;
      }
    }
  }
  return matches;
};

export {
  dataFrom
};