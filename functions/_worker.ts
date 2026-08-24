import { onRequest as getFilesData } from './api/getFilesData';
import { onRequest as keepAlive } from './api/keepAlive';
import { onRequest as saveFilesData } from './api/saveFilesData';

interface Env {
  ASSETS: Fetcher;
  DATABASE_URI?: string;
  DATABASE_NAME?: string;
  KEEP_ALIVE_TOKEN?: string;
}

const routes: Record<string, PagesFunction<Env>> = {
  '/api/getFilesData': getFilesData,
  '/api/saveFilesData': saveFilesData,
  '/api/keepAlive': keepAlive,
};

export default {
  fetch(request: Request, env: Env, context: ExecutionContext) {
    const handler = routes[new URL(request.url).pathname];
    return handler ? handler({ request, env, waitUntil: context.waitUntil, next: () => env.ASSETS.fetch(request) } as never) : env.ASSETS.fetch(request);
  },
};
