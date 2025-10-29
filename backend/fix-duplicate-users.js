// Fix duplicate users - keep superadmin, delete others
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
    console.log('Fixing duplicate users for:', email);
    console.log('');
    
    // Find ALL users with this email
    const users = await User.find({ 
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    console.log(`Found ${users.length} user(s):`);
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ID: ${u._id}, Role: ${u.role}, Created: ${u.createdAt}`);
    });
    console.log('');
    
    if (users.length === 0) {
      console.log('❌ No users found. Creating new one...');
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        phone: '0987654321',
        passwordHash,
        role: 'superadmin',
        emailVerified: true,
        isProfileComplete: true
      });
      console.log('✅ Created new superadmin user:', user._id);
      process.exit(0);
      return;
    }
    
    // Strategy: Keep the superadmin one, or the most recent one, or first one
    let userToKeep = users.find(u => u.role === 'superadmin');
    if (!userToKeep) {
      userToKeep = users.sort((a, b) => b.createdAt - a.createdAt)[0];
    }
    
    const usersToDelete = users.filter(u => u._id.toString() !== userToKeep._id.toString());
    
    console.log('User to KEEP:', userToKeep._id);
    console.log('Users to DELETE:', usersToDelete.map(u => u._id));
    console.log('');
    
    // Fix the user to keep
    console.log('1. Fixing user to keep...');
    const passwordHash = await bcrypt.hash(password, 10);
    userToKeep.passwordHash = passwordHash;
    userToKeep.role = 'superadmin';
    userToKeep.emailVerified = true;
    userToKeep.isProfileComplete = true;
    userToKeep.email = email.toLowerCase().trim(); // Ensure correct email format
    if (!userToKeep.phone) {
      userToKeep.phone = '0987654321';
    }
    await userToKeep.save();
    console.log('   ✅ Updated to superadmin with correct password');
    
    // Delete duplicates
    if (usersToDelete.length > 0) {
      console.log('');
      console.log('2. Deleting duplicate users...');
      for (const user of usersToDelete) {
        await User.findByIdAndDelete(user._id);
        console.log(`   ✅ Deleted user: ${user._id} (role: ${user.role})`);
      }
    }
    
    // Verify
    console.log('');
    console.log('3. Verification...');
    const remainingUsers = await User.find({ 
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    console.log(`   Remaining users: ${remainingUsers.length}`);
    
    if (remainingUsers.length === 1) {
      const finalUser = remainingUsers[0];
      const passwordCheck = await bcrypt.compare(password, finalUser.passwordHash);
      console.log('   ✅ Single user remaining');
      console.log('   ✅ Password verification:', passwordCheck ? 'YES' : 'NO');
      console.log('   ✅ Role:', finalUser.role);
      console.log('   ✅ Email:', finalUser.email);
      console.log('   ✅ ID:', finalUser._id);
    } else {
      console.log('   ⚠️  Still multiple users found!');
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

