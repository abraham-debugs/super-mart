// Force fix the user that backend is finding
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const logUserId = '690224325dbb08b2fbea2ba2'; // The ID from backend logs
const email = '231401032@rajalakshmi.edu.in';
const password = 'SuperAdmin@2024';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermart';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Force fixing user from backend logs...');
    console.log('');
    
    // Try to find the user by the ID from logs
    let user = null;
    try {
      user = await User.findById(logUserId);
      if (user) {
        console.log('✅ Found user by log ID:');
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('');
      }
    } catch (e) {
      console.log('Could not find by log ID');
    }
    
    // Also find by email
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        console.log('✅ Found user by email:');
        console.log('   ID:', user._id);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('');
      }
    }
    
    if (!user) {
      console.log('❌ User not found. Creating new one...');
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        phone: '0987654321',
        passwordHash,
        role: 'superadmin',
        emailVerified: true,
        isProfileComplete: true
      });
      console.log('✅ Created new user:', user._id);
    } else {
      console.log('Fixing existing user...');
      const passwordHash = await bcrypt.hash(password, 10);
      user.passwordHash = passwordHash;
      user.role = 'superadmin';
      user.emailVerified = true;
      user.isProfileComplete = true;
      user.email = email.toLowerCase().trim(); // Ensure correct email
      if (!user.phone) {
        user.phone = '0987654321';
      }
      await user.save();
      console.log('✅ Updated user:');
      console.log('   ID:', user._id);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Password hash updated');
    }
    
    // Verify
    console.log('');
    console.log('Verifying...');
    const verify = await bcrypt.compare(password, user.passwordHash);
    console.log('Password verification:', verify ? '✅ YES' : '❌ NO');
    console.log('Final user ID:', user._id.toString());
    console.log('Final role:', user.role);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

