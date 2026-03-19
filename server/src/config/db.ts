import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown DB error";
    console.error(`MongoDB connection error: ${message}`);
    process.exit(1);
  }
}