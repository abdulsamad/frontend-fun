import { MongoClient, ObjectId } from 'mongodb';
import { validateFiles } from '../../src/context/validation';
import { FilesPayload } from '../../src/shared/filesContract';

export interface Env {
  DATABASE_URI?: string;
  DATABASE_NAME?: string;
  KEEP_ALIVE_TOKEN?: string;
}

type FilesDocument = { _id: ObjectId; filesData: ReturnType<typeof validateFiles> };

export const respond = (status: number, body: object) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

const getDatabaseName = (env: Env) => {
  if (!env.DATABASE_URI) throw new Error('DATABASE_URI is not configured');
  const uri = new URL(env.DATABASE_URI.replace(/^mongodb\+srv:/, 'https:').replace(/^mongodb:/, 'https:'));
  const databaseName = env.DATABASE_NAME || uri.pathname.slice(1).split('/')[0];
  if (!databaseName) throw new Error('DATABASE_NAME is not configured');
  return databaseName;
};

// Reuse the connection promise within a warm Pages isolate. Failed connections
// are cleared so a later request can recover from a transient outage.
let clientPromise: Promise<MongoClient> | undefined;
let cachedUri: string | undefined;

export const getMongoClient = async (env: Env) => {
  if (!env.DATABASE_URI) throw new Error('DATABASE_URI is not configured');
  if (!clientPromise || cachedUri !== env.DATABASE_URI) {
    cachedUri = env.DATABASE_URI;
    const client = new MongoClient(env.DATABASE_URI, {
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30_000,
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 5_000,
      retryWrites: true,
      appName: 'frontend-fun-pages',
    } as unknown as ConstructorParameters<typeof MongoClient>[1]);
    clientPromise = client.connect().catch((error) => {
      clientPromise = undefined;
      cachedUri = undefined;
      throw error;
    });
  }
  return clientPromise;
};

export const getFilesCollection = async (env: Env) =>
  (await getMongoClient(env)).db(getDatabaseName(env)).collection<FilesDocument>('filesData');

export const objectId = (value: string) => ObjectId.isValid(value) ? new ObjectId(value) : null;

export const parseFilesPayload = async (request: Request) => {
  let body: FilesPayload;
  try {
    body = await request.json() as FilesPayload;
  } catch {
    return { error: respond(400, { err: 'Malformed JSON.' }) };
  }
  const filesData = validateFiles(body?.filesData);
  return filesData ? { filesData } : { error: respond(400, { err: 'Invalid files data.' }) };
};
