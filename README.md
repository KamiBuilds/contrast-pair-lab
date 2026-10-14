# Contrast Pair Lab

A dependency-free, offline browser inspector for **opaque sRGB text color contrast**. Enter two hex colors, see a live text specimen, and check the WCAG 2.2 AA/AAA thresholds for normal and large text.

No accounts, analytics, uploads, build step, fonts, CDNs or runtime packages. The app makes no network requests beyond its local HTML/CSS/JavaScript assets. The two W3C reference links navigate externally only when clicked. Input is not stored by the app.

## Quick start

```sh
git clone https://github.com/KamiBuilds/contrast-pair-lab.git
cd contrast-pair-lab
```

Open `index.html` in a current browser (for example, double-click it in your file manager). No installation is required. Keep `contrast.js`, `app.js` and `styles.css` alongside it.

If your browser or enterprise policy blocks local scripts, serve **this repository only** using Python 3:

```sh
python3 -m http.server 8769 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8769>. On Windows with the Python launcher, use `py -3 -m http.server 8769 --bind 127.0.0.1`. Stop it with Ctrl+C. If the port is busy, choose another unused port; do not stop an existing service. This is a local development server, not a production deployment.

## Use

1. Enter text and background colors as `#RGB` or `#RRGGBB`. Case and surrounding whitespace are normalized for calculation. Alpha, named colors, CSS functions, gradients and other color spaces are intentionally rejected.
2. Read **Pass / Fail** in the text table. A pass applies only to that color pair and threshold, not the whole page or all WCAG requirements.
3. Use **Swap text & background** to reverse the specimen, or choose a sample pair.
4. Invalid input immediately clears results and hides the specimen, rather than keeping an old passing result. Correct the input or select a sample to recover.

The controls and result table have fixed colors; the specimen deliberately uses your colors, including unreadable ones. Each input has an associated label and error description, results use words rather than color alone, and a polite status region announces changes. Keyboard and responsive checks are part of manual browser verification, not a claim of full accessibility certification.

See [sample pairs and expected outcomes](examples/README.md).

## Method and scope

Relative luminance uses the [WCAG 2.2 sRGB definition](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance): normalize channels to 0–1, linearize with `c / 12.92` when `c <= 0.04045`, otherwise `((c + 0.055) / 1.055) ^ 2.4`, then weight by `0.2126 R + 0.7152 G + 0.0722 B`. Ratio is `(lighter + 0.05) / (darker + 0.05)`.

| Text size | AA minimum | AAA enhanced |
| --- | --- | --- |
| Normal | 4.5:1 | 7:1 |
| Large | 3:1 | 4.5:1 |

Large means at least **18pt regular (24 CSS px)** or **14pt bold**. Preview normal text is 16px, its large text is 30px, and its bold example is 14pt. Results compare the **unrounded** ratio. The two-decimal display is only a presentation value: a displayed `4.50:1` can still fail AA normal if the underlying ratio is below 4.5.

References: [SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [SC 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html).

This is not a page crawler or conformance audit. It does not handle alpha compositing, images, gradients, display-P3, APCA, non-text controls, font rendering, visual impairments individually, or the other WCAG requirements. Aim above the minimum; typography and anti-aliasing can reduce practical readability.

## Tests and checks

Development checks require **Node.js 22+ with npm**, not Python. There are no dependencies to install; a lockfile is included for reproducible empty-dependency setup.

```sh
npm ci --ignore-scripts
npm test
npm run check
git diff --check
```

Tests exercise strict parsing, known luminance and contrast vectors, both transfer-function branches, exact threshold boundaries, invalid numbers, initial UI state, input invalidation/recovery, swap and all samples. The UI unit tests use a small DOM adapter: they test controller behavior, not browser rendering or assistive technologies. `npm run check` syntax-checks production and test JavaScript. No GitHub Actions workflow is included because the publishing credential lacks workflow scope; these commands can be used in your own CI.

For browser smoke testing: open the page, try every sample, swap colors, paste invalid input and recover, Tab through controls, then resize to a narrow mobile viewport. Confirm no horizontal scrolling, console errors, or unexpected network requests, and use browser offline mode to repeat edits. Test the direct-file path as well as a local HTTP server.

### Platform evidence

| Platform | Status |
| --- | --- |
| Linux x86_64, Node.js 24.20.0 / npm 11.19.0 | Live-tested automated checks |
| Linux, Chromium | Live-tested browser flows on file and loopback HTTP |
| macOS / Windows, current Chromium / Firefox / Safari where available | Designed to work; not live-tested |
| Node.js 22, other Linux distributions and CPU architectures | Designed to work; not live-tested |
| Screen readers / alternate browser engines | Not live-tested; no conformance claim |

## Update

Close the page, then from a clean checkout:

```sh
git pull --ff-only
npm test
npm run check
```

Reopen or reload the page. Keep local modifications separate; Git will refuse an unsafe fast-forward. Testing after updates requires Node, but using the app does not.

## Uninstall / cleanup

Close the page. If you started the optional local server, stop **that terminal's process** with Ctrl+C. There are no installed packages, app-managed saved data, service workers, or background services. You can delete the cloned directory in your file manager after preserving any local changes. `npm ci` may create npm metadata under `node_modules`; deleting that directory is optional and safe inside this clone.

## Files and license

`contrast.js` is the calculation module, `app.js` handles UI state, and `tests/` uses Node's built-in test runner. All source, styles and specimen copy are original for this project. [MIT](LICENSE).
