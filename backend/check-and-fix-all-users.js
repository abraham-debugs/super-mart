// Comprehensive script to find and fix ALL users with this email
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const email = '231401032@rajalakshmi.edu.in';
const password = 'SuperAdmin@2024';
const phone = '0987654321';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermart';

console.log('Connecting to MongoDB:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    // Find ALL users - no filtering
    console.log('Finding ALL users in database...');
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    console.log('');
    
    // Find users by email (exact and variations)
    console.log('Searching for users with email:', email);
    const exactMatch = await User.findOne({ email: email.toLowerCase().trim() });
    const caseInsensitive = await User.find({ 
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    console.log('Exact match:', exactMatch ? `Found (ID: ${exactMatch._id}, Role: ${exactMatch.role})` : 'Not found');
    console.log('Case-insensitive matches:', caseInsensitive.length);
    console.log('');
    
    // Show all matching users
    if (caseInsensitive.length > 0) {
      console.log('All users with matching email:');
      caseInsensitive.forEach((u, i) => {
        console.log(`  ${i + 1}. ID: ${u._id}, Email: ${u.email}, Role: ${u.role}`);
      });
      console.log('');
    }
    
    // Get or create the user we need
    let targetUser = exactMatch || (caseInsensitive.length > 0 ? caseInsensitive[0] : null);
    
    if (!targetUser) {
      console.log('Creating new user...');
      const passwordHash = await bcrypt.hash(password, 10);
      targetUser = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        phone: phone,
        passwordHash: passwordHash,
        role: 'superadmin',
        emailVerified: true,
        isProfileComplete: true
      });
      console.log('✅ Created new user');
    } else {
      console.log('Updating existing user...');
      const passwordHash = await bcrypt.hash(password, 10);
      targetUser.passwordHash = passwordHash;
      targetUser.role = 'superadmin';
      targetUser.emailVerified = true;
      targetUser.isProfileComplete = true;
      targetUser.email = email.toLowerCase().trim(); // Force exact email format
      if (!targetUser.phone || targetUser.phone !== phone) {
        targetUser.phone = phone;
      }
      await targetUser.save();
      console.log('✅ Updated user');
    }
    
    // Delete any other duplicates
    if (caseInsensitive.length > 1) {
      console.log('');
      console.log('Removing duplicate users...');
      const duplicates = caseInsensitive.filter(u => u._id.toString() !== targetUser._id.toString());
      for (const dup of duplicates) {
        await User.findByIdAndDelete(dup._id);
        console.log(`  ✅ Deleted duplicate: ${dup._id} (email: ${dup.email}, role: ${dup.role})`);
      }
    }
    
    // Final verification
    console.log('');
    console.log('=== FINAL VERIFICATION ===');
    const finalUser = await User.findById(targetUser._id);
    console.log('User ID:', finalUser._id.toString());
    console.log('Email:', finalUser.email);
    console.log('Role:', finalUser.role);
    console.log('Phone:', finalUser.phone);
    console.log('Password hash exists:', !!finalUser.passwordHash);
    
    // Test password
    const passwordTest = await bcrypt.compare(password, finalUser.passwordHash);
    console.log('Password test result:', passwordTest ? '✅ CORRECT' : '❌ FAILED');
    
    // Test with normalized email lookup (exactly what backend does)
    console.log('');
    console.log('Testing backend-style lookup:');
    const normalizedEmail = email.toLowerCase().trim();
    const backendLookup = await User.findOne({ email: normalizedEmail });
    if (backendLookup) {
      console.log('  ✅ Found user:', backendLookup._id.toString());
      console.log('  Role:', backendLookup.role);
      const passwordCheck = await bcrypt.compare(password, backendLookup.passwordHash);
      console.log('  Password check:', passwordCheck ? '✅ YES' : '❌ NO');
    } else {
      console.log('  ❌ NOT FOUND with normalized email:', normalizedEmail);
    }
    
    console.log('');
    console.log('✅ Setup complete!');
    console.log('Credentials:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('  Role: superadmin');
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  });

