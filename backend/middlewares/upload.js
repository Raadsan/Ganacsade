import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryLib from 'cloudinary';
import config from '../lib/config/index.js';

const useS3 = config.aws.isConfigured;

if (useS3) {
  console.log(`[upload] Using AWS S3 (${config.aws.bucketName}/${config.aws.uploadPrefix})`);
} else {
  console.log('[upload] Using Cloudinary (AWS S3 credentials not configured)');
}

const cloudinary = cloudinaryLib.v2;

if (!useS3) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

const s3Client = useS3
  ? new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  })
  : null;

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
  }
};

const multerOptions = {
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};

const buildS3Key = (folder, file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
  const nameWithoutExt = file.originalname.split('.')[0];
  return `${config.aws.uploadPrefix}/${folder}/${nameWithoutExt}-${uniqueSuffix}.${ext}`;
};

const createS3Storage = (folder) => multerS3({
  s3: s3Client,
  bucket: config.aws.bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, buildS3Key(folder, file));
  },
});

const createCloudinaryStorage = (folder) => new CloudinaryStorage({
  cloudinary,
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

const normalizeUploadedFiles = (req) => {
  const setPath = (file) => {
    if (file?.location && !file.path) {
      file.path = file.location;
    }
  };

  if (req.file) setPath(req.file);
  if (Array.isArray(req.files)) {
    req.files.forEach(setPath);
  } else if (req.files) {
    Object.values(req.files).flat().forEach(setPath);
  }
};

const wrapMulter = (multerInstance) => {
  const wrapHandler = (handler) => (...args) => {
    const middleware = handler(...args);
    return (req, res, next) => {
      middleware(req, res, (err) => {
        if (err) return next(err);
        if (useS3) normalizeUploadedFiles(req);
        next();
      });
    };
  };

  return {
    single: wrapHandler(multerInstance.single.bind(multerInstance)),
    array: wrapHandler(multerInstance.array.bind(multerInstance)),
    fields: wrapHandler(multerInstance.fields.bind(multerInstance)),
    none: wrapHandler(multerInstance.none.bind(multerInstance)),
    any: wrapHandler(multerInstance.any.bind(multerInstance)),
  };
};

const createUploadMiddleware = (folder) => {
  const storage = useS3
    ? createS3Storage(folder)
    : createCloudinaryStorage(folder);

  return wrapMulter(multer({ storage, ...multerOptions }));
};

export const uploadProduct = createUploadMiddleware('products');
export const uploadCategory = createUploadMiddleware('categories');
export const uploadSubcategory = createUploadMiddleware('subcategories');
export const uploadBrand = createUploadMiddleware('brands');
export const uploadAdvertisement = createUploadMiddleware('advertisements');
export const uploadProfile = createUploadMiddleware('profiles');
export const uploadDelivery = createUploadMiddleware('delivery');

export default uploadProduct;
