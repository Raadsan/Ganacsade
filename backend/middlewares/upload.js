import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryLib from 'cloudinary';
import config from '../lib/config/index.js';

const cloudinary = cloudinaryLib.v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
  }
};

// Create upload middleware for a specific folder
const createUploadMiddleware = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `ganacsade/${folder}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const nameWithoutExt = file.originalname.split('.')[0];
        return `${nameWithoutExt}-${uniqueSuffix}`;
      },
    },
  });

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
  });
};

export const uploadProduct = createUploadMiddleware('products');
export const uploadCategory = createUploadMiddleware('categories');
export const uploadSubcategory = createUploadMiddleware('subcategories');
export const uploadBrand = createUploadMiddleware('brands');
export const uploadAdvertisement = createUploadMiddleware('advertisements');
export const uploadProfile = createUploadMiddleware('profiles');
export const uploadDelivery = createUploadMiddleware('delivery');

export default uploadProduct;
