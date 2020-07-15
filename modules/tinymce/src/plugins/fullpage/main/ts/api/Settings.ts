/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const shouldHideInSourceView = function (editor) {
  return editor.getParam('fullpage_hide_in_source_view');
};

const getDefaultXmlPi = function (editor) {
  return editor.getParam('fullpage_default_xml_pi');
};

const getDefaultEncoding = function (editor) {
  return editor.getParam('fullpage_default_encoding');
};

const getDefaultFontFamily = function (editor) {
  return editor.getParam('fullpage_default_font_family');
};

const getDefaultFontSize = function (editor) {
  return editor.getParam('fullpage_default_font_size');
};

const getDefaultTextColor = function (editor) {
  return editor.getParam('fullpage_default_text_color');
};

// @todo : 업그레이드 시 추가할 것. 반드시~!
const getDefaultInlineCSS = function (editor) {
  return editor.getParam('fullpage_default_inline_css');
};
const getDefaultCSS = function (editor) {
  return editor.getParam('fullpage_default_css');
};
const getStyleKey =  function (editor) {
  return editor.getParam('fullpage_default_css_key');
};

const getBodyAttr = function (editor) {
  return editor.getParam('fullpage_body_attr');
};

const getDefaultTitle = function (editor) {
  return editor.getParam('fullpage_default_title');
};

const getDefaultDocType = function (editor) {
  return editor.getParam('fullpage_default_doctype', '<!DOCTYPE html>');
};

export default {
  shouldHideInSourceView,
  getDefaultXmlPi,
  getDefaultEncoding,
  getDefaultFontFamily,
  getDefaultFontSize,
  getDefaultTextColor,
  getDefaultInlineCSS,
  getDefaultCSS,
  getStyleKey,
  getBodyAttr,
  getDefaultTitle,
  getDefaultDocType
};