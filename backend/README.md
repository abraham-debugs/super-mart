# MDMart Backend

## Setup

Create `.env` in `backend/` with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/supermart
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_ORIGIN=http://localhost:5173
```

Install dependencies and run the dev server:

```
cd backend
npm i
npm run dev
```

## API

- POST `/api/admin/categories` (multipart/form-data)
  - fields: `name` (string), `image` (file)
- GET `/api/admin/categories`


