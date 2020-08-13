/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from 'tinymce/core/api/Env';
import Settings from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';

const rangeEqualsDelimiterOrSpace = function (rangeString, delimiter) {
  return rangeString === delimiter || rangeString === ' ' || rangeString.charCodeAt(0) === 160;
};

const handleEclipse = function (editor) {
  parseCurrentLine(editor, -1, '(');
};

const handleSpacebar = function (editor) {
  parseCurrentLine(editor, 0, '');
};

const handleEnter = function (editor) {
  parseCurrentLine(editor, -1, '');
};

const scopeIndex = function (container, index) {
  if (index < 0) {
    index = 0;
  }

  if (container.nodeType === 3) {
    const len = container.data.length;

    if (index > len) {
      index = len;
    }
  }

  return index;
};

const setStart = function (rng, container, offset) {
  if (container.nodeType !== 1 || container.hasChildNodes()) {
    rng.setStart(container, scopeIndex(container, offset));
  } else {
    rng.setStartBefore(container);
  }
};

const setEnd = function (rng, container, offset) {
  if (container.nodeType !== 1 || container.hasChildNodes()) {
    rng.setEnd(container, scopeIndex(container, offset));
  } else {
    rng.setEndAfter(container);
  }
};

const parseCurrentLine = function (editor, endOffset, delimiter) {
  let rng, end, start, endContainer, bookmark, text, matches, prev, len, rngText;
  // const autoLinkPattern = Settings.getAutoLinkPattern(editor);
  const defaultLinkTarget = Settings.getDefaultLinkTarget(editor);

  // Never create a link when we are inside a link
  if (editor.selection.getNode().tagName === 'A') {
    return;
  }

  // We need at least five characters to form a URL,
  // hence, at minimum, five characters from the beginning of the line.
  rng = editor.selection.getRng(true).cloneRange();
  if (rng.startOffset < 5) {
    // During testing, the caret is placed between two text nodes.
    // The previous text node contains the URL.
    prev = rng.endContainer.previousSibling;
    if (!prev) {
      if (!rng.endContainer.firstChild || !rng.endContainer.firstChild.nextSibling) {
        return;
      }

      prev = rng.endContainer.firstChild.nextSibling;
    }

    len = prev.length;
    setStart(rng, prev, len);
    setEnd(rng, prev, len);

    if (rng.endOffset < 5) {
      return;
    }

    end = rng.endOffset;
    endContainer = prev;
  } else {
    endContainer = rng.endContainer;

    // Get a text node
    if (endContainer.nodeType !== 3 && endContainer.firstChild) {
      while (endContainer.nodeType !== 3 && endContainer.firstChild) {
        endContainer = endContainer.firstChild;
      }

      // Move range to text node
      if (endContainer.nodeType === 3) {
        setStart(rng, endContainer, 0);
        setEnd(rng, endContainer, endContainer.nodeValue.length);
      }
    }

    if (rng.endOffset === 1) {
      end = 2;
    } else {
      end = rng.endOffset - 1 - endOffset;
    }
  }

  start = end;

  // @todo 업데이트시 반영할 것. autolink에 전화번호 링크 기능 추가.
  let numCheck = true;
  let isTel = false;
  let subNumCheck = true;
  const telRegex = /^(tel:)?[ ]?([+]?)([(]{0,1}[0-9]{1,4}[)]{0,1}[- \t\./0-9]*[0-9]+[.]?)$/i;
  const telCharRegex = /[ tel:\d().+-]/i;
  const subTelRegex = /[ \d.-]/;
  const telOutRegex = /[ ]{2,}|[-.]{2,}|([-.][ ][-.])/;
  let firstSpacePos = -1;
  let lastSpacePos = -1;
  let prevLastSpacePos = -1;
  let prevATag = null;

  let curStr = '';

  do {
    // Move the selection one character backwards.
    setStart(rng, endContainer, end >= 2 ? end - 2 : 0);
    setEnd(rng, endContainer, end >= 1 ? end - 1 : 0);
    end -= 1;
    rngText = rng.toString();
    curStr = rngText + curStr;

    if (rngText === ' ' || (end - 2) < 0) {
      lastSpacePos = end;
      if (firstSpacePos === -1) {
        firstSpacePos = end;
      }
      if (subNumCheck === true) {
        const prev = endContainer.previousSibling;
        if (prev != null && prev.nodeType === 1 && prev.tagName === 'A' && telRegex.test(prev.textContent) === true) {
          isTel = true;
          prevATag = prev;
        }
      } else if (numCheck === true) {
        const tmpCheck = curStr.match(/([tel:]+)/gi);
        if (tmpCheck != null && (tmpCheck.length > 1 || tmpCheck[0].toLowerCase().indexOf('tel:') !== 0)) {
          numCheck = false;
          lastSpacePos = prevLastSpacePos;
          if (lastSpacePos !== -1) {
            isTel = true;
            if (lastSpacePos > 0) {
              setStart(rng, endContainer, lastSpacePos - 1);
              setEnd(rng, endContainer, lastSpacePos);
            }
          }
        }
      }
      prevLastSpacePos = lastSpacePos;
    }
    if (numCheck === true && (telCharRegex.test(rngText) !== true || (end - 2) < 0)) {
      numCheck = false;
      if (lastSpacePos !== -1) {
        isTel = true;
      }
    }
    if (subNumCheck === true && (subTelRegex.test(rngText) !== true || (end - 2) < 0)) {
      subNumCheck = false;
    }
    // Loop until one of the following is found: a blank space, &nbsp;, delimiter, (end-2) >= 0
  } while ((firstSpacePos === -1 || subNumCheck === true || numCheck === true) && rngText !== '' && rngText.charCodeAt(0) !== 160 && (end - 2) >= 0 && rngText !== delimiter);

  if (isTel === false) {
    end = firstSpacePos;
  } else {
    end = lastSpacePos;
  }

  if (prevATag != null) {
    setStart(rng, prevATag, 0);
    setEnd(rng, endContainer, start);
    document.execCommand('unlink');
  } else if (rangeEqualsDelimiterOrSpace(rng.toString(), delimiter)) {
    setStart(rng, endContainer, end);
    end += 1;
    setEnd(rng, endContainer, start);
  } else if (rng.startOffset === 0) {
    setStart(rng, endContainer, 0);
    setEnd(rng, endContainer, start);
  } else {
    setStart(rng, endContainer, end);
    setEnd(rng, endContainer, start);
  }

  // Exclude last . from word like "www.site.com."
  text = rng.toString();
  if (text.charAt(text.length - 1) === '.') {
    setEnd(rng, endContainer, start - 1);
  }

  text = rng.toString().trim();

  let linkURL = null;

  if (isTel === true) {
    if (telOutRegex.test(text) === false && text.length < 35) {
      matches = text.match(telRegex);
      // 완전한 숫자이면 전화번호 변환하지 않음. (소수점 포함)
      let isAllNumber = (/^[0-9.]{5,}$/.test(text) === true);
      if (isAllNumber === true) {
        const pcnt = (text.match(/[.]/g) || []).length;
        if (pcnt > 1) {
          isAllNumber = false;
        }
      }
      if (matches && isAllNumber === false) {
        let telNum = matches[3].replace(/[ ().+-]/g, '');
        if ((matches[2] !== '+' && telNum.length >= 4) || (matches[2] === '+' && telNum.length >= 7)) {
          if (matches[2] === '+') {
            while (telNum.indexOf('0') === 0) {
              telNum = telNum.substring(1);
            }
          }
          if (telNum.length < 16) {
            linkURL = 'tel:' + matches[2] + telNum;
          }
        }
      }
    }
  } else {
    if (text.indexOf('@') !== -1) {
      const emailRegex = /^(mailto:)?([^\s@:]+@[^\s@]+\.[^\s@]{2,})$/i;
      matches = text.match(emailRegex);
      if (matches) {
        if (matches[1] == null) {
          linkURL = 'mailto:' + matches[2];
        } else {
          linkURL = matches[0];
        }
      }
    } else {
      const protocol = Settings.getDefaultLinkProtocol(editor);

      const urlRegex = /^((https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/){1}|(www\.){1})[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;
      matches = text.match(urlRegex);
      if (matches) {
        if (matches[1] == null) {
          linkURL = protocol + '://' + matches[2];
        } else {
          linkURL = matches[0];
        }
      }
    }
  }

  // matches = text.match(autoLinkPattern);
  // const protocol = Settings.getDefaultLinkProtocol(editor);

  if (linkURL !== null) {
  // if (matches) {
    // if (matches[1] === 'www.') {
    //   matches[1] = protocol + '://www.';
    // } else if (/@$/.test(matches[1]) && !/^mailto:/.test(matches[1])) {
    //   matches[1] = 'mailto:' + matches[1];
    // }

    bookmark = editor.selection.getBookmark();

    editor.selection.setRng(rng);
    // editor.execCommand('createlink', false, matches[1] + matches[2]);
    editor.execCommand('createlink', false, linkURL);

    if (defaultLinkTarget !== false) {
      editor.dom.setAttrib(editor.selection.getNode(), 'target', defaultLinkTarget);
    }

    editor.selection.moveToBookmark(bookmark);
    editor.nodeChanged();
  }
};

const setup = function (editor: Editor) {
  let autoUrlDetectState;

  editor.on('keydown', function (e) {
    if (e.keyCode === 13) {
      return handleEnter(editor);
    }
  });

  // Internet Explorer has built-in automatic linking for most cases
  if (Env.browser.isIE()) {
    editor.on('focus', function () {
      if (!autoUrlDetectState) {
        autoUrlDetectState = true;

        try {
          editor.execCommand('AutoUrlDetect', false, true);
        } catch (ex) {
          // Ignore
        }
      }
    });

    return;
  }

  editor.on('keypress', function (e) {
    if (e.keyCode === 41) {
      return handleEclipse(editor);
    }
  });

  editor.on('keyup', function (e) {
    if (e.keyCode === 32) {
      return handleSpacebar(editor);
    }
  });
};

export default {
  setup,

  // @todo tinymce 업그레이드 시 반영할 것. ios에서 한글 입력 조합 문제로 인해 강제로 이 부분 호출이 필요함.
  apis: {
    handleEnter,
    handleSpacebar
  }
};
