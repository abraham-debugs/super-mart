// Script to create or update a superadmin user
// Usage: node create-superadmin.js <email> <phone> [password]
// If password is not provided, it will use a default password: SuperAdmin@2024

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const email = process.argv[2];
const phone = process.argv[3];
const password = process.argv[4] || 'SuperAdmin@2024';

if (!email || !phone) {
  console.error('Usage: node create-superadmin.js <email> <phone> [password]');
  console.error('Example: node create-superadmin.js admin@example.com 0987654321');
  process.exit(1);
}

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermart';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (user) {
      // Update existing user
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { 
          $set: { 
            role: 'superadmin',
            phone: phone,
            passwordHash: passwordHash,
            emailVerified: true,
            isProfileComplete: true
          } 
        },
        { new: true }
      );
      console.log(`✅ Successfully updated existing user to superadmin:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: ${password}`);
    } else {
      // Create new user
      const passwordHash = await bcrypt.hash(password, 10);
      const name = email.split('@')[0]; // Use email prefix as default name
      
      user = await User.create({
        name: name,
        email: email.toLowerCase().trim(),
        phone: phone,
        passwordHash: passwordHash,
        role: 'superadmin',
        emailVerified: true,
        isProfileComplete: true
      });
      
      console.log(`✅ Successfully created new superadmin user:`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: ${password}`);
    }
    
    console.log('');
    console.log('⚠️  IMPORTANT: Save these credentials securely!');
    console.log('   You can now login at /admin/login');
    console.log('   After login, you must LOG OUT and LOG BACK IN for the role change to take effect!');
    console.log('   The JWT token needs to be regenerated with the new role.');
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

