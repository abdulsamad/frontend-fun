## Frontend Fun

Online web-based code editor for HTML, CSS, and JavaScript with live reload can be used for practice, quick mockups, or CSS experiments

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)

### :sparkles: Features

- Preview HTML, CSS, and JavaScript with live reload
- Backup and Restore data with UID
- Offline Support
- Word Wrap on Code Editor

### Usage

Files use names like `index.html`, `styles_v2.css`, or `app-1.js`. Paths, spaces, and unsupported extensions are rejected. The editor autosaves locally through IndexedDB and restores the last valid project after reload. Remote save/import keeps the anonymous ID workflow; importing asks for confirmation when local files contain work.

Terminal shortcuts include `Ctrl+L`/`clear`, `Enter`, and backspace. Supported file commands are anchored as `touch filename.html` and `rm filename.html`. The preview runs in a sandboxed iframe, so preview code cannot access the editor DOM or local storage. Runtime errors are shown above the preview.

### API behavior

`POST /api/saveFilesData` accepts `{ "filesData": File[] }` and returns `{ id, version }`. To update, add `?id=<projectId>` and send that version as `If-Match`; stale updates return `409` rather than overwriting newer work. `GET /api/getFilesData?id=<projectId>` imports one and returns the latest version. Invalid methods, JSON, IDs, file names, languages, duplicate names, and oversized values receive a `4xx` response; missing saved projects return `404`.

Known limits: projects are capped at 100 files, each file at 500 KB, and 5 MiB per remote project. Remote projects are stored as JSON objects in the Cloudflare R2 bucket bound as `PROJECTS`; this app uses the `frontend-fun/projects/` prefix so the `experimental` bucket can safely serve other small projects too.

### R2 setup

In Cloudflare Pages, configure an R2 binding named `PROJECTS` for the private bucket. The bucket name is deliberately kept out of this public repository. Add a lifecycle rule that expires the `frontend-fun/projects/` prefix after 365 days. No database URI is needed. Existing MongoDB project IDs cannot be imported after migration; save them again if you need to keep them.

### Installation

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

### Development

Use `pnpm dev` for the Vite development server or `pnpm pages:dev` to build and run the Pages Functions locally. Deploy with `pnpm pages:deploy` after authenticating Wrangler. Create the Pages project once with `pnpm exec wrangler pages project create frontend-fun`.

### Screenshot

![Frontend fun screenshot](/readme/screenshot.png "Frontend fun screenshot")

<!-- ### Architechture
![project architechture](/readme/architechture.png "project architechture") -->
