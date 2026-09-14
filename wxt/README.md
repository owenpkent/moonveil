# WXT build

WXT builds Chrome, Edge, and Firefox from the unchanged upstream `src/`. The legacy `tasks/` build still works alongside it.

```
npm run wxt:build   # build/wxt/{chrome-mv3,edge-mv3,firefox-mv2}
npm run wxt:zip     # store zips
npm run wxt:dev     # dev server + browser (Chrome); wxt:dev:firefox for Firefox
```

## Layout

- `wxt.config.ts`: entrypoint renames, build constants, public assets, manifest.
- `wxt/build-utils.ts`: ports of `tasks/bundle-css.js`, `bundle-locales.js`, `bundle-manifest.js`, `copy.js`, and the string replacements in `bundle-js.js`.
- `wxt/entrypoints/`: thin wrappers that import upstream modules. The `entrypoints:resolved` hook renames them so output paths match upstream (`inject/index.js`, `ui/popup/index.html`, ...), because `src/` hardcodes those paths.

The build layer adds no changes to `src/`. Branding and removed upstream features (donations, news, mobile promo, key activation) do change `src/`, so expect merge conflicts in those areas when pulling `upstream/main`.

## Verified (2026-09-14, Chrome for Testing 153, headless)

- Service worker starts; a white test page is rendered dark (`rgb(24, 26, 27)`).
- Popup, options, devtools, and stylesheet editor pages render with styles, fonts, and images.
- Only console error: `navigate-to` CSP directive warning, which comes from upstream's manifest.

## Not yet done

- Version still follows upstream (`package.json`).
- `wxt dev` is untested.
- Firefox and Edge builds compile but have not been loaded in a browser.
- Debug-mode manifest tweaks from `tasks/bundle-manifest.js` (tabs/downloads permissions) are not ported.
- Tests (`tests/browser`, `tests/inject`) still use the legacy build.
- Remove `tasks/` once the WXT build is at parity.
