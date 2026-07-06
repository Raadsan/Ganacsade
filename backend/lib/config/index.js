import 'dotenv/config';

export default {
  // Application
  app: {
    name: process.env.APP_NAME || 'GANACSADE',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiVersion: process.env.API_VERSION || 'v1',
  },

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'ganacsade_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
    url: process.env.DATABASE_URL,
  },

  // JWT — secrets must be set in .env; no insecure fallbacks
  jwt: {
    secret: (() => {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env variable is required');
      return process.env.JWT_SECRET;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: (() => {
      if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET env variable is required');
      return process.env.JWT_REFRESH_SECRET;
    })(),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ],
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // AWS S3 — used for image uploads when credentials are configured
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.replace(/^"|"$/g, ''),
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
    uploadPrefix: process.env.AWS_S3_UPLOAD_PREFIX || 'ganacsade_uploads',
    get isConfigured() {
      return Boolean(
        this.accessKeyId
        && this.secretAccessKey
        && this.region
        && this.bucketName,
      );
    },
  },

  // Email
  email: {
    from: process.env.EMAIL_FROM || 'noreply@ganacsade.com',
    fromName: process.env.EMAIL_FROM_NAME || 'GANACSADE',
  },

  // Payment Gateways
  payment: {
    waafipay: {
      apiKey: process.env.WAAFIPAY_API_KEY,
      apiSecret: process.env.WAAFIPAY_API_SECRET,
      merchantId: process.env.WAAFIPAY_MERCHANT_ID,
      apiUrl: process.env.WAAFIPAY_API_URL,
    },
    edahab: {
      apiKey: process.env.EDAHAB_API_KEY,
      apiSecret: process.env.EDAHAB_API_SECRET,
      merchantId: process.env.EDAHAB_MERCHANT_ID,
      apiUrl: process.env.EDAHAB_API_URL,
    },
    premierWallet: {
      apiKey: process.env.PREMIER_WALLET_API_KEY,
      apiSecret: process.env.PREMIER_WALLET_API_SECRET,
      merchantId: process.env.PREMIER_WALLET_MERCHANT_ID,
      apiUrl: process.env.PREMIER_WALLET_API_URL,
    },
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  },

  fcm: {
    serverKey: process.env.FCM_SERVER_KEY || '',
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID
      || '672314564532-cdl48323a7ge73js4hhpfutu93lsqqps.apps.googleusercontent.com',
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
      || '672314564532-cdl48323a7ge73js4hhpfutu93lsqqps.apps.googleusercontent.com',
    androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID
      || '672314564532-lq5bajov0nsg8k9usp5bpgscmqr9icue.apps.googleusercontent.com',
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || '',
    get isConfigured() {
      return Boolean(this.clientId || this.webClientId || this.androidClientId || this.iosClientId);
    },
  },

  // Misc
  misc: {
    timezone: process.env.TIMEZONE || 'Africa/Mogadishu',
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
  },

  // Frontend URLs
  frontend: {
    adminDashboard: process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000',
    customerApp: process.env.CUSTOMER_APP_URL || 'http://localhost:3001',
  },
};
