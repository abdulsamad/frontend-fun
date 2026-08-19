import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
import { connectToDatabase } from './db';
import filesDataModel from '../model/FilesData';
import { validateFiles } from '../src/context/validation';

const json = (statusCode: number, body: object) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { err: 'Only GET requests allowed.' });
  const id = event.queryStringParameters?.id;
  if (!id) return json(400, { err: 'ID is required.' });
  if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) return json(400, { err: 'Invalid ID.' });
  try {
    await connectToDatabase();
    const savedData = await filesDataModel.findOne({ _id: id }).lean().exec();
    if (!savedData || !validateFiles(savedData.filesData)) return json(404, { err: 'Saved project not found.' });
    return json(200, { filesData: savedData.filesData });
  } catch (error) {
    console.error(error);
    return json(500, { err: 'Internal server error.' });
  }
};
