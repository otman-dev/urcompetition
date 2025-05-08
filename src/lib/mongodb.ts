import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;



if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Extend NodeJS.Global to include mongoose cache
declare global {
  // Avoid re-declaring in other modules
  // eslint-disable-next-line no-var
  var mongoose: CachedMongoose | undefined;
}

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a global cache in development (to prevent hot reload issues)
let cached: CachedMongoose = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  global.mongoose = cached;
  return cached.conn;
}
