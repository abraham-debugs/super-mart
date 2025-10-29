#!/usr/bin/env node

/**
 * Quick .env file generator for MDMart Shop
 * Run: node create-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

const envTemplate = `# MDMart Shop - Backend Configuration
# Generated on ${new Date().toISOString()}

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/super-mart

# JWT Secret (CHANGE THIS!)
JWT_SECRET=please_change_this_to_a_secure_random_string_min_32_characters

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client Origin
CLIENT_ORIGIN=http://localhost:5173

# Server Port
PORT=5000

# Google Cloud Vision API (Optional - leave empty if not using)
GOOGLE_CLOUD_VISION_CREDENTIALS=
`;

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('📁 Location:', envPath);
  console.log('\nTo avoid overwriting, this script will not proceed.');
  console.log('If you want to recreate it, delete the existing .env file first.');
  process.exit(0);
}

// Create .env file
try {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('📁 Location:', envPath);
  console.log('\n📝 Next steps:');
  console.log('1. Open backend/.env in your editor');
  console.log('2. Configure all the values (see ENVIRONMENT_SETUP.md for help)');
  console.log('3. Make sure to set:');
  console.log('   - MONGODB_URI (required)');
  console.log('   - JWT_SECRET (required - change the default!)');
  console.log('   - CLOUDINARY credentials (required)');
  console.log('   - EMAIL credentials (required)');
  console.log('   - GOOGLE_CLOUD_VISION_CREDENTIALS (optional)');
  console.log('\n4. Start the server: npm run dev');
  console.log('\n📖 For detailed setup instructions, see: ENVIRONMENT_SETUP.md');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

