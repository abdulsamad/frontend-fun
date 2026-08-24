import { onRequest as getFilesData } from './api/getFilesData';
import { onRequest as saveFilesData } from './api/saveFilesData';

interface Env {
  ASSETS: Fetcher;
  PROJECTS: R2Bucket;
}

const routes: Record<string, PagesFunction<Env>> = {
  '/api/getFilesData': getFilesData,
  '/api/saveFilesData': saveFilesData,
};

export default {
  fetch(request: Request, env: Env, context: ExecutionContext) {
    const handler = routes[new URL(request.url).pathname];
    return handler ? handler({ request, env, waitUntil: context.waitUntil, next: () => env.ASSETS.fetch(request) } as never) : env.ASSETS.fetch(request);
  },
};
