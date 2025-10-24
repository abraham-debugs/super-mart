/**
 * Quick fix script for category schema issues
 * This script will:
 * 1. Drop the old unique index on Category.name
 * 2. Ensure all existing categories have the parentCategory field
 * 
 * Run: node fix-category-schema.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/supermart";

async function fixCategorySchema() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log("URI:", MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected successfully!\n");

    const db = mongoose.connection.db;
    const collection = db.collection("categories");

    // Check if collection exists
    const collections = await db.listCollections({ name: "categories" }).toArray();
    if (collections.length === 0) {
      console.log("ℹ️  No 'categories' collection found. Creating it...");
      await db.createCollection("categories");
      console.log("✅ Collection created!\n");
    }

    // Get current indexes
    console.log("📋 Current indexes:");
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    console.log();

    // Drop the unique index on 'name' if it exists
    const nameIndex = indexes.find(idx => idx.name === "name_1" && idx.unique === true);
    if (nameIndex) {
      console.log("🗑️  Dropping unique index on 'name' field...");
      try {
        await collection.dropIndex("name_1");
        console.log("✅ Successfully dropped the unique index!\n");
      } catch (dropErr) {
        console.log("⚠️  Could not drop index:", dropErr.message);
        console.log("   (This might be okay if it was already dropped)\n");
      }
    } else {
      console.log("✅ No problematic unique index found on 'name'\n");
    }

    // Update existing categories to ensure they have parentCategory field
    console.log("🔄 Updating existing categories...");
    const result = await collection.updateMany(
      { parentCategory: { $exists: false } },
      { $set: { parentCategory: null } }
    );
    console.log(`✅ Updated ${result.modifiedCount} categories to have parentCategory field\n`);

    // Show final indexes
    console.log("📋 Updated indexes:");
    const updatedIndexes = await collection.indexes();
    console.log(JSON.stringify(updatedIndexes, null, 2));

    console.log("\n✅ Schema fix completed successfully!");
    console.log("\n🚀 You can now restart your server and try again.");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 MongoDB is not running or not accessible.");
      console.log("   Please make sure:");
      console.log("   1. MongoDB is installed and running");
      console.log("   2. Your .env file has the correct MONGODB_URI");
      console.log("   3. If using MongoDB Atlas, check your connection string and network access");
    }
    
    process.exit(1);
  }
}

fixCategorySchema();

