import { validateFiles } from '../../src/context/validation';
import { FilesPayload } from '../../src/shared/filesContract';

export interface Env {
  PROJECTS: R2Bucket;
}

export const MAX_PROJECT_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_PROJECT_SIZE + 1024;
const PROJECT_ID_PATTERN = /^[a-f0-9]{32}$/i;

export const respond = (status: number, body: object) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

export const projectKey = (id: string) => `frontend-fun/projects/${id}.json`;

export const projectId = () => crypto.randomUUID().replaceAll('-', '');
export const isProjectId = (id: string) => PROJECT_ID_PATTERN.test(id);

export const parseFilesPayload = async (request: Request) => {
  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return { error: respond(413, { err: 'Project is larger than the 5 MiB remote save limit.' }) };
  }
  let body: FilesPayload;
  try {
    body = await request.json() as FilesPayload;
  } catch {
    return { error: respond(400, { err: 'Malformed JSON.' }) };
  }
  const filesData = validateFiles(body?.filesData);
  if (!filesData) return { error: respond(400, { err: 'Invalid files data.' }) };
  const serialized = JSON.stringify({ filesData });
  if (new TextEncoder().encode(serialized).byteLength > MAX_PROJECT_SIZE) {
    return { error: respond(413, { err: 'Project is larger than the 5 MiB remote save limit.' }) };
  }
  return { filesData, serialized };
};
