/**
 * @fileOverview Firebase Admin SDK initialization for server-side operations.
 * This module ensures a single instance of the Firebase Admin SDK is initialized
 * and provides access to Firestore (db) and Auth services.
 */
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent re-initialization.
if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountString) {
    console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
    throw new Error('Server configuration error: Firebase credentials are not set.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('CRITICAL: Failed to parse or initialize Firebase Admin SDK. The FIREBASE_SERVICE_ACCOUNT_JSON environment variable may be corrupted or malformed.', error);
    throw new Error('Server configuration error: Could not initialize Firebase Admin SDK due to invalid credentials.');
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { db, auth };
