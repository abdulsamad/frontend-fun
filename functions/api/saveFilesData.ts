import { ObjectId } from 'mongodb';
import { Env, getFilesCollection, objectId, parseFilesPayload, respond } from './_shared';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') return respond(405, { err: 'Only POST requests allowed.' });
  const id = new URL(request.url).searchParams.get('id');
  if (id && !objectId(id)) return respond(400, { err: 'Invalid ID.' });
  const payload = await parseFilesPayload(request);
  if (payload.error) return payload.error;
  try {
    const collection = await getFilesCollection(env);
    if (id) {
      const result = await collection.updateOne({ _id: objectId(id)! }, { $set: { filesData: payload.filesData } });
      if (!result.matchedCount) return respond(404, { err: 'Saved project not found.' });
      return respond(200, { id, msg: 'Successfully updated your data.' });
    }
    const savedData = await collection.insertOne({ _id: new ObjectId(), filesData: payload.filesData });
    return respond(201, { id: String(savedData.insertedId), msg: 'Successfully saved your data.' });
  } catch (error) {
    console.error('Failed to save project', error);
    return respond(500, { err: 'Internal server error.' });
  }
};
