import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import prisma from '../config/prisma.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const backendRoot = resolve(__dirname, '../..');

let firebaseApp = null;

const resolveServiceAccountPath = () => {
  const configuredPath = String(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json').trim();
  return resolve(backendRoot, configuredPath);
};

const initFirebaseAdmin = () => {
  if (firebaseApp) return firebaseApp;

  const serviceAccountPath = resolveServiceAccountPath();
  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    firebaseApp = admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
    return firebaseApp;
  }

  return null;
};

const getLegacyServerKey = () => String(process.env.FCM_SERVER_KEY || '').trim();

const sendPushWithServiceAccount = async (token, { title, body, data = {} }) => {
  initFirebaseAdmin();
  if (!firebaseApp) return false;

  try {
    await getMessaging(firebaseApp).send({
      token,
      notification: {
        title,
        body: String(body || '').slice(0, 500),
      },
      data: Object.fromEntries(
        Object.entries(data || {}).map(([key, value]) => [key, String(value ?? '')]),
      ),
      android: {
        priority: 'high',
        notification: {
          channelId: 'ganacsade_alerts',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true,
          },
        },
      },
    });
    return true;
  } catch (error) {
    console.error('FCM service-account push failed:', error?.message || error);
    return false;
  }
};

const sendPushWithLegacyKey = async (token, { title, body, data = {} }) => {
  const serverKey = getLegacyServerKey();
  if (!serverKey) return false;

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${serverKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      priority: 'high',
      notification: {
        title,
        body: String(body || '').slice(0, 500),
        sound: 'default',
      },
      data: Object.fromEntries(
        Object.entries(data || {}).map(([key, value]) => [key, String(value ?? '')]),
      ),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('FCM legacy push failed:', response.status, errorText);
    return false;
  }

  return true;
};

export const sendPushToUser = async (userId, { title, body, data = {} }) => {
  if (!userId || !title) return false;

  try {
    const user = await prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
      select: { fcm_token: true },
    });

    if (!user?.fcm_token) return false;

    const payload = { title, body, data };
    const serviceAccountPath = resolveServiceAccountPath();

    if (existsSync(serviceAccountPath)) {
      return await sendPushWithServiceAccount(user.fcm_token, payload);
    }

    if (getLegacyServerKey()) {
      return await sendPushWithLegacyKey(user.fcm_token, payload);
    }

    console.error(
      'FCM not configured. Add backend/serviceAccountKey.json or set FCM_SERVER_KEY in .env',
    );
    return false;
  } catch (error) {
    console.error('FCM push error:', error?.message || error);
    return false;
  }
};

export const saveUserFcmToken = async (userId, token, platform = 'android') => {
  const normalizedToken = String(token || '').trim();
  if (!userId || !normalizedToken) {
    return { success: false, message: 'Token is required' };
  }

  await prisma.users.update({
    where: { id: userId },
    data: { fcm_token: normalizedToken },
  });

  return { success: true, platform };
};
