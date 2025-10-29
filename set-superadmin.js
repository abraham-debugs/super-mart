// Script to set a user as superadmin
// Run this with: node set-superadmin.js your@email.com

import mongoose from 'mongoose';
import { User } from './backend/src/models/User.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node set-superadmin.js your@email.com');
  process.exit(1);
}

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermart';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: { role: 'superadmin' } },
      { new: true }
    );

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ Successfully updated user ${user.name} (${user.email}) to superadmin role`);
    console.log('');
    console.log('⚠️  IMPORTANT: You must LOG OUT and LOG BACK IN for the role change to take effect!');
    console.log('   The JWT token needs to be regenerated with the new role.');
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });







