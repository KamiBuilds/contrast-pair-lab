'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('page wires local deferred scripts, input labels, error hints and live status', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
  for (const id of ['foreground', 'background', 'preset']) assert.ok(html.includes('for="' + id + '"'));
  for (const id of ['foreground', 'background']) assert.ok(html.includes('aria-describedby="hex-hint ' + id + '-error"'));
  assert.match(html, /id="summary"[^>]*role="status"/);
  assert.match(html, /<script src="contrast.js" defer><\/script>\s*<script src="app.js" defer>/);
  assert.match(html, /<noscript>/);
  assert.match(html, /id="preview-content" hidden/);
  assert.match(html, /default-src 'none'/);
  assert.match(html, /img-src data:/, 'the local empty data favicon must be permitted by CSP');
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  for (const id of ['aaNormal', 'aaLarge', 'aaaNormal', 'aaaLarge']) {
    assert.match(html, new RegExp('id="' + id + '"[^>]*>Not checked<'));
  }
});
