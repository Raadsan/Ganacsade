const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const config = require('../config');

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

// Create upload middleware for different folders
const createUploadMiddleware = (folder) => {
  // Configure Cloudinary Storage
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

  // Configure multer
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
  });
};

// Export different upload middleware for different purposes
module.exports = createUploadMiddleware('products'); // Default for backward compatibility
module.exports.uploadProduct = createUploadMiddleware('products');
module.exports.uploadCategory = createUploadMiddleware('categories');
module.exports.uploadSubcategory = createUploadMiddleware('subcategories');
module.exports.uploadBrand = createUploadMiddleware('brands');
module.exports.uploadAdvertisement = createUploadMiddleware('advertisements');
module.exports.uploadProfile = createUploadMiddleware('profiles');
