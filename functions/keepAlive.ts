import { Handler } from '@netlify/functions';
import { connectToDatabase } from './db';
import mongoose from 'mongoose';

const json = (statusCode: number, body: object) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { err: 'Only GET requests allowed.' });

  const expectedToken = process.env.KEEP_ALIVE_TOKEN;
  const suppliedToken = event.headers['x-keep-alive-token'] || event.headers['X-Keep-Alive-Token'];
  if (!expectedToken || suppliedToken !== expectedToken) return json(401, { err: 'Unauthorized.' });

  try {
    await connectToDatabase();
    await mongoose.connection.db?.command({ ping: 1 });
    return json(200, { ok: true, database: 'reachable', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('MongoDB keep-alive failed', error);
    return json(503, { ok: false, err: 'Database unavailable.' });
  }
};
