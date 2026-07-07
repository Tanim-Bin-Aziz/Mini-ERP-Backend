import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import multer from 'multer';
import { env } from './env';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

// Multer keeps the file in memory as a Buffer; we then stream it to Cloudinary.
// This avoids the multer-storage-cloudinary package, which only supports
// Cloudinary v1 and conflicts with cloudinary v2.
const memoryStorage = multer.memoryStorage();

export const makeUploader = () => {
  return multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only .jpg, .png, .webp images are allowed'));
      }
      cb(null, true);
    },
  });
};

// Single reusable uploader instance — use .single('image') in routes
export const productImageUpload = makeUploader();

/**
 * Streams a Buffer (from multer memoryStorage) up to Cloudinary.
 * Usage in a controller/service:
 *   const result = await uploadBufferToCloudinary(req.file.buffer, 'products');
 *   // result.secure_url -> save this on the Product document
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `mini-erp/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
