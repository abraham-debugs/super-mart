import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = /^(image)\//.test(file.mimetype);
    if (!isImage) return cb(new Error("Only image uploads are allowed"));
    cb(null, true);
  }
});


