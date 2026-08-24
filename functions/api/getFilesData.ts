import { Env, getFilesCollection, objectId, respond } from './_shared';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'GET') return respond(405, { err: 'Only GET requests allowed.' });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return respond(400, { err: 'ID is required.' });
  const _id = objectId(id);
  if (!_id) return respond(400, { err: 'Invalid ID.' });
  try {
    const savedData = await (await getFilesCollection(env)).findOne({ _id });
    if (!savedData || !savedData.filesData) return respond(404, { err: 'Saved project not found.' });
    return respond(200, { filesData: savedData.filesData });
  } catch (error) {
    console.error('Failed to read saved project', error);
    return respond(500, { err: 'Internal server error.' });
  }
};
