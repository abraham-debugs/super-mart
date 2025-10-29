// Fix superadmin password - ensure it's correctly hashed
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
    
    console.log('Fixing password for:', email);
    console.log('');
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('Current user info:');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Old hash exists:', !!user.passwordHash);
    
    // Create fresh password hash
    console.log('');
    console.log('Creating new password hash...');
    const newHash = await bcrypt.hash(password, 10);
    
    // Update user
    user.passwordHash = newHash;
    user.role = 'superadmin';
    user.emailVerified = true;
    user.isProfileComplete = true;
    await user.save();
    
    console.log('✅ Password hash updated');
    console.log('✅ Role set to superadmin');
    console.log('✅ Email verified');
    console.log('✅ Profile complete');
    
    // Verify the new hash
    console.log('');
    console.log('Verifying new password hash...');
    const verify1 = await bcrypt.compare(password, user.passwordHash);
    console.log('   Verification result:', verify1 ? '✅ YES' : '❌ NO');
    
    // Test with exact string
    const testPassword = 'SuperAdmin@2024';
    const verify2 = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('   Test with exact string:', verify2 ? '✅ YES' : '❌ NO');
    
    console.log('');
    console.log('Summary:');
    console.log('   Email:', user.email);
    console.log('   Password:', password);
    console.log('   Role:', user.role);
    console.log('   Password verification:', verify1 ? '✅ WORKING' : '❌ FAILED');
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

