import {
  Env,
  hashProjectEditToken,
  isProjectId,
  matchesProjectEditToken,
  parseFilesPayload,
  projectEditToken,
  projectId,
  projectKey,
  readProjectEditToken,
  respond,
} from './_shared';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') return respond(405, { err: 'Only POST requests allowed.' });
  const id = new URL(request.url).searchParams.get('id');
  if (id && !isProjectId(id)) return respond(400, { err: 'Invalid ID.' });
  const payload = await parseFilesPayload(request);
  if (payload.error) return payload.error;
  try {
    if (id) {
      const version = request.headers.get('If-Match');
      if (!version) return respond(428, { err: 'Import the saved project before updating it.' });
      const editToken = readProjectEditToken(request);
      if (!editToken) return respond(403, { err: 'This project is read-only in this browser.' });
      const existing = await env.PROJECTS.head(projectKey(id));
      if (!existing) return respond(404, { err: 'Saved project not found.' });
      const editTokenHash = existing.customMetadata?.editTokenHash;
      if (!editTokenHash || !await matchesProjectEditToken(editToken, editTokenHash)) {
        return respond(403, { err: 'This project is read-only in this browser.' });
      }
      const savedData = await env.PROJECTS.put(projectKey(id), payload.serialized, {
        onlyIf: { etagMatches: version },
        httpMetadata: { contentType: 'application/json' },
        customMetadata: { editTokenHash },
      });
      if (!savedData) return respond(409, { err: 'This project was changed elsewhere. Import it before saving again.' });
      return respond(200, { id, version: savedData.etag, msg: 'Successfully updated your data.' });
    }
    const newId = projectId();
    const editToken = projectEditToken();
    const editTokenHash = await hashProjectEditToken(editToken);
    const savedData = await env.PROJECTS.put(projectKey(newId), payload.serialized, {
      httpMetadata: { contentType: 'application/json' },
      customMetadata: { editTokenHash },
    });
    if (!savedData) throw new Error('R2 did not create the project.');
    return respond(201, { id: newId, editToken, version: savedData.etag, msg: 'Successfully saved your data.' });
  } catch (error) {
    console.error('Failed to save project', error);
    return respond(500, { err: 'Internal server error.' });
  }
};
