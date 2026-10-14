/* Browser controller: all user colors are normalized before entering styles. */
(function () {
  'use strict';
  const get = id => document.getElementById(id);
  const foreground = get('foreground');
  const background = get('background');
  const keys = ['aaNormal', 'aaLarge', 'aaaNormal', 'aaaLarge'];
  function render() {
    const colors = [foreground, background].map(field => {
      try {
        const color = Contrast.normalizeHex(field.value);
        field.setAttribute('aria-invalid', 'false');
        get(field === foreground ? 'foreground-error' : 'background-error').textContent = '';
        return color;
      } catch (error) {
        field.setAttribute('aria-invalid', 'true');
        get(field === foreground ? 'foreground-error' : 'background-error').textContent = error.message;
        return null;
      }
    });
    const [fg, bg] = colors;
    const valid = colors.every(Boolean);
    get('swap').disabled = !valid;
    get('preview-content').hidden = !valid;
    if (!valid) {
      get('ratio').textContent = '—';
      get('pair-label').textContent = 'Preview unavailable';
      get('preview').style.color = '';
      get('preview').style.backgroundColor = '';
      for (const key of keys) {
        get(key).textContent = 'Not checked';
        get(key).setAttribute('data-pass', 'unknown');
      }
      get('summary').textContent = 'Not checked. Enter two valid opaque hex colors.';
      return;
    }
    const ratio = Contrast.contrastRatio(fg, bg);
    const results = Contrast.evaluateRatio(ratio);
    get('ratio').textContent = ratio.toFixed(2) + ':1';
    get('pair-label').textContent = fg + ' on ' + bg;
    get('preview').style.color = fg;
    get('preview').style.backgroundColor = bg;
    for (const key of keys) {
      get(key).textContent = results[key] ? 'Pass' : 'Fail';
      get(key).setAttribute('data-pass', String(results[key]));
    }
    get('summary').textContent = 'Contrast ' + ratio.toFixed(2) + ' to 1. AA normal text ' + get('aaNormal').textContent + '. AA large text ' + get('aaLarge').textContent + '. AAA normal text ' + get('aaaNormal').textContent + '. AAA large text ' + get('aaaLarge').textContent + '.';
  }
  foreground.addEventListener('input', render);
  background.addEventListener('input', render);
  get('swap').addEventListener('click', () => {
    if (get('swap').disabled) return;
    const fg = Contrast.normalizeHex(foreground.value);
    foreground.value = Contrast.normalizeHex(background.value);
    background.value = fg;
    render();
  });
  const samples = new Map([
    ['ink', ['#183A37', '#F5F1E8']],
    ['mono', ['#000000', '#FFFFFF']],
    ['gray', ['#777777', '#FFFFFF']],
    ['low', ['#AAAAAA', '#FFFFFF']]
  ]);
  get('preset').addEventListener('change', () => {
    const pair = samples.get(get('preset').value);
    if (!pair) return;
    [foreground.value, background.value] = pair;
    get('preset').value = '';
    render();
  });
  render();
})();
