import { OAuth2Client } from 'google-auth-library';
import config from '../config/index.js';

const client = new OAuth2Client();

const FALLBACK_AUDIENCES = [
  '672314564532-cdl48323a7ge73js4hhpfutu93lsqqps.apps.googleusercontent.com',
  '672314564532-lq5bajov0nsg8k9usp5bpgscmqr9icue.apps.googleusercontent.com',
];

const getGoogleAudiences = () => {
  const fromEnv = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
    config.google?.webClientId,
    config.google?.androidClientId,
    config.google?.clientId,
    config.google?.iosClientId,
  ].filter(Boolean);

  return [...new Set([...fromEnv, ...FALLBACK_AUDIENCES])];
};

/**
 * Verify a Google ID token from the mobile app.
 * @returns {import('google-auth-library').TokenPayload}
 */
export async function verifyGoogleIdToken(idToken) {
  const audience = getGoogleAudiences();

  const verifyPromise = client.verifyIdToken({
    idToken,
    audience,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error('Google token verification timed out. Check server internet access.');
      error.statusCode = 504;
      reject(error);
    }, 15000);
  });

  const ticket = await Promise.race([verifyPromise, timeoutPromise]);

  const payload = ticket.getPayload();
  if (!payload?.sub) {
    const error = new Error('Invalid Google token');
    error.statusCode = 401;
    throw error;
  }

  if (payload.email_verified === false) {
    const error = new Error('Google email is not verified');
    error.statusCode = 401;
    throw error;
  }

  return payload;
}
