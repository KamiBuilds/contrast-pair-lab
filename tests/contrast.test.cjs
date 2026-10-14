'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

test('evaluates exact thresholds and refuses rounded false positives', () => {
  const { evaluateRatio } = require('../contrast.js');
  for (const [ratio, expected] of [
    [1, [false, false, false, false]],
    [2.99999, [false, false, false, false]],
    [3, [false, true, false, false]],
    [4.49999, [false, true, false, false]],
    [4.5, [true, true, false, true]],
    [6.99999, [true, true, false, true]],
    [7, [true, true, true, true]],
    [21, [true, true, true, true]]
  ]) assert.deepEqual(Object.values(evaluateRatio(ratio)), expected);
  for (const value of [0, 22, NaN, Infinity, '7', null]) {
    assert.throws(() => evaluateRatio(value), /between 1 and 21/);
  }
});

test('normalizes opaque short and long hex colors without accepting CSS syntax', () => {
  const { normalizeHex } = require('../contrast.js');
  assert.equal(normalizeHex(' #aB3 '), '#AABB33');
  assert.equal(normalizeHex('#a0b1c2'), '#A0B1C2');
  for (const value of ['', 'abc', '#12', '#1234', '#12345678', '#gg0000', 'red', 'rgb(0,0,0)', '#fff\nscript', null, 123]) {
    assert.throws(() => normalizeHex(value), /#RGB or #RRGGBB/);
  }
});

test('computes reference sRGB luminance and black/white contrast', () => {
  const { luminance, contrastRatio } = require('../contrast.js');
  assert.equal(luminance('#000'), 0);
  assert.equal(luminance('#fff'), 1);
  assert.ok(Math.abs(luminance('#f00') - 0.2126) < 1e-12);
  assert.ok(Math.abs(luminance('#0f0') - 0.7152) < 1e-12);
  assert.ok(Math.abs(luminance('#00f') - 0.0722) < 1e-12);
  // 10/255 is in the linear branch; 11/255 is in the power branch.
  assert.ok(Math.abs(luminance('#0a0a0a') - (10 / 255 / 12.92)) < 1e-12);
  assert.ok(Math.abs(luminance('#0b0b0b') - (((11 / 255 + 0.055) / 1.055) ** 2.4)) < 1e-12);
  assert.equal(contrastRatio('#000', '#fff'), 21);
  assert.equal(contrastRatio('#123456', '#123456'), 1);
  assert.equal(contrastRatio('#f00', '#fff'), contrastRatio('#fff', '#f00'));
  assert.ok(Math.abs(contrastRatio('#777', '#fff') - 4.478089453577214) < 1e-12);
  assert.throws(() => contrastRatio('#000', 'transparent'), /#RGB or #RRGGBB/);
});
