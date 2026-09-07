# Frontend Fun

Frontend Fun is a browser-based playground for writing, previewing, and sharing HTML, CSS, and JavaScript.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)

## Features

- VS Code-style Explorer, editor tabs, status bar, terminal, and resizable panes
- VS Code-style top bar with One Dark, VS Code Dark, and High Contrast themes
- Configurable word wrap, editor font size, terminal visibility, and auto-save
- Sandboxed live preview with responsive, tablet, mobile, and full-screen modes
- Local autosave and offline support
- Named projects with remote save, share links, copies, and Project ID restore
- Multi-file import and dependency-free ZIP export
- Responsive Files, Code, Preview, and Terminal views
- Monaco Editor with Emmet, document formatting, and word wrapping

## Usage

Files use names like `index.html`, `styles_v2.css`, or `app-1.js`. Paths, spaces, and unsupported extensions are rejected. Files and projects can be renamed from the workbench. The editor autosaves locally through IndexedDB and restores the last valid project after reload. Remote projects use an anonymous Project ID and shareable `?project=` URL; opening one replaces the files currently in the workbench. Share links are read-only. A separate edit token remains in the owner's browser and is never included in the URL or returned by the read API.

Terminal shortcuts include `Ctrl+L`/`clear`, `Enter`, and backspace. New files can be created with `touch filename.css` or `touch filename.js`; HTML is kept as the single preview entry file. Existing files can be removed with `rm filename.html` (or another existing filename). The preview runs in a sandboxed iframe, so preview code cannot access the editor DOM or local storage. Runtime errors are shown above the preview.

## Architecture

The application is organized around a small set of client-side modules:

```text
src/components/       Workbench panes and controls
src/state/            Jotai atoms, project data, validation, and persistence effects
src/utils/            Preview bundle creation and file presentation helpers
functions/api/         Cloudflare Pages Functions for remote project storage
```

### Project state

`projectFilesAtom` is the source of truth for project contents. Smaller derived atoms expose the active file, open tabs, file names, and Explorer summaries. Components subscribe only to the state they render, so editing file contents does not rerender the Explorer or terminal file list.

Write-only atoms handle file creation, selection, updates, tab closing, deletion, and complete project replacement. `ProjectStateEffects` restores validated data from IndexedDB through LocalForage and persists later changes after hydration completes.

```text
Monaco Editor -> updateActiveFileAtom -> projectFilesAtom
                                           |-> local persistence
                                           |-> live preview bundle
```

### Workbench and loading

`App.tsx` selects the desktop or compact workbench from a media query. Desktop panes use Allotment for horizontal and vertical resizing. Compact layouts keep a visited view mounted after it is opened so local panel state is preserved while unvisited panels remain unloaded.

Explorer, editor, preview, and terminal modules are loaded with React lazy imports. This keeps Monaco and Emmet code separate from xterm, and xterm styles load with the terminal chunk.

### Preview pipeline

`createPreviewBundle` groups validated files into markup, styles, and scripts. The parent application sends that bundle to a sandboxed iframe through `postMessage`; source and channel checks prevent unrelated messages from changing preview state.

CSS is assigned through `textContent`, so values containing closing style tags cannot escape into the iframe shell. CSS-only edits update the existing document without remounting it. HTML or JavaScript edits create a new iframe revision, which resets prior document and script state. Render IDs prevent duplicate script execution, while runtime errors and unhandled promise rejections are reported to the preview toolbar.

Preview code can connect to external APIs with fetch, XHR, WebSocket, and EventSource. The opaque iframe origin, an app-origin request guard, and server-side fetch metadata checks prevent preview code from reading or mutating Frontend Fun project APIs and R2-backed storage.

### Persistence and remote storage

Local projects are stored in IndexedDB. Remote save and open operations use Cloudflare Pages Functions. Updates require both the stored version and a private edit token. The API stores only the token's SHA-256 hash and rejects stale writes with `409` instead of overwriting newer data.

## Installation

Clone the repository

```bash
git clone https://github.com/abdulsamad/frontend-fun.git
```

Install dependencies with pnpm

```bash
pnpm install
```

## Development

Use `pnpm dev` for the Vite-only development server. Use `pnpm pages:dev` on port 3000 to build and run the Pages Functions locally when testing Save and Share. Deploy with `pnpm pages:deploy` after authenticating Wrangler. Create the Pages project once with `pnpm exec wrangler pages project create frontend-fun`.

## Screenshot

![Frontend fun screenshot](/readme/screenshot.png "Frontend fun screenshot")
