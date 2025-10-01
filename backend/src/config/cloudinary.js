import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary({ cloudName, apiKey, apiSecret }) {
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary credentials are missing; image uploads will fail.");
    return cloudinary;
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  return cloudinary;
}


