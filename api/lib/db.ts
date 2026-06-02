import { MongoClient, ObjectId } from 'mongodb';

// Use globalThis.process to avoid TS complaining about missing Node `process` types
const _process: any = (globalThis as any).process;
const uri: string = (_process?.env?.MONGODB_URI ?? _process?.env?.MONGO_URI ?? '').toString();
const dbName: string = (_process?.env?.MONGODB_DB ?? _process?.env?.MONGO_DB ?? 'library-together').toString();


let cachedClient: MongoClient | null = null;

type Doc = Record<string, any> & { _id?: any };

const mockCollections: Record<string, Doc[]> = {
  books: [],
  users: [],
  loans: [],
};

function matchesQuery(doc: Doc, query: any) {
  if (!query || Object.keys(query).length === 0) return true;
  return Object.entries(query).every(([k, v]) => doc?.[k] === v);
}

function normalizeObjectIdInQuery(query: any) {
  // handle {_id: '...'} by converting to ObjectId when possible
  if (!query || typeof query !== 'object') return query;
  if (query._id && typeof query._id === 'string') {
    try {
      return { ...query, _id: new ObjectId(query._id) };
    } catch {
      return query;
    }
  }
  return query;
}

function createMockDb() {
  return {
    collection(name: string) {
      if (!mockCollections[name]) mockCollections[name] = [];
      const collectionRef = mockCollections[name];

      return {
        find(query: any = {}) {
          const q = normalizeObjectIdInQuery(query);
          return {
            sort(sortObj: any) {
              const [[field, dir]] = Object.entries(sortObj || { createdAt: -1 });
              const sorted = [...collectionRef].filter((d) => matchesQuery(d, q));
              const direction = typeof dir === 'number' ? dir : -1;
              sorted.sort((a: Doc, b: Doc) => {
                const av = (a as any)?.[field];
                const bv = (b as any)?.[field];
                if (av === bv) return 0;
                return av > bv ? direction : -direction;
              });
              return {
                toArray: async () => sorted,
              };
            },
            toArray: async () => collectionRef.filter((d) => matchesQuery(d, q)),
          };
        },

        async findOne(query: any) {
          const q = normalizeObjectIdInQuery(query);
          return collectionRef.find((d) => matchesQuery(d, q)) || null;
        },

        async insertOne(doc: Doc) {
          collectionRef.push(doc);
          return { acknowledged: true, insertedId: doc?._id };
        },

        async insertMany(docs: Doc[]) {
          collectionRef.push(...docs);
          return { acknowledged: true };
        },

        async countDocuments() {
          return collectionRef.length;
        },

        async updateOne(filter: any, update: any) {
          const f = normalizeObjectIdInQuery(filter);
          const idx = collectionRef.findIndex((d) => matchesQuery(d, f));
          if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };

          const setData = update?.$set ? update.$set : update;
          collectionRef[idx] = { ...collectionRef[idx], ...setData };
          return { matchedCount: 1, modifiedCount: 1 };
        },

        async updateMany(filter: any, update: any) {
          const f = normalizeObjectIdInQuery(filter);
          const setData = update?.$set ? update.$set : update;
          let matched = 0;
          let modified = 0;
          for (let i = 0; i < collectionRef.length; i++) {
            if (matchesQuery(collectionRef[i], f)) {
              matched++;
              collectionRef[i] = { ...collectionRef[i], ...setData };
              modified++;
            }
          }
          return { matchedCount: matched, modifiedCount: modified };
        },

        async deleteOne(filter: any) {
          const f = normalizeObjectIdInQuery(filter);
          const before = collectionRef.length;
          const afterArr = collectionRef.filter((d) => !matchesQuery(d, f));
          mockCollections[name] = afterArr;
          const deleted = before - afterArr.length;
          return { deletedCount: deleted };
        },

        async findOneAndUpdate(filter: any, update: any, _options?: any) {
          const f = normalizeObjectIdInQuery(filter);
          const idx = collectionRef.findIndex((d) => matchesQuery(d, f));
          if (idx === -1) return { value: null };
          const setData = update?.$set ? update.$set : update;
          collectionRef[idx] = { ...collectionRef[idx], ...setData };
          return { value: collectionRef[idx] };
        },
      };
    },
  };
}

export async function connectToDatabase() {
  // Fallback: kalau URI belum diset, jangan crash.
  if (!uri) {
    console.warn('[DB] MONGODB_URI/MONGO_URI missing. Using mock DB.');
    return { client: null, db: createMockDb() } as any;
  }

  if (cachedClient) {
    return {
      client: cachedClient,
      db: cachedClient.db(dbName),
    };
  }

  console.log('[DB] Connecting to MongoDB...');
  const client = new MongoClient(uri);

  // Manual timeout fallback supaya ketika DNS/connection menggantung, server tetap bisa jalan.
  const timeoutMs = 3000;
  try {
    await Promise.race([
      client.connect().then(() => 'connected'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Mongo connect timeout')), timeoutMs)),
    ]);

    console.log('[DB] Connected successfully');
    cachedClient = client;

    return {
      client,
      db: client.db(dbName),
    };
  } catch (error) {
    console.error('[DB] Mongo connect failed/timeout. Using mock DB.', error);
    try {
      await client.close();
    } catch {
      // ignore
    }
    return { client: null, db: createMockDb() } as any;
  }
}
