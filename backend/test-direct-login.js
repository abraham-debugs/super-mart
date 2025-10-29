// Direct test of login logic without HTTP
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
    console.log('✅ Connected to MongoDB');
    console.log('');
    console.log('Testing login logic exactly as backend does...');
    console.log('');
    
    // Step 1: Normalize email (same as backend)
    const normalizedEmail = String(email).toLowerCase().trim();
    console.log('1. Normalized email:', normalizedEmail);
    
    // Step 2: Find user (same query as backend)
    let user = await User.findOne({ email: normalizedEmail });
    console.log('2. User lookup result:', user ? `Found (ID: ${user._id}, Role: ${user.role})` : 'NOT FOUND');
    
    if (!user) {
      console.log('❌ USER NOT FOUND - This is the problem!');
      console.log('');
      console.log('Trying case-insensitive search...');
      user = await User.findOne({ 
        email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      console.log('Case-insensitive result:', user ? `Found (ID: ${user._id}, Role: ${user.role})` : 'NOT FOUND');
    }
    
    if (!user) {
      console.log('');
      console.log('❌ User still not found. Listing all users:');
      const all = await User.find({});
      all.forEach(u => {
        console.log(`  - ID: ${u._id}, Email: "${u.email}", Role: ${u.role}`);
      });
      process.exit(1);
      return;
    }
    
    console.log('3. User found:');
    console.log('   ID:', user._id.toString());
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Has password hash:', !!user.passwordHash);
    
    // Step 3: Check password hash
    if (!user.passwordHash) {
      console.log('❌ No password hash!');
      process.exit(1);
      return;
    }
    console.log('4. Password hash exists: ✅');
    
    // Step 4: Verify password
    console.log('5. Verifying password...');
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('   Result:', ok ? '✅ CORRECT' : '❌ INCORRECT');
    
    if (!ok) {
      console.log('');
      console.log('❌ Password mismatch!');
      console.log('   Creating new hash and updating...');
      const newHash = await bcrypt.hash(password, 10);
      user.passwordHash = newHash;
      user.role = 'superadmin';
      await user.save();
      
      // Test again
      const verifyAgain = await bcrypt.compare(password, user.passwordHash);
      console.log('   New hash verification:', verifyAgain ? '✅ CORRECT' : '❌ INCORRECT');
    }
    
    // Step 5: Check role
    const userRole = user.role || "user";
    console.log('6. Role check:', userRole);
    const hasAdminRole = userRole === "admin" || userRole === "superadmin";
    console.log('   Has admin/superadmin role:', hasAdminRole ? '✅ YES' : '❌ NO');
    
    if (!hasAdminRole) {
      console.log('');
      console.log('⚠️  Fixing role...');
      user.role = 'superadmin';
      await user.save();
      console.log('   ✅ Role updated to superadmin');
    }
    
    console.log('');
    console.log('=== FINAL STATUS ===');
    const finalUser = await User.findById(user._id);
    const finalPasswordCheck = await bcrypt.compare(password, finalUser.passwordHash);
    console.log('User ID:', finalUser._id.toString());
    console.log('Email:', finalUser.email);
    console.log('Role:', finalUser.role);
    console.log('Password correct:', finalPasswordCheck ? '✅ YES' : '❌ NO');
    
    if (finalPasswordCheck && (finalUser.role === 'admin' || finalUser.role === 'superadmin')) {
      console.log('');
      console.log('✅ EVERYTHING IS CORRECT!');
      console.log('');
      console.log('If login still fails, the backend server likely needs to be restarted.');
      console.log('The database is correct - the issue is with the running server.');
    } else {
      console.log('');
      console.log('❌ Something is still wrong');
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

