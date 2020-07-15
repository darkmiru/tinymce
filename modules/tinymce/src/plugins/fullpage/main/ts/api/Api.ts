import { CustomHeadSpecs } from '../Plugin';

// @todo 업데이트 시에 추가할 것. (API 새로 추가. 이 파일 전체 추가할 것.)

/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const get = (headState: CustomHeadSpecs) => {
  const getHeadState = (): string => {
    return headState.get();
  };

  const setHeadState = (headStr: string): void => {
    return headState.set(headStr);
  };

  return {
    getHeadState,
    setHeadState
  };
};

export { get };
