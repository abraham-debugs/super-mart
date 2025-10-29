// Debug script to test login step by step
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const email = '231401032@rajalakshmi.edu.in';
const password = 'SuperAdmin@2024';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermart';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Testing login steps...');
    console.log('');
    
    // Step 1: Normalize email (same as backend)
    const normalizedEmail = String(email).toLowerCase().trim();
    console.log('1. Normalized email:', normalizedEmail);
    
    // Step 2: Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    console.log('2. ✅ User found:', user.email);
    console.log('   User ID:', user._id);
    console.log('   User role:', user.role);
    
    // Step 3: Check password hash
    if (!user.passwordHash) {
      console.log('❌ No password hash');
      process.exit(1);
    }
    console.log('3. ✅ Password hash exists');
    
    // Step 4: Verify password
    console.log('4. Verifying password...');
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('   Password match:', ok ? '✅ YES' : '❌ NO');
    
    if (!ok) {
      console.log('');
      console.log('⚠️  Password mismatch!');
      console.log('   Creating new password hash...');
      const newHash = await bcrypt.hash(password, 10);
      console.log('   Old hash (first 50 chars):', user.passwordHash.substring(0, 50));
      console.log('   New hash (first 50 chars):', newHash.substring(0, 50));
      
      user.passwordHash = newHash;
      await user.save();
      console.log('   ✅ Password hash updated');
      
      // Test again
      const verifyAgain = await bcrypt.compare(password, user.passwordHash);
      console.log('   Verification after update:', verifyAgain ? '✅ YES' : '❌ NO');
    }
    
    // Step 5: Check role
    const userRole = user.role || "user";
    console.log('5. Role check:', userRole);
    console.log('   Is admin or superadmin:', (userRole === "admin" || userRole === "superadmin") ? '✅ YES' : '❌ NO');
    
    console.log('');
    console.log('Summary:');
    console.log('   Email normalized:', normalizedEmail);
    console.log('   User exists:', '✅');
    console.log('   Password hash exists:', '✅');
    console.log('   Password matches:', ok ? '✅' : '❌');
    console.log('   Role check:', (userRole === "admin" || userRole === "superadmin") ? '✅' : '❌');
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

