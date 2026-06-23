import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const password = (process.env.DB_PASSWORD || '').replace(/^['"]|['"]$/g, '');
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
const adapter = new PrismaPg(pool);

// Use a singleton pattern to prevent multiple instances of Prisma Client in development
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export default prisma;
