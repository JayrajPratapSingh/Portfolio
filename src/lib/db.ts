import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
// Some ISPs/local resolvers can't resolve MongoDB Atlas SRV records — force
// public DNS so `mongodb+srv://` connection strings resolve reliably.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Cached Mongoose connection.
 * Next.js dev/serverless re-imports modules and would otherwise open a new
 * connection on every request. We cache the connection (and the in-flight
 * promise) on the global object so it's reused across invocations.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof globalThis & {
  _mongoose?: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose._mongoose ?? { conn: null, promise: null };
globalWithMongoose._mongoose = cached;

async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI not found. Define it in .env.local before connecting.",
    );
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default dbConnect;
