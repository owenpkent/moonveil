// Ports of the non-JS steps in tasks/ (bundle-css, bundle-locales, bundle-manifest, copy)
// so WXT emits the same output tree as the legacy build.
import fs from 'node:fs';
import path from 'node:path';

import less from 'less';
import type {Plugin} from 'vite';

const root = path.resolve(import.meta.dirname, '..');
const src = (...p: string[]) => path.join(root, 'src', ...p);

export function isChromium(browser: string) {
    return browser === 'chrome' || browser === 'edge';
}

// Mirrors the replace constants in tasks/bundle-js.js.
export function buildConstants(browser: string, debug: boolean): Record<string, string> {
    return {
        __DEBUG__: String(debug),
        __CHROMIUM_MV2__: 'false',
        __CHROMIUM_MV3__: String(isChromium(browser)),
        __FIREFOX_MV2__: String(browser === 'firefox'),
        __THUNDERBIRD__: 'false',
        __PLUS__: 'false',
        __PORT__: '-1',
        __TEST__: 'false',
        __WATCH__: 'false',
        __LOG__: 'false',
    };
}

// Legacy entry path -> WXT entrypoint name. Keeps the runtime paths that src/ hardcodes
// (e.g. chrome.runtime.getURL('/ui/popup/index.html'), files: ['/inject/index.js']).
export const entrypointNames: Record<string, string> = {
    'background': 'background/index',
    'inject': 'inject/index',
    'inject-fallback': 'inject/fallback',
    'inject-proxy': 'inject/proxy',
    'inject-color-scheme-watcher': 'inject/color-scheme-watcher',
    'ui-popup': 'ui/popup/index',
    'ui-options': 'ui/options/index',
    'ui-devtools': 'ui/devtools/index',
    'ui-stylesheet-editor': 'ui/stylesheet-editor/index',
};

// Chunk-level string replacements from tasks/bundle-js.js (applied after transpilation).
export function legacyReplacePlugin(browser: string): Plugin {
    const map: Record<string, string> = isChromium(browser) ? {
        'chrome.browserAction.setIcon': 'chrome.action.setIcon',
        'chrome.browserAction.setBadgeBackgroundColor': 'chrome.action.setBadgeBackgroundColor',
        'chrome.browserAction.setBadgeText': 'chrome.action.setBadgeText',
    } : {
        'chrome.fontSettings.getFontList': `chrome['font' + 'Settings']['get' + 'Font' + 'List']`,
        'chrome.fontSettings': `chrome['font' + 'Settings']`,
    };
    const keys = Object.keys(map).sort((a, b) => b.length - a.length);
    return {
        name: 'darkmode:legacy-replace',
        renderChunk(code, chunk) {
            let out = code;
            for (const key of keys) {
                out = out.split(key).join(map[key]);
            }
            if (browser === 'firefox' && chunk.fileName === 'inject/index.js') {
                out = out.split('eval(').join('void(');
            }
            return out === code ? null : {code: out, map: null};
        },
    };
}

function listFiles(dir: string): string[] {
    return fs.readdirSync(dir, {withFileTypes: true, recursive: true})
        .filter((e) => e.isFile())
        .map((e) => path.join(e.parentPath, e.name));
}

function copyDir(from: string, to: string) {
    return listFiles(from).map((absoluteSrc) => ({
        absoluteSrc,
        relativeDest: path.join(to, path.relative(from, absoluteSrc)),
    }));
}

// tasks/copy.js
export function staticAssets() {
    return [
        ...copyDir(src('config'), 'config'),
        ...copyDir(src('icons'), 'icons'),
        ...copyDir(src('ui/assets'), 'ui/assets'),
    ];
}

// tasks/bundle-locales.js
function parseLocaleFile(file: string) {
    const text = fs.readFileSync(file, 'utf8').replace(/^#.*?$/gm, '');
    const messages: Record<string, {message: string}> = {};
    const regex = /@([a-z0-9_]+)/ig;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
        const start = match.index + match[0].length;
        let end = text.indexOf('@', start);
        if (end < 0) {
            end = text.length;
        }
        messages[match[1]!] = {message: text.substring(start, end).trim()};
    }
    return messages;
}

export function locales() {
    const files = listFiles(src('_locales')).filter((f) => f.endsWith('.config'));
    const codes = new Set(files.map((f) => path.basename(f).split('.').at(-2)!));
    return [...codes].map((code) => {
        let merged = {};
        for (const f of files.filter((f) => path.basename(f).split('.').at(-2) === code)) {
            merged = {...merged, ...parseLocaleFile(f)};
        }
        return {
            relativeDest: `_locales/${code.replace('-', '_')}/messages.json`,
            contents: JSON.stringify(merged, null, 4),
        };
    });
}

// tasks/bundle-css.js. Less is compiled outside Vite on purpose: url()s in src/ui/*.less
// are written relative to the emitted ui/<page>/style.css, not to the source file.
export async function styles() {
    const pages = ['popup', 'options', 'devtools', 'stylesheet-editor'];
    return Promise.all(pages.map(async (page) => {
        const file = src('ui', page, 'style.less');
        let input = fs.readFileSync(file, 'utf8');
        const start = input.indexOf('/* @plus-start */');
        const end = input.indexOf('/* @plus-end */', start);
        if (start >= 0 && end >= 0) {
            input = input.substring(0, start) + input.substring(end + '/* @plus-end */'.length);
        }
        const output = await less.render(input, {paths: [path.dirname(file)], math: 'always'});
        return {relativeDest: `ui/${page}/style.css`, contents: output.css};
    }));
}

// tasks/bundle-manifest.js: shallow merge of src/manifest.json and the platform patch.
export function legacyManifest(browser: string, debug: boolean) {
    const read = (name: string) => JSON.parse(fs.readFileSync(src(name), 'utf8'));
    const patch = isChromium(browser) ? read('manifest-chrome-mv3.json') : read('manifest-firefox.json');
    const manifest = {...read('manifest.json'), ...patch};
    if (isChromium(browser)) {
        delete manifest.browser_action;
    } else {
        // WXT emits a generated background page for scripts, equivalent to background/index.html.
        manifest.background = {scripts: ['background/index.js']};
    }
    if (debug) {
        manifest.version_name = 'Debug';
    }
    return manifest;
}
