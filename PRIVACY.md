# Privacy Policy

Last updated: 2026-09-14

Moonveil is a browser extension that applies a dark theme to websites. This page explains what data it handles.

## No analytics or tracking

Moonveil does not collect analytics or telemetry. It does not track your browsing history, does not build a profile of you, and does not send usage statistics anywhere.

## Settings storage

Your Moonveil settings (theme preferences, per-site rules, etc.) are stored using your browser's extension storage:

- If browser sync is enabled in Moonveil's settings, they are stored in `storage.sync`, so your browser can sync them across your own devices through your browser vendor's sync service (for example, your Google or Firefox account sync).
- Otherwise, they are stored locally on your device in `storage.local`.

Moonveil itself does not operate a server and does not receive a copy of your settings.

## Network requests Moonveil makes

Moonveil makes network requests in two situations:

1. **Site fix lists.** Moonveil may download updated site-fix configuration files (lists of per-site theming rules) from `raw.githubusercontent.com/owenpkent/moonveil`. GitHub, as the host of that request, receives the request and your IP address, as it would for any request to a GitHub-hosted URL. No additional identifying information is attached by Moonveil.
2. **Theming pages you visit.** To generate an accurate dark theme, Moonveil may re-fetch a page's own stylesheets and images directly from the site you are viewing, so it can analyze their colors. These requests go only to the sites you are already visiting, and are made without cookies or other credentials (credentials are omitted).

Moonveil does not send the content of the pages you visit, or your browsing history, to any third party.

## No sale or sharing of data

Moonveil does not sell or share your data with anyone.

## Changes to this policy

If this policy changes, the "Last updated" date above will be updated accordingly.
