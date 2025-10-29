// Find all users with similar email addresses
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const searchEmail = '231401032@rajalakshmi.edu.in';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermart';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Searching for users with email containing: 231401032');
    console.log('');
    
    // Find ALL users that might match
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    console.log('');
    
    // Find users with similar email
    const similarUsers = allUsers.filter(u => 
      u.email && u.email.toLowerCase().includes('231401032')
    );
    
    console.log(`Users with email containing '231401032': ${similarUsers.length}`);
    console.log('');
    
    similarUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('   ID:', user._id.toString());
      console.log('   Email:', user.email);
      console.log('   Email (raw):', JSON.stringify(user.email));
      console.log('   Role:', user.role);
      console.log('   Name:', user.name);
      console.log('   Has password hash:', !!user.passwordHash);
      console.log('   Created:', user.createdAt);
      console.log('');
    });
    
    // Also try to find the specific ID from logs
    const logUserId = '690224325dbb08b2fbea2ba2';
    console.log(`Searching for user ID from logs: ${logUserId}`);
    try {
      const logUser = await User.findById(logUserId);
      if (logUser) {
        console.log('✅ Found user with ID from logs:');
        console.log('   Email:', logUser.email);
        console.log('   Role:', logUser.role);
        console.log('   Name:', logUser.name);
      } else {
        console.log('❌ User with that ID not found');
      }
    } catch (e) {
      console.log('❌ Invalid ID format');
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

