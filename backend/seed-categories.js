#!/usr/bin/env node

/**
 * Seed script to populate categories with sample data
 * Usage: node seed-categories.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from './src/models/Category.js';

dotenv.config();

const sampleCategories = [
  // Parent categories with subcategories
  {
    nameEn: 'Fruits & Vegetables',
    nameTa: 'பழங்கள் & காய்கறிகள்',
    imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400',
    isParent: true,
    subcategories: [
      { nameEn: 'Fresh Fruits', nameTa: 'புதிய பழங்கள்', imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200' },
      { nameEn: 'Fresh Vegetables', nameTa: 'புதிய காய்கறிகள்', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200' },
      { nameEn: 'Herbs & Seasonings', nameTa: 'மூலிகைகள்', imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=200' },
      { nameEn: 'Organic Produce', nameTa: 'இயற்கை காய்கறிகள்', imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200' }
    ]
  },
  {
    nameEn: 'Dairy & Eggs',
    nameTa: 'பால் பொருட்கள் & முட்டைகள்',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    isParent: true,
    subcategories: [
      { nameEn: 'Milk', nameTa: 'பால்', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200' },
      { nameEn: 'Cheese & Butter', nameTa: 'சீஸ் & வெண்ணெய்', imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=200' },
      { nameEn: 'Yogurt & Curd', nameTa: 'தயிர்', imageUrl: 'https://images.unsplash.com/photo-1571212059162-4cf3fcb0d5a4?w=200' },
      { nameEn: 'Eggs', nameTa: 'முட்டைகள்', imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200' }
    ]
  },
  {
    nameEn: 'Grains & Rice',
    nameTa: 'தானியங்கள் & அரிசி',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    isParent: true,
    subcategories: [
      { nameEn: 'Rice', nameTa: 'அரிசி', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
      { nameEn: 'Wheat & Flour', nameTa: 'கோதுமை & மாவு', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200' },
      { nameEn: 'Dals & Pulses', nameTa: 'பருப்பு வகைகள்', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200' },
      { nameEn: 'Oats & Cereals', nameTa: 'ஓட்ஸ் & தானியங்கள்', imageUrl: 'https://images.unsplash.com/photo-1602881914752-8834ce0e3af7?w=200' }
    ]
  },
  {
    nameEn: 'Cooking Essentials',
    nameTa: 'சமையல் பொருட்கள்',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    isParent: true,
    subcategories: [
      { nameEn: 'Cooking Oil', nameTa: 'சமையல் எண்ணெய்', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200' },
      { nameEn: 'Spices', nameTa: 'மசாலாக்கள்', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b7e2a97def?w=200' },
      { nameEn: 'Salt & Sugar', nameTa: 'உப்பு & சர்க்கரை', imageUrl: 'https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?w=200' },
      { nameEn: 'Sauces & Condiments', nameTa: 'சாஸ்கள்', imageUrl: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=200' }
    ]
  },
  {
    nameEn: 'Snacks & Beverages',
    nameTa: 'தின்பண்டங்கள் & பானங்கள்',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
    isParent: true,
    subcategories: [
      { nameEn: 'Chips & Namkeen', nameTa: 'சிப்ஸ்', imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200' },
      { nameEn: 'Biscuits & Cookies', nameTa: 'பிஸ்கட்கள்', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200' },
      { nameEn: 'Tea & Coffee', nameTa: 'டீ & காபி', imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200' },
      { nameEn: 'Soft Drinks', nameTa: 'குளிர்பானங்கள்', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200' }
    ]
  },
  {
    nameEn: 'Personal Care',
    nameTa: 'தனிப்பட்ட பராமரிப்பு',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    isParent: true,
    subcategories: [
      { nameEn: 'Hair Care', nameTa: 'முடி பராமரிப்பு', imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200' },
      { nameEn: 'Skin Care', nameTa: 'சரும பராமரிப்பு', imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200' },
      { nameEn: 'Oral Care', nameTa: 'வாய் பராமரிப்பு', imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200' },
      { nameEn: 'Bath & Body', nameTa: 'குளியல் பொருட்கள்', imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=200' }
    ]
  },
  {
    nameEn: 'Household',
    nameTa: 'வீட்டு பொருட்கள்',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
    isParent: true,
    subcategories: [
      { nameEn: 'Cleaning Supplies', nameTa: 'சுத்தம் செய்யும் பொருட்கள்', imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200' },
      { nameEn: 'Detergents', nameTa: 'சவர்க்காரங்கள்', imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200' },
      { nameEn: 'Kitchen Essentials', nameTa: 'சமையலறை பொருட்கள்', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200' },
      { nameEn: 'Paper Products', nameTa: 'காகித பொருட்கள்', imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200' }
    ]
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing categories`);
      const { default: readline } = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      // Auto-proceed for non-interactive mode
      console.log('🗑️  Clearing existing categories...');
      await Category.deleteMany({});
      console.log('✅ Cleared existing categories');
    }

    // Insert parent categories and their subcategories
    let totalCreated = 0;
    
    for (const parentData of sampleCategories) {
      const { subcategories, ...parentFields } = parentData;
      
      // Create parent category
      const parent = await Category.create(parentFields);
      console.log(`✅ Created parent: ${parent.nameEn}`);
      totalCreated++;

      // Create subcategories
      if (subcategories && subcategories.length > 0) {
        for (const subcat of subcategories) {
          const subcategory = await Category.create({
            ...subcat,
            parentCategory: parent._id
          });
          console.log(`   ✅ Created subcategory: ${subcategory.nameEn}`);
          totalCreated++;
        }
      }
    }

    console.log(`\n🎉 Successfully created ${totalCreated} categories!`);
    console.log(`   - ${sampleCategories.length} parent categories`);
    console.log(`   - ${totalCreated - sampleCategories.length} subcategories`);
    console.log('\n✅ Your store is ready! Refresh your frontend to see the categories.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCategories();











