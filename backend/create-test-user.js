#!/usr/bin/env node

/**
 * Quick script to create a test user
 * Usage: node create-test-user.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test user credentials
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️  User already exists!');
      console.log('\n📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('\n✅ You can login with these credentials');
      process.exit(0);
    }

    // Create new user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      isProfileComplete: false,
      emailVerified: false,
      role: 'user'
    });

    console.log('✅ Test user created successfully!');
    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User ID:', user._id);
    console.log('\n✅ You can now login with these credentials');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestUser();











