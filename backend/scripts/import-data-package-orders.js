import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/config/prisma.js';
import { getOrCreateDataPackageProductId } from '../lib/dataPackages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = !process.argv.includes('--run');
const fileArg = process.argv.find((arg) => !arg.startsWith('--') && arg.endsWith('.json'));

const stats = {
  total: 0,
  imported: 0,
  skippedDuplicate: 0,
  skippedInvalid: 0,
  failed: 0,
};

function log(...args) {
  console.log('[import-dp]', ...args);
}

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DP${timestamp}${random}`;
}

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('252')) return digits.slice(3);
  return digits;
}

async function findOrCreateImportUser(entry) {
  const phone = normalizePhone(entry.customerPhone || entry.paymentPhone);
  const email = entry.customerEmail?.trim()?.toLowerCase() || null;

  if (phone) {
    const byPhone = await prisma.users.findFirst({
      where: { phone_number: phone },
      select: { id: true },
    });
    if (byPhone) return byPhone.id;
  }

  if (email) {
    const byEmail = await prisma.users.findFirst({
      where: { email },
      select: { id: true },
    });
    if (byEmail) return byEmail.id;
  }

  if (DRY_RUN) {
    return 'dry-run-user-id';
  }

  const created = await prisma.users.create({
    data: {
      phone_number: phone,
      email,
      first_name: entry.customerName?.split(' ')?.[0] || 'Imported',
      last_name: entry.customerName?.split(' ')?.slice(1).join(' ') || 'Customer',
      password_hash: '$2a$10$imported.placeholder.hash.for.data.packages',
      role: 'customer',
      status: 'active',
    },
    select: { id: true },
  });

  return created.id;
}

function validateEntry(entry, index) {
  const required = ['packageName', 'providerName', 'recipientPhone', 'amount'];
  const missing = required.filter((key) => entry[key] === undefined || entry[key] === null || entry[key] === '');
  if (missing.length) {
    throw new Error(`row ${index + 1}: missing ${missing.join(', ')}`);
  }
}

async function importEntry(entry, index) {
  validateEntry(entry, index);

  const orderNumber = entry.orderNumber || generateOrderNumber();
  const existing = await prisma.orders.findFirst({
    where: { order_number: orderNumber },
    select: { id: true },
  });

  if (existing) {
    stats.skippedDuplicate += 1;
    log(`skip duplicate: ${orderNumber}`);
    return;
  }

  const userId = await findOrCreateImportUser(entry);
  const recipientPhone = normalizePhone(entry.recipientPhone);
  const amount = Number(entry.amount);
  const status = entry.status || 'delivered';
  const paymentStatus = entry.paymentStatus || 'completed';
  const createdAt = entry.createdAt ? new Date(entry.createdAt) : new Date();

  if (DRY_RUN) {
    log(`[dry-run] would import ${orderNumber} | ${entry.providerName} | ${entry.packageName} | ${recipientPhone} | $${amount}`);
    stats.imported += 1;
    return;
  }

  await prisma.$transaction(async (tx) => {
    const productId = await getOrCreateDataPackageProductId(tx);

    const order = await tx.orders.create({
      data: {
        user_id: userId,
        order_number: orderNumber,
        subtotal: amount,
        total: amount,
        status,
        payment_status: paymentStatus,
        shipping_address: { recipientPhone },
        payment_method: {
          method: entry.paymentMethod || 'imported',
          phone: normalizePhone(entry.paymentPhone || entry.customerPhone),
        },
        customer_notes: JSON.stringify({
          type: 'data_package',
          packageName: entry.packageName,
          providerName: entry.providerName,
          recipientPhone,
          packageDuration: entry.packageDuration || null,
          packageData: entry.packageData || null,
          imported: true,
          source: entry.source || 'manual-import',
          externalId: entry.externalId || null,
        }),
        notes: `Imported data package: ${entry.packageName} for ${recipientPhone}`,
        order_type: 'data_package',
        created_at: createdAt,
        updated_at: createdAt,
      },
    });

    await tx.order_items.create({
      data: {
        order_id: order.id,
        product_id: productId,
        product_name: entry.packageName,
        unit_price: amount,
        quantity: 1,
        total: amount,
        package_name: entry.packageName,
        provider_name: entry.providerName,
        recipient_phone: recipientPhone,
        package_duration: entry.packageDuration || null,
        package_data: entry.packageData || null,
        created_at: createdAt,
      },
    });

    await tx.order_status_history.create({
      data: {
        order_id: order.id,
        status,
        notes: 'Imported historical data package order',
        updated_by_name: 'Import Script',
        created_at: createdAt,
      },
    });
  });

  stats.imported += 1;
  log(`imported: ${orderNumber}`);
}

async function main() {
  const inputPath = fileArg
    ? path.resolve(process.cwd(), fileArg)
    : path.join(__dirname, 'data-package-orders.sample.json');

  log(DRY_RUN ? 'DRY RUN — pass --run to import' : 'LIVE RUN — writing to database');
  log(`reading: ${inputPath}`);

  const raw = await fs.readFile(inputPath, 'utf8');
  const rows = JSON.parse(raw);

  if (!Array.isArray(rows)) {
    throw new Error('JSON file must be an array of orders');
  }

  stats.total = rows.length;

  for (let i = 0; i < rows.length; i += 1) {
    try {
      await importEntry(rows[i], i);
    } catch (err) {
      stats.failed += 1;
      if (err.message?.includes('missing')) {
        stats.skippedInvalid += 1;
      }
      log(`failed row ${i + 1}: ${err.message}`);
    }
  }

  log('--- Summary ---');
  log(JSON.stringify(stats, null, 2));

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
