/**
 * @fileOverview Firebase Admin SDK initialization for server-side operations.
 * This module ensures a single instance of the Firebase Admin SDK is initialized
 * and provides access to Firestore (db) and Auth services.
 */
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

// Check if the app is already initialized to prevent re-initialization.
if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountString) {
    console.error('firebase-admin.ts: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. Firebase Admin SDK will not be initialized.');
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
      auth = admin.auth();
      db = admin.firestore();
    } catch (error: any) {
      console.error('firebase-admin.ts: CRITICAL: Failed to parse or initialize Firebase Admin SDK. The FIREBASE_SERVICE_ACCOUNT_JSON environment variable may be corrupted or malformed.', error);
    }
  }
} else {
  // If the app is already initialized, just get the instances.
  auth = admin.auth();
  db = admin.firestore();
}


// @ts-ignore - We are intentionally allowing these to be potentially undefined
// if initialization fails, and we will handle it in the code that uses them.
export { db, auth };
