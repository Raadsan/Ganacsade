/**
 * Migrate local / Cloudinary image URLs to AWS S3 and update the database.
 *
 * Usage:
 *   node scripts/migrate-images-to-s3.js          # dry-run (no uploads/DB writes)
 *   node scripts/migrate-images-to-s3.js --run  # execute migration
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import axios from 'axios';
import config from '../lib/config/index.js';
import prisma from '../lib/config/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, '..');
const UPLOADS_ROOT = path.join(BACKEND_ROOT, 'uploads');
const DRY_RUN = !process.argv.includes('--run');

const MIME_BY_EXT = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

const urlCache = new Map();
const stats = {
  scanned: 0,
  skippedAlreadyS3: 0,
  skippedEmpty: 0,
  skippedInvalid: 0,
  uploaded: 0,
  dbUpdated: 0,
  failed: 0,
  missingFile: 0,
};

function log(...args) {
  console.log(`[migrate]`, ...args);
}

function isS3Url(url) {
  if (!url) return false;
  const bucket = config.aws.bucketName;
  return url.includes('.s3.') || (bucket && url.includes(bucket));
}

function isCloudinaryUrl(url) {
  return url.includes('res.cloudinary.com');
}

function extractLocalUploadPath(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const matches = [...trimmed.matchAll(/\/uploads\/.+?\.(?:jpe?g|png|webp|gif)/gi)];
  if (matches.length > 0) {
    return matches[matches.length - 1][0];
  }

  if (trimmed.startsWith('uploads/')) {
    const relativeMatch = trimmed.match(/uploads\/.+?\.(?:jpe?g|png|webp|gif)/i);
    if (relativeMatch) return `/${relativeMatch[0]}`;
  }

  return null;
}

function localPathToDisk(localUrlPath) {
  const relative = localUrlPath.replace(/^\/uploads\/?/, '');
  return path.join(UPLOADS_ROOT, relative);
}

function buildS3Key(localUrlPath) {
  const relative = localUrlPath.replace(/^\/uploads\/?/, '');
  return `${config.aws.uploadPrefix}/${relative.replace(/\\/g, '/')}`;
}

function buildS3PublicUrl(key) {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${encodedKey}`;
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
}

async function readLocalFile(localUrlPath) {
  const diskPath = localPathToDisk(localUrlPath);
  try {
    const buffer = await fs.readFile(diskPath);
    return { buffer, contentType: guessContentType(diskPath), source: diskPath };
  } catch {
    const remoteBases = [
      process.env.BACKEND_PUBLIC_URL,
      'http://localhost:5002',
      'http://178.18.241.5:5002',
    ].filter(Boolean);

    for (const base of remoteBases) {
      try {
        const remoteUrl = `${base.replace(/\/+$/, '')}${localUrlPath}`;
        return await downloadRemote(remoteUrl);
      } catch {
        // try next base
      }
    }

    throw new Error(`file not found: ${diskPath}`);
  }
}

async function downloadRemote(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  const contentType = response.headers['content-type'] || guessContentType(url);
  return { buffer: Buffer.from(response.data), contentType, source: url };
}

async function uploadToS3(s3, key, buffer, contentType) {
  if (DRY_RUN) {
    log(`[dry-run] would upload → ${key}`);
    return buildS3PublicUrl(key);
  }

  await s3.send(new PutObjectCommand({
    Bucket: config.aws.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return buildS3PublicUrl(key);
}

async function resolveToS3Url(s3, originalUrl) {
  stats.scanned += 1;

  if (!originalUrl || typeof originalUrl !== 'string' || !originalUrl.trim()) {
    stats.skippedEmpty += 1;
    return originalUrl;
  }

  const trimmed = originalUrl.trim();

  if (isS3Url(trimmed)) {
    stats.skippedAlreadyS3 += 1;
    return trimmed;
  }

  if (urlCache.has(trimmed)) {
    return urlCache.get(trimmed);
  }

  try {
    let buffer;
    let contentType;
    let key;

    const localPath = extractLocalUploadPath(trimmed);

    if (localPath) {
      key = buildS3Key(localPath);
      try {
        ({ buffer, contentType } = await readLocalFile(localPath));
      } catch {
        stats.missingFile += 1;
        log(`missing local file for: ${trimmed}`);
        return trimmed;
      }
    } else if (isCloudinaryUrl(trimmed) || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // Download Cloudinary or other remote URLs
      const ext = path.extname(new URL(trimmed).pathname) || '.jpg';
      const filename = `remote-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      key = `${config.aws.uploadPrefix}/migrated/remote/${filename}`;
      ({ buffer, contentType } = await downloadRemote(trimmed));
    } else {
      stats.skippedInvalid += 1;
      log(`invalid/unrecognized URL: ${trimmed}`);
      return trimmed;
    }

    const s3Url = await uploadToS3(s3, key, buffer, contentType);
    urlCache.set(trimmed, s3Url);
    stats.uploaded += 1;
    log(`uploaded: ${trimmed.slice(0, 80)} → ${s3Url}`);
    return s3Url;
  } catch (err) {
    stats.failed += 1;
    log(`failed: ${trimmed.slice(0, 80)} — ${err.message}`);
    return trimmed;
  }
}

async function migrateField(s3, url) {
  if (!url) return url;
  return resolveToS3Url(s3, url);
}

async function migrateJsonImageArray(s3, value) {
  if (!value) return value;

  let arr = value;
  if (typeof value === 'string') {
    try {
      arr = JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (!Array.isArray(arr)) return value;

  const migrated = await Promise.all(arr.map(async (item) => {
    if (typeof item === 'string') return migrateField(s3, item);
    return item;
  }));

  return migrated;
}

async function migrateCategories(s3) {
  const rows = await prisma.categories.findMany({
    select: { id: true, image_url: true, icon_path: true },
  });

  for (const row of rows) {
    const imageUrl = await migrateField(s3, row.image_url);
    const iconPath = await migrateField(s3, row.icon_path);

    if (!DRY_RUN && (imageUrl !== row.image_url || iconPath !== row.icon_path)) {
      await prisma.categories.update({
        where: { id: row.id },
        data: {
          ...(imageUrl !== row.image_url ? { image_url: imageUrl } : {}),
          ...(iconPath !== row.icon_path ? { icon_path: iconPath } : {}),
          updated_at: new Date(),
        },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function migrateSubcategories(s3) {
  const rows = await prisma.subcategories.findMany({
    select: { id: true, image_url: true },
  });

  for (const row of rows) {
    const imageUrl = await migrateField(s3, row.image_url);
    if (!DRY_RUN && imageUrl !== row.image_url) {
      await prisma.subcategories.update({
        where: { id: row.id },
        data: { image_url: imageUrl, updated_at: new Date() },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function migrateBrands(s3) {
  const rows = await prisma.brands.findMany({
    select: { id: true, logo_url: true },
  });

  for (const row of rows) {
    const logoUrl = await migrateField(s3, row.logo_url);
    if (!DRY_RUN && logoUrl !== row.logo_url) {
      await prisma.brands.update({
        where: { id: row.id },
        data: { logo_url: logoUrl, updated_at: new Date() },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function migrateAdvertisements(s3) {
  const rows = await prisma.advertisements.findMany({
    select: { id: true, image_url: true },
  });

  for (const row of rows) {
    const imageUrl = await migrateField(s3, row.image_url);
    if (!DRY_RUN && imageUrl !== row.image_url) {
      await prisma.advertisements.update({
        where: { id: row.id },
        data: { image_url: imageUrl, updated_at: new Date() },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function migrateProductImages(s3) {
  const rows = await prisma.product_images.findMany({
    select: { id: true, image_url: true },
  });

  for (const row of rows) {
    const imageUrl = await migrateField(s3, row.image_url);
    if (!DRY_RUN && imageUrl !== row.image_url) {
      await prisma.product_images.update({
        where: { id: row.id },
        data: { image_url: imageUrl },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function migrateUsers(s3) {
  const rows = await prisma.users.findMany({
    select: { id: true, profile_image_url: true },
  });

  for (const row of rows) {
    const profileImageUrl = await migrateField(s3, row.profile_image_url);
    if (!DRY_RUN && profileImageUrl !== row.profile_image_url) {
      await prisma.users.update({
        where: { id: row.id },
        data: { profile_image_url: profileImageUrl, updated_at: new Date() },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function migrateDeliveryPersons(s3) {
  const rows = await prisma.delivery_persons.findMany({
    select: { id: true, user_photo_url: true, vehicle_photos: true },
  });

  for (const row of rows) {
    const userPhotoUrl = await migrateField(s3, row.user_photo_url);
    const vehiclePhotos = await migrateJsonImageArray(s3, row.vehicle_photos);

    const photosChanged = JSON.stringify(vehiclePhotos) !== JSON.stringify(row.vehicle_photos);

    if (!DRY_RUN && (userPhotoUrl !== row.user_photo_url || photosChanged)) {
      await prisma.delivery_persons.update({
        where: { id: row.id },
        data: {
          ...(userPhotoUrl !== row.user_photo_url ? { user_photo_url: userPhotoUrl } : {}),
          ...(photosChanged ? { vehicle_photos: vehiclePhotos } : {}),
          updated_at: new Date(),
        },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function migrateFlashSaleProducts(s3) {
  const rows = await prisma.flash_sale_products.findMany({
    select: { id: true, product_image_url: true },
  });

  for (const row of rows) {
    const productImageUrl = await migrateField(s3, row.product_image_url);
    if (!DRY_RUN && productImageUrl !== row.product_image_url) {
      await prisma.flash_sale_products.update({
        where: { id: row.id },
        data: { product_image_url: productImageUrl },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function migrateOrderItems(s3) {
  const rows = await prisma.order_items.findMany({
    select: { id: true, product_image_url: true },
  });

  for (const row of rows) {
    const productImageUrl = await migrateField(s3, row.product_image_url);
    if (!DRY_RUN && productImageUrl !== row.product_image_url) {
      await prisma.order_items.update({
        where: { id: row.id },
        data: { product_image_url: productImageUrl },
      });
      stats.dbUpdated += 1;
    }
  }
}

async function main() {
  if (!config.aws.isConfigured) {
    console.error('AWS S3 is not configured. Set AWS_* variables in .env');
    process.exit(1);
  }

  log(DRY_RUN ? 'DRY RUN — pass --run to execute' : 'LIVE RUN — uploading to S3 and updating DB');

  const s3 = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  });

  await migrateCategories(s3);
  await migrateSubcategories(s3);
  await migrateBrands(s3);
  await migrateAdvertisements(s3);
  await migrateProductImages(s3);
  await migrateUsers(s3);
  await migrateDeliveryPersons(s3);
  await migrateFlashSaleProducts(s3);
  await migrateOrderItems(s3);

  log('--- Summary ---');
  log(JSON.stringify(stats, null, 2));

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
