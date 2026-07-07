# Delights Inventory Standalone

This folder is an isolated static project for the Delights inventory system.

The app root is this folder. Open or deploy:

```text
index.html
```

Do not deploy it as `/inventory/` under the marketing website unless you intentionally want it as a subfolder.

## Why It Was Isolated

The previous package placed the inventory app under:

```text
inventory/index.html
```

That works on GitHub Pages only when the whole website root is deployed correctly and users open `/inventory/`. If someone opens the HTML directly, copies only part of the folder, or points hosting to the wrong layer, the page can look empty because the main screen is rendered by JavaScript.

In this standalone version:

- `index.html` is the app entry.
- `js/` contains all app logic.
- `supabase/schema.sql` is included in the same project.
- `.nojekyll` is included for GitHub Pages.
- The brand link points back to `./index.html`, not to a parent website.

## Local Testing

Do not double-click `index.html` for final testing. The app uses `localStorage` and many browser scripts, so test through a local HTTP server.

Example:

```bash
npx serve .
```

Then open the local URL shown by the command.

## GitHub Pages

Deploy this folder as the project root.

Recommended settings:

```text
Build and deployment: Deploy from a branch
Branch: main
Folder: / (root)
```

If using this as a separate repository, put all files from this folder at the repository root.

## Vercel

This project is static. No build step is required.

If Vercel asks for settings:

```text
Framework preset: Other
Build command: none
Output directory: .
```

## Data

By default the app is local-first:

- browser `localStorage`
- JSON export/import
- optional Supabase sync from Settings

For Supabase, run:

```text
supabase/schema.sql
```

inside your Supabase SQL editor, then enter Project URL and anon key in the app Settings page.

## Important Notes

- The visible page content is rendered by JavaScript into `#inv-main`.
- If the main area is blank but the files exist, check browser console errors first.
- If opening by `file://`, use a local HTTP server instead.
- If deploying as a subfolder, keep all relative `js/...` paths together.
