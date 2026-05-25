import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
console.log("MONGODB_URI:", process.env.MONGODB_URI);
if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI missing"
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {

    cached.promise =
      mongoose.connect(
        MONGODB_URI!
      )
      .then((mongoose) => {

        console.log(
          "Mongo Connected 🚀"
        );

        return mongoose;
      });

  }

  cached.conn =
  await cached.promise;

  return cached.conn;
}

export default dbConnect;