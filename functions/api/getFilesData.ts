import { Env, isProjectId, projectKey, respond } from './_shared';
import { validateFiles } from '../../src/state/validation';
import { FilesPayload } from '../../src/shared/filesContract';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'GET') return respond(405, { err: 'Only GET requests allowed.' });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return respond(400, { err: 'ID is required.' });
  if (!isProjectId(id)) return respond(400, { err: 'Invalid ID.' });
  try {
    const savedData = await env.PROJECTS.get(projectKey(id));
    if (!savedData) return respond(404, { err: 'Saved project not found.' });
    const payload = await savedData.json() as FilesPayload;
    const filesData = validateFiles(payload?.filesData);
    if (!filesData) return respond(422, { err: 'Saved project is corrupted.' });
    return respond(200, { filesData, version: savedData.etag });
  } catch (error) {
    console.error('Failed to read saved project', error);
    return respond(500, { err: 'Internal server error.' });
  }
};
