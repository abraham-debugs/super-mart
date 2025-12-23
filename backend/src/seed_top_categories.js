import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "./models/Category.js";

dotenv.config();

const categoriesToSeed = [
    {
        name: "Fresh Produce",
        imageUrl: "https://placehold.co/600x600/dcfce7/166534?text=Fresh+Produce", // Green
        publicId: "placeholder_fresh_produce",
        showInNavbar: true
    },
    {
        name: "Dairy & Eggs",
        imageUrl: "https://placehold.co/600x600/dbeafe/1e40af?text=Dairy+%26+Eggs", // Blue
        publicId: "placeholder_dairy_eggs",
        showInNavbar: true
    },
    {
        name: "Snacks & Beverages",
        imageUrl: "https://placehold.co/600x600/ffedd5/9a3412?text=Snacks+%26+Beverages", // Orange
        publicId: "placeholder_snacks_beverages",
        showInNavbar: true
    },
    {
        name: "Personal Care",
        imageUrl: "https://placehold.co/600x600/f3e8ff/6b21a8?text=Personal+Care", // Purple
        publicId: "placeholder_personal_care",
        showInNavbar: true
    }
];

async function seed() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        for (const catData of categoriesToSeed) {
            const existing = await Category.findOne({ name: catData.name });
            if (existing) {
                console.log(`Category "${catData.name}" already exists.`);
            } else {
                await Category.create(catData);
                console.log(`Created category "${catData.name}".`);
            }
        }

        // Force indexes to ensure uniqueness (if applicable) or just standard indexes
        // await Category.syncIndexes(); 

        console.log("Seeding complete.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
