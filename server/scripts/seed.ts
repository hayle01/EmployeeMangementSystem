import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "../src/models/User";

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      console.log("Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    const passwordHash = await User.hashPassword("admin123");

    await User.create({
      username: "admin",
      passwordHash,
      role: "admin"
    });

    console.log("Admin user created:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Role: admin");
    console.log("\n Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown seed error";
    console.error("Seed error:", message);
    process.exit(1);
  }
}

void seed();