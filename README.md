# Moonveil

Open source dark mode for every website, for Chrome, Edge, and Firefox.

Moonveil is based on [Dark Reader](https://github.com/darkreader/darkreader) (MIT) and tracks it as `upstream`. Planned focus: faster page processing, no flash of light content on load, better canvas/video/SVG handling, and minimal permissions. See [FEASIBILITY.md](FEASIBILITY.md).

Status: early. Not yet published to any extension store.

## Build

Requires Node.js 22+.

```
npm install
npm run wxt:build   # build/wxt/{chrome-mv3,edge-mv3,firefox-mv2}
npm run wxt:zip     # store zips
```

Load `build/wxt/chrome-mv3` via `chrome://extensions` > Developer mode > Load unpacked.

Build details: [wxt/README.md](wxt/README.md). The original Dark Reader README is kept at [docs/UPSTREAM_README.md](docs/UPSTREAM_README.md).

## Syncing upstream

```
git remote add upstream https://github.com/darkreader/darkreader.git
git fetch upstream
git merge upstream/main
```

## License

MIT. Includes code copyright Dark Reader Ltd.; see [LICENSE](LICENSE). Bundled Open Sans fonts are Apache-2.0 (`src/ui/assets/fonts/LICENSE.txt`).
