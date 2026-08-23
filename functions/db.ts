import mongoose from "mongoose";

mongoose.Promise = global.Promise;

let isConnected = false;

export const connectToDatabase = async () => {
  try {
    if (isConnected) {
      console.log("=> Using existing database connection");
      return Promise.resolve();
    }

    console.log("=> Using new database connection");

    const conn = await mongoose.connect(process.env.DATABASE_URI!);

    isConnected = conn.connections[0].readyState === 1;
  } catch (err) {
    isConnected = false;
    throw new Error("Unable to establish a database connection");
  }
};
