import { Env, getMongoClient, respond } from './_shared';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'GET') return respond(405, { err: 'Only GET requests allowed.' });
  if (!env.KEEP_ALIVE_TOKEN || request.headers.get('x-keep-alive-token') !== env.KEEP_ALIVE_TOKEN) {
    return respond(401, { err: 'Unauthorized.' });
  }
  try {
    if (!env.DATABASE_URI) throw new Error('DATABASE_URI is not configured');
    const databaseName = env.DATABASE_NAME || new URL(env.DATABASE_URI.replace(/^mongodb\+srv:/, 'https:').replace(/^mongodb:/, 'https:')).pathname.slice(1).split('/')[0];
    await (await getMongoClient(env)).db(databaseName).command({ ping: 1 });
    return respond(200, { ok: true, database: 'reachable', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('MongoDB keep-alive failed', error);
    return respond(503, { ok: false, err: 'Database unavailable.' });
  }
};
