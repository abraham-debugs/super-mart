/**
 * Migration script to drop the old unique index on Category.name
 * This is needed because we now allow categories with the same name
 * under different parent categories (hierarchical structure)
 * 
 * Run this once: node drop-category-index.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/supermart";

async function dropCategoryNameIndex() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collection = db.collection("categories");

    // Get all indexes
    const indexes = await collection.indexes();
    console.log("\nCurrent indexes:");
    console.log(JSON.stringify(indexes, null, 2));

    // Check if the name_1 unique index exists
    const nameIndex = indexes.find(idx => idx.name === "name_1");
    
    if (nameIndex) {
      console.log("\nDropping unique index on 'name' field...");
      await collection.dropIndex("name_1");
      console.log("✅ Successfully dropped the unique index on 'name'");
    } else {
      console.log("\n✅ No unique index on 'name' found. Schema is already up to date!");
    }

    // Show updated indexes
    const updatedIndexes = await collection.indexes();
    console.log("\nUpdated indexes:");
    console.log(JSON.stringify(updatedIndexes, null, 2));

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

dropCategoryNameIndex();

