import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary({ cloudName, apiKey, apiSecret }) {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not set");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  return cloudinary;
}


