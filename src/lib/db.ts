import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urcompetition';


interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoCreate: true,
      autoIndex: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      // Force database creation by creating a temporary collection
      const db = mongoose.connection.db;
      if (db) {
        try {
          await db.createCollection('_temp');
          await db.collection('_temp').drop();
        } catch (error) {
          // Ignore errors if collection already exists or can't be dropped
        }
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  // Ensure the connection is ready
  if (!mongoose.connection.readyState) {
    await mongoose.connection.asPromise();
  }

  return cached.conn;
}