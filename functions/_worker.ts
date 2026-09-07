import { onRequest as getFilesData } from './api/getFilesData';
import { onRequest as saveFilesData } from './api/saveFilesData';

interface Env {
  ASSETS: Fetcher;
  PROJECTS: R2Bucket;
}

const routes: Partial<Record<string, PagesFunction<Env>>> = {
  '/api/getFilesData': getFilesData,
  '/api/saveFilesData': saveFilesData,
};

const rejectCrossOriginApiRequest = (request: Request) => {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('Origin');
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  return Boolean(
    (origin && origin !== requestUrl.origin) ||
    (fetchSite && fetchSite !== 'same-origin'),
  );
};

const forbiddenApiResponse = () => new Response(JSON.stringify({ err: 'Cross-origin project API access is not allowed.' }), {
  status: 403,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
  },
});

export default {
  fetch(request: Request, env: Env, context: ExecutionContext) {
    const handler = routes[new URL(request.url).pathname];
    if (handler && rejectCrossOriginApiRequest(request)) return forbiddenApiResponse();
    return handler ? handler({ request, env, waitUntil: context.waitUntil, next: () => env.ASSETS.fetch(request) } as never) : env.ASSETS.fetch(request);
  },
};
