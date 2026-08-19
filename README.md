## Frontend Fun
Online web-based code editor for HTML, CSS, and JavaScript with live reload can be used for practice, quick mockups, or CSS experiments

[![Netlify Status](https://api.netlify.com/api/v1/badges/9d80dacc-64b1-4d3a-b72a-a29816e953a6/deploy-status)](https://app.netlify.com/sites/frontend-fun/deploys)

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

Known limits: projects are capped at 100 files and each file at 500 KB. Remote persistence requires `DATABASE_URI` and a reachable MongoDB instance.

### MongoDB Atlas keep-alive

The repository includes a daily GitHub Actions workflow that calls `/api/keepAlive`, which performs a real MongoDB `ping`. This prevents an M0/Free Atlas cluster from being considered connection-idle. Configure `KEEP_ALIVE_TOKEN` in Netlify, then add matching `KEEP_ALIVE_URL` (for example, `https://your-site.netlify.app/api/keepAlive`) and `KEEP_ALIVE_TOKEN` repository secrets in GitHub. The workflow can also be run manually from the Actions tab.

This keeps the free cluster from inactivity pausing; it does not bypass Atlas storage, throughput, billing, or account-level limits.

### Installation
Clone the repository
```bash
git clone https://github.com/abdulsamad/frontend-fun.git
```

Install dependencies

```bash
yarn
```
or
```bash
npm install
```
Netlify CLI is also required to run serverless functions
```bash
yarn global add netlify-cli
```
or
```bash
npm install -g netlify-cli
```

### Environment Variables
Create a .env file in the project root and add the following variables
```js
DATABASE_URI = /* Your MongoDB URI */
```


### Development

If you don't have Netlify account, [Create Netlify account](https://app.netlify.com/) (You can also login with GitHub, Gitlab &amp; Bitbucket)

Login into Netlify CLI with command `netlify login` and grant access to Netlify CLI

Run **`netlify link`** command in project directory and link your project to Netlify

Run **`netlify dev`** command to start local server

For more information visit [Netlify CLI docs](https://docs.netlify.com/cli/get-started/)

> 💡 **Note:** Netlify free plan limits the serverless functions to timeout at 10 seconds. It is possible that sometimes saving data won't work on deployment with Netlify free plan.

### Screenshot

![Frontend fun screenshot](/readme/screenshot.png "Frontend fun screenshot")

<!-- ### Architechture
![project architechture](/readme/architechture.png "project architechture") -->
