# Frontend Fun

Frontend Fun is a browser-based playground for writing, previewing, and sharing HTML, CSS, and JavaScript.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)

## Features

- VS Code-style Explorer, editor tabs, status bar, terminal, and resizable panes
- VS Code-style top bar with One Dark, VS Code Dark, and High Contrast themes
- Configurable word wrap, editor font size, terminal visibility, and auto-save
- Sandboxed live preview for HTML, CSS, and JavaScript
- Local autosave and offline support
- Remote project save and restore with a Project ID
- Responsive Files, Code, Preview, and Terminal views
- Monaco Editor with Emmet and word wrapping

## Usage

Files use names like `index.html`, `styles_v2.css`, or `app-1.js`. Paths, spaces, and unsupported extensions are rejected. The editor autosaves locally through IndexedDB and restores the last valid project after reload. Remote projects use an anonymous Project ID; opening one replaces the files currently in the workbench.

Terminal shortcuts include `Ctrl+L`/`clear`, `Enter`, and backspace. Supported file commands are anchored as `touch filename.html` and `rm filename.html`. The preview runs in a sandboxed iframe, so preview code cannot access the editor DOM or local storage. Runtime errors are shown above the preview.

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

### Persistence and remote storage

Local projects are stored in IndexedDB. Remote save and open operations use Cloudflare Pages Functions, shared validation rules, and an R2 binding named `PROJECTS`. Updates include the stored version as `If-Match`, allowing the API to reject stale writes with `409` instead of overwriting newer data.

## API behavior

`POST /api/saveFilesData` accepts `{ "filesData": File[] }` and returns `{ id, version }`. To update, add `?id=<projectId>` and send that version as `If-Match`; stale updates return `409` rather than overwriting newer work. `GET /api/getFilesData?id=<projectId>` imports one and returns the latest version. Invalid methods, JSON, IDs, file names, languages, duplicate names, and oversized values receive a `4xx` response; missing saved projects return `404`.

Known limits: projects are capped at 100 files, each file at 500 KB, and 5 MiB per remote project. Remote projects are stored as JSON objects in the Cloudflare R2 bucket bound as `PROJECTS`; this app uses the `frontend-fun/projects/` prefix so the `experimental` bucket can safely serve other small projects too.

## Installation

Clone the repository

```bash
git clone https://github.com/abdulsamad/frontend-fun.git
```

Install dependencies with pnpm

```bash
pnpm install
```

If pnpm is not installed yet:

```bash
corepack enable
corepack prepare pnpm@11.22.0 --activate
```

## Development

Use `pnpm dev` for the Vite development server or `pnpm pages:dev` to build and run the Pages Functions locally. Deploy with `pnpm pages:deploy` after authenticating Wrangler. Create the Pages project once with `pnpm exec wrangler pages project create frontend-fun`.

## Screenshot

![Frontend fun screenshot](/readme/screenshot.png "Frontend fun screenshot")
