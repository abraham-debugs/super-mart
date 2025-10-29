// Script to verify superadmin user credentials
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const email = '231401032@rajalakshmi.edu.in';
const testPassword = 'SuperAdmin@2024';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermart';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Checking user:', email);
    console.log('');
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('❌ User not found in database');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user._id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Phone:', user.phone);
    console.log('   Role:', user.role);
    console.log('   Password Hash exists:', !!user.passwordHash);
    console.log('   Email Verified:', user.emailVerified);
    console.log('   Profile Complete:', user.isProfileComplete);
    console.log('');
    
    if (user.passwordHash) {
      const passwordMatch = await bcrypt.compare(testPassword, user.passwordHash);
      console.log('Password verification:');
      console.log('   Test Password:', testPassword);
      console.log('   Password Match:', passwordMatch ? '✅ YES' : '❌ NO');
      
      if (!passwordMatch) {
        console.log('');
        console.log('⚠️  Password does not match!');
        console.log('   Re-hashing the password...');
        const newHash = await bcrypt.hash(testPassword, 10);
        user.passwordHash = newHash;
        await user.save();
        console.log('   ✅ Password hash updated');
        
        // Verify again
        const verifyAgain = await bcrypt.compare(testPassword, user.passwordHash);
        console.log('   New password match:', verifyAgain ? '✅ YES' : '❌ NO');
      }
    } else {
      console.log('⚠️  No password hash found. Setting password...');
      const passwordHash = await bcrypt.hash(testPassword, 10);
      user.passwordHash = passwordHash;
      user.role = 'superadmin';
      user.emailVerified = true;
      user.isProfileComplete = true;
      await user.save();
      console.log('✅ Password hash created');
    }
    
    console.log('');
    console.log('Final user status:');
    console.log('   Role:', user.role);
    console.log('   Email Verified:', user.emailVerified);
    console.log('   Profile Complete:', user.isProfileComplete);
    console.log('   Password Hash:', !!user.passwordHash);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

