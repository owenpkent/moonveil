# Feasibility: open source dark mode extension for Chrome

Researched 2026-09-14. Items marked (unverified) could not be confirmed from a primary source.

## Verdict

**Feasible, and nothing in the platform blocks it.** Chrome Manifest V3 (the current extension format) supports everything a Dark Reader style engine needs. The real issue is competition, not technology:
Dark Reader is already MIT licensed, very active (v4.9.131 shipped 2026-09-14, 22k stars, 422 contributors), and already on MV3. Rebuilding it to parity would take years. A new project only makes sense if it is narrowly differentiated: speed, no flash of light content on load, better canvas/video/SVG handling, and minimal permissions.

Recommendation: build a lean new engine on WXT + TypeScript. Where useful, reuse MIT code from Dark Reader with attribution (color math, cross-origin fetch relay). Do not use the "Dark Reader" name.

## 1. Landscape

| Project | License | Status | Approach |
|---|---|---|---|
| Dark Reader | MIT (copyright Dark Reader Ltd.) | Very active, MV3 on Chrome | Dynamic CSS analysis and rewrite |
| Midnight Lizard | MIT | Active (CWS v11.0.0, 2026-01), MV3 | Runtime color shifting + per-site CSS |
| Night Eye | Proprietary, freemium | Active | Closed |
| Turn Off the Lights | GPL-2.0 | Active | Dimming overlay, not recoloring |
| Noir | Proprietary | Safari only | n/a |
| Dark Night Mode | OSS | Abandoned since 2020 | n/a |

