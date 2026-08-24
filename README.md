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

`POST /api/saveFilesData` accepts `{ "filesData": File[] }`; add `?id=<ObjectId>` to update an existing project. `GET /api/getFilesData?id=<ObjectId>` imports one. Invalid methods, JSON, IDs, file names, languages, duplicate names, and oversized values receive a `4xx` response; missing saved projects return `404`.

Known limits: projects are capped at 100 files and each file at 500 KB. Remote persistence requires `DATABASE_URI` and a reachable MongoDB instance. Pages Functions use the MongoDB driver over Cloudflare outbound TCP sockets and cache the connected client per warm isolate.

### MongoDB Atlas keep-alive

The repository includes a daily GitHub Actions workflow that calls `/api/keepAlive`, which performs a real MongoDB `ping`. Configure `DATABASE_URI`, optional `DATABASE_NAME`, and `KEEP_ALIVE_TOKEN` as encrypted Cloudflare Pages environment variables. Add matching `KEEP_ALIVE_URL` (for example, `https://your-site.pages.dev/api/keepAlive`) and `KEEP_ALIVE_TOKEN` repository secrets in GitHub. The workflow can also be run manually from the Actions tab.

This keeps the free cluster from inactivity pausing; it does not bypass Atlas storage, throughput, billing, or account-level limits.

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
### Environment Variables
Create a .env file in the project root and add the following variables
```js
DATABASE_URI = /* Your MongoDB URI */
DATABASE_NAME = /* Optional if the URI already includes a database */
KEEP_ALIVE_TOKEN = /* Secret used by the scheduled health check */
```

### Development

Use `pnpm dev` for the React app or `pnpm pages:dev` to build and run the Pages Functions locally. Deploy with `pnpm pages:deploy` after authenticating Wrangler. Create the Pages project once with `pnpm exec wrangler pages project create frontend-fun`, then set production secrets with `pnpm exec wrangler pages secret put DATABASE_URI`, `pnpm exec wrangler pages secret put DATABASE_NAME`, and `pnpm exec wrangler pages secret put KEEP_ALIVE_TOKEN`.

For MongoDB Atlas, add `0.0.0.0/0` to Database &gt; Network Access, or use a private networking/egress solution. Cloudflare Workers TCP connections do not originate from a stable IP range that can be allowlisted. If using `0.0.0.0/0`, enforce a dedicated least-privilege database user, a strong password, and TLS.

### Screenshot

![Frontend fun screenshot](/readme/screenshot.png "Frontend fun screenshot")

<!-- ### Architechture
![project architechture](/readme/architechture.png "project architechture") -->
