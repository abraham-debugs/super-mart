// Find all users with the same email
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const email = '231401032@rajalakshmi.edu.in';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermart';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Searching for users with email:', email);
    console.log('');
    
    // Find ALL users with this email (case-insensitive)
    const users = await User.find({ 
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    console.log(`Found ${users.length} user(s) with email "${email}":`);
    console.log('');
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('   ID:', user._id);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Name:', user.name);
      console.log('   Phone:', user.phone);
      console.log('   Has password hash:', !!user.passwordHash);
      console.log('   Created:', user.createdAt);
      console.log('');
    });
    
    if (users.length > 1) {
      console.log('⚠️  DUPLICATE USERS FOUND!');
      console.log('');
      console.log('We need to:');
      console.log('1. Keep the most recent user (or the one with superadmin role)');
      console.log('2. Delete the duplicate(s)');
      console.log('');
      
      // Find the one to keep (prefer superadmin, then most recent)
      const toKeep = users.find(u => u.role === 'superadmin') || users.sort((a, b) => b.createdAt - a.createdAt)[0];
      const toDelete = users.filter(u => u._id.toString() !== toKeep._id.toString());
      
      console.log('User to KEEP:');
      console.log('   ID:', toKeep._id);
      console.log('   Role:', toKeep.role);
      console.log('');
      
      console.log('Users to DELETE:');
      toDelete.forEach(user => {
        console.log('   ID:', user._id, '- Role:', user.role);
      });
      
      // Ask for confirmation before deleting
      console.log('');
      console.log('To delete duplicates, run: node delete-duplicate-users.js');
    } else if (users.length === 1) {
      console.log('✅ No duplicates found. User is unique.');
      
      // Update this user to superadmin and fix password
      const user = users[0];
      console.log('');
      console.log('Current user:');
      console.log('   ID:', user._id);
      console.log('   Role:', user.role);
      console.log('   Needs update:', user.role !== 'superadmin');
    } else {
      console.log('❌ No users found with this email!');
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