- Dark Reader is funded by Open Collective donations (maintainer cites ~0.05% donor rate, Discussion #9297) plus paid Apple apps. There was donor backlash over nag prompts in the Apple app.
- Forking and republishing on the Chrome Web Store is permitted under MIT; only the copyright notice has to be kept.
- Trademark: no ™/® found, but USPTO status is (unverified). Malicious clones using the name have been pulled from stores (darkreader.org/blog/attention/). Pick a distinct name.

### Native browser support is not closing the gap
- `chrome://flags/#enable-force-dark` is still only a flag; Chromestatus says "No active development" (ID 5672533924773888).
- No Intent-to-Ship or Google commitment to forced dark mode by default on desktop. Firefox has no equivalent.
- Browsers support `prefers-color-scheme` almost everywhere, but few sites use it: ~7-8% of pages, and `color-scheme` on ~0.2% (Web Almanac 2022; no newer data).

## 2. Differentiation targets (Dark Reader pain points)

- **Performance**: roughly halves Speedometer 3.1 scores (issue #14625); 25s of image analysis on apple.com (DebugBear); CPU pinned at 99% on some pages (#3747); slowdown even on excluded sites (#13814).
- **Flash of light content on load**: long-running reports (#1219, #12064, #13823, #15134).
- **Canvas/video/SVG**: Google Docs image inversion (#14467, #8730), broken SVG colors (#9565), black box over YouTube video (#14981).
- **Unreadable UI**: inputs (#8151), Bing Chat (#10784).
- **Trust**: reviews flag the `<all_urls>` permission (access to every site).

## 3. Rendering approaches

| Approach | Build cost | Quality | Runtime cost |
|---|---|---|---|
| A. CSS filter `invert(1) hue-rotate(180deg)` + re-invert media | Days | Poor (brand colors, photos) | Very low |
| B. Static per-site CSS themes | Low per site | Excellent | None, but does not scale |
| C. Dynamic theme (parse sheets, remap colors, observe DOM) | Months | Good across all sites | Medium to high |
| D. Blink native force-dark | n/a | n/a | Extensions cannot hook it |

Dark Reader's dynamic engine (`src/inject/dynamic-theme/`) is a useful checklist:
- `index.ts`: orchestration, MutationObservers, shadow host iteration.
- `css-rules.ts`: recursive walk through `@media` / `@supports` / `@layer`.
- `modify-colors.ts`, `modify-css.ts`: RGB to HSL lightness remap, memoized.
- `variables.ts`: classifies CSS custom properties.
- `inline-style.ts`: watches `style`, `fill`, `stroke`, `bgcolor` attributes.
- `adopted-style-manger.ts`, `stylesheet-proxy.ts`: patch `CSSStyleSheet.insertRule/replaceSync` and `attachShadow` for CSS-in-JS.
- `image.ts`: background image luminance on a ≤32x32 canvas, SVG color-matrix filters.
- `mv3-proxy.ts`: bridge between the page's own script world (MAIN) and the extension's isolated script world.
- Cross-origin CSS: `style-manager.ts` catches the CORS error and hands the fetch to the background worker (`src/background/utils/network.ts`). It uses `credentials: 'omit'`, a ~10 min cache, and an SSRF guard.

Differentiation idea: use a perceptual color space (OKLCH) instead of HSL, compute overrides once per stylesheet rather than per element, analyze images lazily with IntersectionObserver, and skip sites that already declare `color-scheme: dark`.

## 4. Hard problems

- **Cross-origin stylesheets**: content-script `fetch` is still bound by the page's CORS rules, so a background worker fetch relay is required.
- **Constructable stylesheets / CSS-in-JS**: require prototype patching in the page's own script world.
- **Shadow DOM**: open roots can be walked. Closed roots need `chrome.dom.openOrClosedShadowRoot()`, which is Chrome only.
- **Canvas/WebGL**: pixels cannot be recolored with CSS. Only filter hacks work, and they distort other content. Treat as a known limitation, with a per-site filter fallback.
- **Iframes**: need `all_frames: true`; frames without host permission stay light.
- **Flash of light content**: inject a minimal dark base style at `document_start`, then refine. This is the main place to beat Dark Reader.
- **CSP**: in Chromium, styles injected by content scripts generally bypass page CSP, but this is not a documented guarantee (medium confidence).
- **Sites already dark**: detect via `<meta name="color-scheme">`, computed `color-scheme`, then background luminance sampling.

## 5. MV3 constraints

- The background service worker idles after ~30s: keep state in `chrome.storage` and use `chrome.alarms` for timers.
- `chrome.scripting.registerContentScripts` and `insertCSS` both support `document_start`.
- `chrome.storage.sync` is too small for per-site fix data (100KB total, 8KB/item, 512 items, 1,800 writes/hr). Sync settings only; keep fixes in `storage.local` or bundle them.
- `chrome.userScripts` needs a manual user toggle since Chrome 138. Avoid it.
- Remote-code ban: the engine ships inside the package. CSS and data such as site fix lists may still be fetched remotely.
- **No hard blockers.**

## 6. Chrome Web Store

- One-time developer fee (historically $5).
- Review takes days to weeks. `<all_urls>` is explicitly a reason for extra scrutiny. Each permission needs a written justification.
- Option to reduce friction: ship with `activeTab` + `optional_host_permissions` (per-site opt-in) and offer "all sites" as a separate grant.
- The data disclosure policy was tightened 2026-08-01. Plan for no telemetry.

## 7. Effort estimate

| Milestone | Scope | Estimate |
|---|---|---|
| M0 MVP | Filter mode, per-site toggle, popup, storage | 2-5 days |
| M1 Dynamic core | Same-origin sheets, color remap, inline styles, MutationObserver, dark base at `document_start` | 3-6 weeks |
| M2 Robustness | Cross-origin relay, adoptedStyleSheets, shadow DOM, CSS variables, images, iframes | 2-3 months |
| M3 Parity-ish | Site fix database, settings UI, Firefox/Edge builds, per-site tuning | 6-12+ months |

For reference, Dark Reader has ~10k commits over ~12 years. A 2026-09-14 clone has ~25.7k lines of TypeScript in `src/`, ~7.7k lines of tests, and ~48k lines of per-site fix config.

License audit of that clone: everything is MIT except the bundled Open Sans fonts (`src/ui/assets/fonts/`, Apache-2.0). The only runtime dependency, `malevic`, is also MIT. The site fix configs are covered by the root MIT license.

## 8. Recommended stack

- **TypeScript**, **WXT** (Vite based, MV3 manifest handling, cross-browser builds; the 2026 default). Plasmo has been in alpha with no major release since May 2025.
- **Testing**: Playwright with `launchPersistentContext` + `--load-extension`. Build a visual regression corpus of ~50 popular sites with `toHaveScreenshot`, plus Speedometer 3.1 runs with and without the extension as a CI perf gate.
- **License**: MIT, so Dark Reader code can be reused with its notice kept.

## Decisions

- **Public product**, MIT licensed.
- **Chrome, Firefox, and Edge** from day one, built with WXT from one codebase.
  - Store fees: Chrome Web Store one-time ~$5; Firefox Add-ons (AMO) and Edge Add-ons are free.
  - Edge is Chromium, so the Chrome build works almost unchanged.
  - Firefox MV3 uses event pages instead of service workers, and has its own `Element.openOrClosedShadowRoot()` in place of `chrome.dom`. CSP handling for injected styles is less consistent in Firefox, so test early.
  - Visual regression tests should run in both Chromium and Firefox.

- **Name: Moonveil.** No name collision on Firefox Add-ons or GitHub (checked 2026-09-14). Chrome Web Store and trademark not checked.
- **Base:** fork of Dark Reader with full history, `upstream` remote, built with WXT.

## Sources

- https://github.com/darkreader/darkreader (LICENSE, `src/inject/dynamic-theme/`, issues cited above)
- https://opencollective.com/darkreader, https://darkreader.org/blog/attention/
- https://chromestatus.com/feature/5672533924773888
- https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle
- https://developer.chrome.com/docs/webstore/review-process
- https://developer.chrome.com/docs/webstore/program-policies/permissions
- https://developer.chrome.com/blog/cws-policy-updates-2026
- https://www.chromium.org/Home/chromium-security/extension-content-script-fetches/
- https://www.debugbear.com/blog/chrome-extension-performance-2021
- https://playwright.dev/docs/chrome-extensions
- https://wxt.dev
- https://almanac.httparchive.org/en/2022/css
