import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
import { connectToDatabase } from './db';
import filesDataModel from '../model/FilesData';
import { validateFiles } from '../src/context/validation';
import { FilesPayload } from '../src/shared/filesContract';

const json = (statusCode: number, body: object) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { err: 'Only POST requests allowed.' });
  const id = event.queryStringParameters?.id;
  if (id && (!mongoose.Types.ObjectId.isValid(id) || typeof id !== 'string')) return json(400, { err: 'Invalid ID.' });
  let body: FilesPayload;
  try { body = JSON.parse(event.body || '') as FilesPayload; } catch { return json(400, { err: 'Malformed JSON.' }); }
  const filesData = validateFiles(body?.filesData);
  if (!filesData) return json(400, { err: 'Invalid files data.' });

  try {
    await connectToDatabase();
    if (id) {
      const result = await filesDataModel.updateOne({ _id: id }, { $set: { filesData } }).exec();
      if (!result.matchedCount) return json(404, { err: 'Saved project not found.' });
      return json(200, { id, msg: 'Successfully updated your data.' });
    }
    const savedData = await new filesDataModel({ filesData }).save();
    return json(201, { id: String(savedData._id), msg: 'Successfully saved your data.' });
  } catch (error) {
    console.error(error);
    return json(500, { err: 'Internal server error.' });
  }
};
