import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import dns from "dns";

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);


import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI missing");
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      cached.promise = mongoose
        .connect(mongoUri)
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
