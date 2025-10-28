# Environment Setup Guide

## Quick Start: Create Your `.env` File

### Step 1: Create the File

In your `backend` folder, create a new file named `.env`

### Step 2: Copy This Template

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/super-mart

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

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
```

### Step 3: Configure Each Value

#### ✅ MongoDB URI (REQUIRED)

**Option A: Local MongoDB**
1. Install MongoDB locally
2. Use: `MONGODB_URI=mongodb://localhost:27017/super-mart`

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/super-mart`

#### ✅ JWT Secret (REQUIRED)

Generate a secure random string:
```bash
# On Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Or use: https://randomkeygen.com/

Example: `JWT_SECRET=aB3xK9mP2qR8sT4vW7yZ1cD5eF6gH0iJ`

#### ✅ Cloudinary (REQUIRED for image uploads)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard
3. Add them to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-secret-key
```

#### ✅ Email Configuration (REQUIRED for OTP/notifications)

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate an App Password: [Guide](https://support.google.com/accounts/answer/185833)
3. Use the 16-character app password

```env
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

#### ⚠️ Google Cloud Vision (OPTIONAL - for image search)

**To Enable Image Search:**

1. **Get your credentials** (see `CLOUD_VISION_SETUP.md`)

2. **Minify your JSON file** to ONE LINE:

   **Windows PowerShell:**
   ```powershell
   $json = Get-Content "path-to-your-credentials.json" -Raw | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 10
   $json | Set-Clipboard
   # Now paste from clipboard to your .env file
   ```

   **Online Tool:**
   - Use [JSON Minifier](https://www.json-minify.com/)
   - Upload your credentials JSON
   - Copy the minified output

3. **Paste in `.env` as ONE LINE:**
   ```env
   GOOGLE_CLOUD_VISION_CREDENTIALS={"type":"service_account","project_id":"xxx",...entire JSON here...}
   ```

**To Disable Image Search:**

Simply leave it empty:
```env
GOOGLE_CLOUD_VISION_CREDENTIALS=
```

The app will work fine without it - users just won't see the image search feature.

## Minimal Working Configuration

If you want to test quickly, here's the minimum you need:

```env
# Minimum configuration to run the app
MONGODB_URI=mongodb://localhost:27017/super-mart
JWT_SECRET=change_this_to_something_secure_and_long
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
GOOGLE_CLOUD_VISION_CREDENTIALS=
```

## Testing Your Configuration

### 1. Check MongoDB Connection

```bash
cd backend
node -e "import('mongoose').then(m => m.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/super-mart').then(() => console.log('✅ MongoDB Connected')).catch(e => console.error('❌ MongoDB Error:', e.message)))"
```

### 2. Start the Server

```bash
cd backend
npm run dev
```

Look for these messages:
- ✅ `MongoDB connected`
- ✅ `API listening on http://localhost:5000`
- ⚠️ `Cloud Vision API credentials not provided` (OK if you're not using image search)

### 3. Test the API

Open a browser or use curl:
```bash
curl http://localhost:5000/health
```

Should return: `{"status":"ok"}`

## Common Errors and Solutions

### Error: "MONGODB_URI is not set"
**Solution:** Make sure your `.env` file is in the `backend` folder and has `MONGODB_URI=...`

### Error: "Failed to configure Cloud Vision API"
**Solution:** Either:
1. Leave `GOOGLE_CLOUD_VISION_CREDENTIALS=` empty (no value)
2. Or ensure your JSON is minified to ONE LINE with no newlines

### Error: "MongoServerError: bad auth"
**Solution:** Check your MongoDB Atlas username/password in the connection string

### Error: "Cloudinary configuration error"
**Solution:** Verify your Cloudinary credentials are correct (no quotes, no spaces)

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to Git
- The `.env` file is in `.gitignore` by default
- Use different credentials for development and production
- Rotate your JWT secret regularly
- Use environment variables in production (not `.env` files)

## Production Deployment

For production (Vercel, Heroku, etc.):
- Don't use `.env` files
- Set environment variables in your hosting platform's dashboard
- Use MongoDB Atlas (not local MongoDB)
- Use strong, unique secrets
- Enable MongoDB IP whitelist

## Need Help?

- MongoDB Setup: [MongoDB Atlas Guide](https://www.mongodb.com/docs/atlas/getting-started/)
- Cloudinary Setup: [Cloudinary Quick Start](https://cloudinary.com/documentation/how_to_integrate_cloudinary)
- Cloud Vision Setup: See `CLOUD_VISION_SETUP.md` in this repo

