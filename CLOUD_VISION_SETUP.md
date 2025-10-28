# Google Cloud Vision API Setup Guide

This guide will help you set up Google Cloud Vision API for image-based product search in the Super Mart Shop application.

## Prerequisites

- A Google Cloud Platform account
- Your Cloud Vision API credentials JSON file

## Step 1: Get Your Cloud Vision API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Vision API** for your project:
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

4. Create a service account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "super-mart-vision")
   - Grant it the "Cloud Vision API User" role
   - Click "Done"

5. Generate credentials:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file - **Keep this file secure!**

## Step 2: Configure the Backend

### Option 1: Using Environment Variable (Recommended for Production)

1. Open your `backend/.env` file

2. Add the following line with your credentials JSON as a **single-line string**:

```env
GOOGLE_CLOUD_VISION_CREDENTIALS={"type":"service_account","project_id":"your-project-id","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n","client_email":"your-email@project.iam.gserviceaccount.com","client_id":"123","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/xxx"}
```

**Important:** Make sure to:
- Remove all newlines and extra spaces from the JSON
- Keep the entire JSON on one line
- Escape any special characters if needed

### Option 2: Using Environment Variable with File Path (Recommended for Development)

Alternatively, you can store the path to your credentials file:

1. Place your downloaded JSON file in a secure location (e.g., `backend/config/google-credentials.json`)

2. **Important:** Add this file to `.gitignore`:
   ```
   backend/config/google-credentials.json
   ```

3. Modify `backend/src/config/vision.js` to support file paths:

```javascript
// Add at the top
import fs from 'fs';
import path from 'path';

export function configureVision(credentials) {
  if (!credentials) {
    console.warn('Cloud Vision API credentials not provided.');
    return null;
  }

  try {
    // Check if it's a file path
    if (typeof credentials === 'string' && credentials.endsWith('.json')) {
      const credPath = path.resolve(credentials);
      const credData = fs.readFileSync(credPath, 'utf8');
      return configureVision(credData);
    }

    // Rest of the existing code...
```

## Step 3: Verify Setup

1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the console logs:
   - ✅ Success: `Cloud Vision API configured successfully`
   - ⚠️  Warning: `Cloud Vision API credentials not provided. Image search will be disabled.`

3. Test the API status:
   ```bash
   curl http://localhost:5000/api/image-search/status
   ```

   Expected response:
   ```json
   {
     "available": true,
     "message": "Image search is available"
   }
   ```

## Step 4: Using Image Search

### From the Frontend

1. Click the **Camera icon** 📷 in the header navigation
2. Upload an image or take a photo
3. Click "Search Products"
4. View the detected labels and matching products

### API Endpoint

**POST** `/api/image-search/search`

**Headers:**
- `Content-Type: multipart/form-data`

**Body:**
- `image`: Image file (max 10MB)

**Response:**
```json
{
  "analysis": {
    "labels": [...],
    "objects": [...],
    "searchTerms": [...],
    "primaryTerm": "apple"
  },
  "products": [...],
  "message": "Found 5 matching products"
}
```

## Pricing

Google Cloud Vision API pricing (as of 2024):
- **Free tier:** First 1,000 units per month
- **After free tier:** $1.50 per 1,000 units

Features used:
- Label Detection
- Object Localization  
- Text Detection
- Web Detection

Each image search uses 4 units (one for each feature).

## Security Best Practices

1. **Never commit credentials to Git:**
   - Add `.env` to `.gitignore`
   - Add credential files to `.gitignore`

2. **Use environment-specific credentials:**
   - Development: Local file path
   - Production: Environment variable

3. **Restrict API key permissions:**
   - Only enable Cloud Vision API
   - Use service accounts, not personal accounts

4. **Monitor usage:**
   - Set up billing alerts
   - Monitor API usage in Google Cloud Console

## Troubleshooting

### "Image search is not available"
- Check that `GOOGLE_CLOUD_VISION_CREDENTIALS` is set in `.env`
- Verify the credentials JSON is valid
- Ensure the Cloud Vision API is enabled in Google Cloud

### "Failed to authenticate"
- Verify your service account has the correct permissions
- Check that the credentials JSON is not corrupted
- Ensure the JSON is properly formatted (no extra newlines)

### "Quota exceeded"
- Check your Google Cloud Console for usage
- You may have exceeded the free tier
- Consider enabling billing for higher limits

## Optional: Disable Image Search

If you don't want to use image search, simply:
1. Don't set the `GOOGLE_CLOUD_VISION_CREDENTIALS` variable
2. The app will work normally, but the image search feature will show as "not available"

The button will still appear but will show an appropriate message when clicked.

## Support

For issues with:
- **Google Cloud Platform:** Check [GCP Documentation](https://cloud.google.com/vision/docs)
- **Application setup:** Create an issue in the repository




