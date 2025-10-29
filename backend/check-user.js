#!/usr/bin/env node

/**
 * Script to check if a user exists and verify their password
 * Usage: node check-user.js <email>
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node check-user.js <email>');
  process.exit(1);
}

async function checkUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Searching for user with email: "${normalizedEmail}"`);

    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('\n💡 Possible reasons:');
      console.log('   1. User was never created');
      console.log('   2. Email is incorrect or has different casing');
      console.log('   3. User was deleted');
      console.log('\n💡 Try creating a test user with: node create-test-user.js');
      process.exit(1);
    }

    console.log('✅ User found!\n');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🆔 ID:', user._id);
    console.log('👑 Role:', user.role || 'user');
    console.log('📝 Profile Complete:', user.isProfileComplete);
    console.log('✉️  Email Verified:', user.emailVerified);
    
    if (user.passwordHash) {
      console.log('🔐 Password Hash: Exists (' + user.passwordHash.substring(0, 20) + '...)');
      console.log('✅ Password hash is present\n');
    } else {
      console.log('⚠️  WARNING: No password hash found!');
      console.log('   User cannot login without a password hash.\n');
    }

    // Test password
    if (process.argv[3]) {
      const testPassword = process.argv[3];
      console.log(`🔑 Testing password: "${testPassword}"`);
      if (user.passwordHash) {
        const match = await bcrypt.compare(testPassword, user.passwordHash);
        if (match) {
          console.log('✅ Password matches!');
        } else {
          console.log('❌ Password does NOT match!');
        }
      } else {
        console.log('⚠️  Cannot test password - no password hash exists');
      }
    } else {
      console.log('💡 To test a password, run:');
      console.log(`   node check-user.js "${normalizedEmail}" "yourpassword"`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUser();

