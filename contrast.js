/* WCAG 2.2 opaque sRGB calculations; shared by the browser and Node tests. */
(function (root) {
  'use strict';
  function normalizeHex(value) {
    if (typeof value !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())) {
      throw new TypeError('Use #RGB or #RRGGBB opaque sRGB colors.');
    }
    const hex = value.trim().slice(1).toUpperCase();
    return '#' + (hex.length === 3 ? [...hex].map(c => c + c).join('') : hex);
  }
  function luminance(value) {
    const hex = normalizeHex(value).slice(1);
    const rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const linear = rgb.map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
  function contrastRatio(foreground, background) {
    const a = luminance(foreground);
    const b = luminance(background);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  function evaluateRatio(ratio) {
    if (typeof ratio !== 'number' || !Number.isFinite(ratio) || ratio < 1 || ratio > 21) {
      throw new TypeError('Contrast ratio must be between 1 and 21.');
    }
    return { aaNormal: ratio >= 4.5, aaLarge: ratio >= 3, aaaNormal: ratio >= 7, aaaLarge: ratio >= 4.5 };
  }
  const api = Object.freeze({ normalizeHex, luminance, contrastRatio, evaluateRatio });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Contrast = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
