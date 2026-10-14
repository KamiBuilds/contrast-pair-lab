'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Contrast = require('../contrast.js');

// A small DOM adapter for deterministic controller tests; real-browser checks
// are separate because this adapter cannot prove browser or accessibility behavior.
function loadApp() {
  const ids = ['foreground', 'background', 'foreground-error', 'background-error', 'ratio', 'summary', 'preview', 'preview-content', 'pair-label', 'swap', 'preset', 'aaNormal', 'aaLarge', 'aaaNormal', 'aaaLarge'];
  const elements = Object.fromEntries(ids.map(id => [id, {
    value: '', textContent: '', hidden: false, disabled: false, style: {}, attributes: {}, listeners: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, listener) { this.listeners[name] = listener; }
  }]));
  elements.foreground.value = '#183A37';
  elements.background.value = '#F5F1E8';
  const context = { Contrast, document: { getElementById: id => elements[id] } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'), 'utf8'), context);
  return elements;
}

test('invalid edits clear stale verdicts and preview, then valid edits recover', () => {
  const e = loadApp();
  e.foreground.value = '<img src=x onerror=alert(1)>';
  e.foreground.listeners.input();
  assert.equal(e.foreground.attributes['aria-invalid'], 'true');
  assert.match(e['foreground-error'].textContent, /#RGB or #RRGGBB/);
  assert.equal(e.ratio.textContent, '—');
  assert.equal(e.aaNormal.textContent, 'Not checked');
  assert.equal(e.aaNormal.attributes['data-pass'], 'unknown');
  assert.equal(e['preview-content'].hidden, true);
  assert.equal(e.preview.style.color, '');
  assert.equal(e['pair-label'].textContent, 'Preview unavailable');
  assert.equal(e.swap.disabled, true);
  e.foreground.value = '#777';
  e.background.value = '#fff';
  e.background.listeners.input();
  assert.equal(e.foreground.attributes['aria-invalid'], 'false');
  assert.equal(e['foreground-error'].textContent, '');
  assert.equal(e['preview-content'].hidden, false);
  assert.equal(e.ratio.textContent, '4.48:1');
  assert.equal(e.aaNormal.textContent, 'Fail');
  assert.equal(e.aaLarge.textContent, 'Pass');
  assert.equal(e.swap.disabled, false);
});

test('swap reverses normalized colors without changing the ratio', () => {
  const e = loadApp();
  const ratio = e.ratio.textContent;
  e.swap.listeners.click();
  assert.equal(e.foreground.value, '#F5F1E8');
  assert.equal(e.background.value, '#183A37');
  assert.equal(e.ratio.textContent, ratio);
  assert.equal(e.preview.style.color, '#F5F1E8');
});

test('sample pairs recover from invalid input and unknown samples do nothing', () => {
  const e = loadApp();
  e.foreground.value = '#badvalue';
  e.foreground.listeners.input();
  e.preset.value = 'gray';
  e.preset.listeners.change();
  assert.equal(e.foreground.value, '#777777');
  assert.equal(e.background.value, '#FFFFFF');
  assert.equal(e.aaNormal.textContent, 'Fail');
  for (const [name, fg, bg] of [['ink', '#183A37', '#F5F1E8'], ['mono', '#000000', '#FFFFFF'], ['low', '#AAAAAA', '#FFFFFF']]) {
    e.preset.value = name;
    e.preset.listeners.change();
    assert.equal(e.foreground.value, fg);
    assert.equal(e.background.value, bg);
  }
  e.preset.value = '__proto__';
  e.preset.listeners.change();
  assert.equal(e.foreground.value, '#AAAAAA');
});

test('initial render shows normalized pair, ratio and textual threshold results', () => {
  const e = loadApp();
  const ratio = Contrast.contrastRatio(e.foreground.value, e.background.value);
  assert.equal(e.ratio.textContent, ratio.toFixed(2) + ':1');
  assert.equal(e.aaNormal.textContent, 'Pass');
  assert.equal(e.aaaNormal.textContent, 'Pass');
  assert.equal(e['pair-label'].textContent, '#183A37 on #F5F1E8');
  assert.equal(e.preview.style.color, '#183A37');
  assert.equal(e.preview.style.backgroundColor, '#F5F1E8');
  assert.equal(e.summary.textContent.includes('AA normal text Pass'), true);
});
