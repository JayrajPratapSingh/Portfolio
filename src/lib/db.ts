import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import dns from "dns";

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);


import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
console.log("MONGODB_URI:", MONGODB_URI)
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI missing");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      cached.promise = mongoose
        .connect(MONGODB_URI)
        .then((mongoose) => {
          console.log("✅ Mongo Connected");
          return mongoose;
        })
        .catch((err) => {
          console.error("❌ Mongo Connection Failed");
          console.error(err);

          cached.promise = null;

          throw err;
        });
    }

    cached.conn = await cached.promise;

    return cached.conn;
  } catch (error) {
    console.error("❌ DB Connect Error:", error);
    throw error;
  }
}

export default dbConnect;