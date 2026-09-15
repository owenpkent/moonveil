<h2 align="center">Contributing to Moonveil</h2>

<p align="center">You can contribute to and help Moonveil in many ways. Continue reading to learn how, and thank you in advance!</p>

Moonveil is a fork of [Dark Reader](https://github.com/darkreader/darkreader). Most of its site-fix format, dev tools, and build system come directly from that project.

## Disabling Moonveil on your site

Website pages can request Moonveil to disable itself by embedding a "Moonveil lock". The "lock" is a `<meta>` tag with `name` attribute set to `darkreader-lock` which is a child of the `<head>` tag in the document. This attribute name is kept for compatibility with the upstream Dark Reader lock convention, so a single lock tag works for both extensions.

### Disabling Moonveil statically

Add `<meta name="darkreader-lock">` within your HTML document in `<head>` like so:
```html
<head>
    <meta name="darkreader-lock">
</head>
```

### Disabling Moonveil dynamically

Add the "lock" dynamically like so (assuming the browser has already parsed enough of the document to create a `head` element):
```js
const lock = document.createElement('meta');
lock.name = 'darkreader-lock';
document.head.appendChild(lock);
```

## Adding a website that is already dark

If a website is **already dark** and meets the following requirements:

- The entire website - including all subpages - is dark by default, regardless of the system's preferred color scheme.
- The URL is the actual website address. No redirects of any kind are allowed.
- The website is complete and finished. Any website in the design or development phase or any other incomplete status is not permitted. These statuses can include any placeholder web pages or verbiage about coming soon, the website being under construction, the website having moved, etc.

Then you can **add it to the [dark-sites.config](https://github.com/owenpkent/moonveil/blob/main/src/config/dark-sites.config) file**.

**Please maintain the alphabetical order of the websites listed in this file.**

## Fixing incorrect inversions

If any **element** on a web page is **not inverted or styled correctly**, you can fix it by specifying the appropriate [**CSS selector**](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors). Use the [**dynamic-theme-fixes.config**](https://github.com/owenpkent/moonveil/blob/main/src/config/dynamic-theme-fixes.config) file for Dynamic Theme mode and the [**inversion-fixes.config**](https://github.com/owenpkent/moonveil/blob/main/src/config/inversion-fixes.config) file for Filter and Filter+ modes.

**Please maintain the alphabetical order of the websites listed, use short selectors, and preserve the code style in these files.**

You can learn how to create a fix for the appropriate mode below.

> **Note:** Because these config files (and the site-fix format itself) come from upstream Dark Reader, a broadly applicable site fix - one that isn't specific to Moonveil - is often just as useful to the [upstream Dark Reader project](https://github.com/darkreader/darkreader). Upstream site fixes are merged periodically, so consider submitting general fixes there too, in addition to (or instead of) here, so all users of the format benefit.

## How to use the Dev Tools

Moonveil includes its own developer tools, allowing easier modification of its rules and quicker previews. The Dev Tools help you **fix minor issues** on a web page. These can include a dark icon on a dark background, removing a bright background, adding a white background to a transparent image, etc.

Common use cases:

In **Dynamic mode**, if the page looks partially dark and bright, it is considered a bug. Individual elements or containers might need to be tweaked.

In **Filter mode**, it is a common practice to invert elements on the page that are already dark.

The Dev Tools can help you fix these and other rule bugs.

### Navigating to the Dev Tools

- Open **Chrome Dev Tools** (`F12`) in Chrome or "Inspector" (`Ctrl+Shift+C`) in Firefox.
- Click on **element picker** (top-left corner). It is enabled automatically in Firefox.
- Pick an incorrectly inverted element.
- Choose a **[selector](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors)** for that element or all similar elements (for example, if it has `class="icon small"`, the selector may look like `.icon`).
- Click the Moonveil icon to open the extension's popup window.
- Switch to the **More** tab.
- Click the **⛭ All settings** button at the bottom.
- Switch to the **Advanced** section on the left.
- Click the **🛠️ Dev tools** button at the bottom.
- (Optional but helpful) Switch to the **Per Site Editor** tab at the bottom and type in the domain name you wish to update or add.
- Edit or add a block containing the URL and selectors to invert, using the [rules below](#editor--rule-syntax).
- Click **Apply**.
- Check how the site looks both in **Light** and **Dark** modes.
- If the **fix works**, open **[dynamic-theme-fixes.config](https://github.com/owenpkent/moonveil/blob/main/src/config/dynamic-theme-fixes.config)** or **[inversion-fixes.config](https://github.com/owenpkent/moonveil/blob/main/src/config/inversion-fixes.config)**.
- Click **Edit** (requires being logged in to GitHub).
- **Insert your fix** there (copying and pasting it from the Dev Tools). Preserve **alphabetic order** by URL.
- Provide a **short description** of what you have done.
- Click **Propose file change**.
- Review your changes. Click **Create pull request**.
- Once you create the pull request, GitHub Actions will run tests behind the scenes to ensure your submission has the right code style. This will take a few minutes.
- If you see a **red cross**, click **Details** to see what is wrong and edit the existing Pull Request.
- When you see a **green checkmark**, then everything is fine.
- A Moonveil maintainer will **review** and merge your changes.

## Editor & Rule Syntax

```CSS
dynamic-theme-fixes.config
================================

example.com

INVERT
.icon

CSS
.wrong-element-colors {
    background-color: ${white} !important;
    color: ${black} !important;
}

IGNORE INLINE STYLE
.color-picker

IGNORE IMAGE ANALYSIS
.logo
```

### URL

The fix starts with the domain name, like `example.com`. The `www` part should be omitted.

If the fix affects a particular subdomain, this exact subdomain should be specified like `sub.domain.com`.

Some websites have different top level domains depending on the user's location. A `*` can be used like `example.*`.

If the same fix applies to a website (or similar websites) that can have multiple domain names or subdomains,
they can be listed on separate lines, starting with the most popular one:
```
example.com
sub.example.com
example.mirror.com
```

The use of `*` wildcard is discouraged; it can only be used as the last resort.

| Rule | Description | Notes / Examples |
|---|---|---|
| **INVERT** | Inverts specified elements. | **Dynamic Mode**: INVERT only for dark images that are invisible on dark backgrounds. |
| **CSS** | Adds custom CSS to a web page. | `!important` keyword should be specified for each CSS property to prevent overrides by other stylesheets.<br>**Dynamic mode** supports `${COLOR}` template, where `COLOR` is a color value before the inversion. <br>*Example*: `${white}` will become `${black}` in dark mode. |
| **IGNORE&nbsp;INLINE&nbsp;STYLE** | Prevents inline style analysis of matched elements. | *Example*: `<p style="color: red">` element's style attribute will not be changed. |
| **IGNORE&nbsp;IMAGE&nbsp;ANALYSIS** | Prevents background images from being analyzed for matched selectors. |  |

## Dynamic variables

When making a fix for background or text colors, instead of using hardcoded colors (like `#fff`, `#000`, `black` or `white`), please use CSS variables that are generated based on the user's settings:

```CSS
dynamic-theme-fixes.config
================================
example.com

CSS
.logo {
    background-color: var(--darkreader-neutral-background) !important;
}
.footer > p {
    color: var(--darkreader-neutral-text) !important;
}

```

These variable names are kept as-is from upstream Dark Reader so the two projects' config files stay compatible. Here is a full table of available CSS variables:

| Variable | Description | Use |
|---|---|---|
| **`--darkreader-neutral-background`** | Neutral background color that <br>corresponds to the user's settings. | Mostly used for elements that have <br>the wrong background color. |
| **`--darkreader-neutral-text`** | Neutral text color that <br>corresponds to the user's settings. | Used for elements with the wrong text color. |
| **`--darkreader-selection-background`** | The background color setting <br>defined by the user. | The user's Background Color setting. |
| **`--darkreader-selection-text`** | The text color setting <br>defined by the user. | The user's Text Color setting. |

## Fixes for Filter and Filter+ mode

```CSS
inversion-fixes.config
================================

example.com

INVERT
.icon
.button
#player

NO INVERT
#player *

REMOVE BG
.bg-photo

CSS
.overlay {
    background: rgba(255, 255, 255, 0.5);
}
```

- Filter and Filter+ work by inverting the entire web page and reverting necessary elements (images, videos, etc.) listed in the `INVERT` section.
- If an inverted element contains images or other content that becomes incorrectly displayed, use the `NO INVERT` rule.
- `REMOVE BG` removes the background image from an element and forces a black background.

## Building and debugging

To build and debug the extension, **install the [Node.js](https://nodejs.org/)** LTS version.
Install development dependencies by running `npm install` in the project's root folder.

### WXT build (primary)

Moonveil's primary build is [WXT](https://wxt.dev/). To build for all targets:

```
npm run wxt:build
```

This produces unpacked extensions in `build/wxt/chrome-mv3`, `build/wxt/edge-mv3`, and `build/wxt/firefox-mv2`.

For a live-reloading dev build:

```
npm run wxt:dev
```

(use `npm run wxt:dev:firefox` to target Firefox instead).

#### Chrome and Edge

- Open the `chrome://extensions` page (or `edge://extensions`).
- Enable **Developer mode**.
- Click **Load unpacked extension**.
- Navigate to `build/wxt/chrome-mv3` (or `build/wxt/edge-mv3`).

#### Firefox

- Open the `about:debugging#addons` page.
- Click **Load Temporary Add-on**.
- Open the `build/wxt/firefox-mv2/manifest.json` file.

### Legacy build scripts

The older Rollup-based build (`npm run debug`, `npm run build`, and related scripts) still exists and is still used by parts of the toolchain and test suite. Executing `npm run debug` builds an unpacked extension into `build/debug/chrome` and `build/debug/firefox`, using the same load-unpacked steps as above. `npm run debug:watch` recompiles automatically after code changes.

## Running tests

```
npm test                  # unit tests
npm run test:inject       # injection tests in Chrome and Firefox (Karma)
npm run test:chrome-mv3   # end-to-end tests on the Chromium MV3 build
npm run test:firefox      # end-to-end tests on the Firefox build
```

End-to-end tests launch a visible browser. Set `BROWSER_TESTS_HEADLESS=1` to run them without a display, and `CHROME_BIN` or `FIREFOX_BIN` to choose a browser binary. Branded Google Chrome no longer loads unpacked extensions from the command line, so use [Chrome for Testing](https://developer.chrome.com/blog/chrome-for-testing).

## Adding new features or fixing bugs

For anything beyond a small fix, **open an issue or a discussion first** so the approach can be agreed on before you invest time in it. Bugs in how a single website looks should use the **Broken Website** issue template.

## Rules and recommendations

**One purpose per pull request.** Keep changes focused and as small as the problem allows. Unrelated refactors belong in their own pull request.

**Make sure it works.** Describe how you tested the change, add or update tests where it makes sense, and run `npm test` and `npm run lint` before submitting.

**AI-assisted contributions are welcome.** You may use AI tools to write code, tests, or documentation. You are accountable for the result: you must understand every line you submit, have tested it, and be able to answer questions about it. Say in the pull request description which parts were AI-assisted.

**Dependencies and build changes** are fine when they are justified. Explain why in the pull request, and prefer small, well-maintained, permissively licensed packages. Moonveil is MIT licensed, so contributions must be compatible with it.

**Upstream sync.** Moonveil periodically merges [Dark Reader](https://github.com/darkreader/darkreader). Avoid reformatting or moving upstream code without a reason, since it makes those merges harder.

**Please preserve the code style** (e.g. whitespace). It can be checked automatically by executing `npm run code-style`.

If your code is ready to be reviewed and merged, please submit a **pull request** and wait for a **review**.
