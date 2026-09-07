import { isValidProjectName, validateDependencies, validateFiles } from '../../src/state/validation';
import { FilesPayload, MAX_PROJECT_SIZE } from '../../src/shared/filesContract';

export interface Env {
  PROJECTS: R2Bucket;
}

// JSON adds file names, languages, dependency metadata, and structural
// characters around the serialized project. Keep that overhead bounded too.
const MAX_REQUEST_SIZE = MAX_PROJECT_SIZE + 256 * 1024;
const PROJECT_ID_PATTERN = /^[a-f0-9]{32}$/i;

export const respond = (status: number, body: object) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
  },
});

export const projectKey = (id: string) => `frontend-fun/projects/${id}.json`;

export const projectId = () => crypto.randomUUID().replaceAll('-', '');
export const isProjectId = (id: string) => PROJECT_ID_PATTERN.test(id);

const readRequestBody = async (request: Request): Promise<string | Response> => {
  if (!request.body) return respond(400, { err: 'Request body is required.' });

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalSize = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.byteLength;
      if (totalSize > MAX_REQUEST_SIZE) {
        await reader.cancel();
        return respond(413, { err: 'Project request is too large.' });
      }
      chunks.push(value);
    }
  } catch {
    return respond(400, { err: 'Could not read request body.' });
  }

  const bytes = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
};

export const parseFilesPayload = async (request: Request) => {
  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return { error: respond(413, { err: 'Project is larger than the 5 MiB remote save limit.' }) };
  }
  const requestBody = await readRequestBody(request);
  if (requestBody instanceof Response) return { error: requestBody };

  let body: FilesPayload;
  try {
    body = JSON.parse(requestBody) as FilesPayload;
  } catch {
    return { error: respond(400, { err: 'Malformed JSON.' }) };
  }
  const filesData = validateFiles(body?.filesData);
  if (!filesData) return { error: respond(400, { err: 'Invalid files data.' }) };
  const dependencies = validateDependencies(body?.dependencies);
  if (!dependencies) return { error: respond(400, { err: 'Invalid preview dependencies.' }) };
  const projectName = body?.projectName === undefined ? 'Untitled project' : body.projectName.trim();
  if (!isValidProjectName(projectName)) return { error: respond(400, { err: 'Invalid project name.' }) };
  const serialized = JSON.stringify({ filesData, dependencies, projectName });
  if (new TextEncoder().encode(serialized).byteLength > MAX_PROJECT_SIZE) {
    return { error: respond(413, { err: 'Project is larger than the 5 MiB remote save limit.' }) };
  }
  return { filesData, dependencies, projectName, serialized };
};
