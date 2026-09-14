import replace from '@rollup/plugin-replace';
import {defineConfig} from 'wxt';

import {
    buildConstants,
    entrypointNames,
    legacyManifest,
    legacyReplacePlugin,
    locales,
    staticAssets,
    styles,
} from './wxt/build-utils';

export default defineConfig({
    entrypointsDir: 'wxt/entrypoints',
    publicDir: 'wxt/public',
    modulesDir: 'wxt/modules',
    outDir: 'build/wxt',
    imports: false,
    targetBrowsers: ['chrome', 'edge', 'firefox'],
    zip: {
        artifactTemplate: 'moonveil-{{version}}-{{browser}}.zip',
        sourcesTemplate: 'moonveil-{{version}}-sources.zip',
    },

    vite: (env) => {
        const debug = env.mode === 'development';
        return {
            // Legacy release builds are not minified; readable bundles also ease AMO review.
            build: {minify: false},
            resolve: {
                alias: {'@plus': new URL('./src/stubs', import.meta.url).pathname},
            },
            oxc: {
                jsx: {runtime: 'classic', pragma: 'm'},
            },
            plugins: [
                {
                    ...replace({preventAssignment: true, values: buildConstants(env.browser, debug)}),
                    enforce: 'post',
                },
                legacyReplacePlugin(env.browser),
            ],
        };
    },

    hooks: {
        'entrypoints:resolved': (_wxt, entrypoints) => {
            for (const entrypoint of entrypoints) {
                const name = entrypointNames[entrypoint.name];
                if (!name) {
                    throw new Error(`No legacy output path for entrypoint "${entrypoint.name}"`);
                }
                entrypoint.name = name;
            }
        },
        'build:publicAssets': async (_wxt, files) => {
            files.push(...staticAssets(), ...locales(), ...(await styles()));
        },
        'build:manifestGenerated': (wxt, manifest) => {
            const legacy = legacyManifest(wxt.config.browser, wxt.config.mode === 'development');
            const isDev = wxt.config.command === 'serve';
            const wxtPermissions = manifest.permissions ?? [];
            for (const key of Object.keys(manifest)) {
                if (!['name', 'version', 'version_name', 'description'].includes(key)) {
                    delete (manifest as Record<string, unknown>)[key];
                }
            }
            Object.assign(manifest, legacy, {version: manifest.version});
            if (isDev) {
                // Keep what WXT's dev server needs for reloads.
                manifest.permissions = [...new Set([...(legacy.permissions ?? []), ...wxtPermissions])];
                delete manifest.content_security_policy;
            }
        },
    },
});
