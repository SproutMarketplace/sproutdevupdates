/**
 * @fileOverview Firebase Admin SDK initialization.
 * This module initializes the Firebase Admin SDK for use in server-side logic,
 * primarily for interacting with Firestore.
 *
 * - db: Exported Firestore instance.
 * - admin: Exported Firebase Admin namespace.
 */
import admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined = undefined;
let adminInstance: typeof admin | undefined = undefined;

// Check if the SDK has already been initialized to prevent re-initialization
if (!admin.apps.length) {
  console.log('Attempting Firebase Admin SDK initialization...');

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      console.log('Found FIREBASE_SERVICE_ACCOUNT_JSON environment variable. Attempting to parse...');
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully using service account from environment variable.');
    } catch (error: any) {
      console.error('CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Ensure it is a valid JSON string. Error:', error.message);
    }
  } else {
    console.warn('WARNING: FIREBASE_SERVICE_ACCOUNT_JSON not found. Attempting to initialize with Application Default Credentials. This is expected on deployed environments but not for local development.');
    try {
      admin.initializeApp();
      console.log('Firebase Admin SDK initialized using default credentials.');
    } catch (error: any) {
      console.error('CRITICAL: Firebase Admin SDK initialization failed with default credentials. For local development, ensure the .env.local file is correctly set up with FIREBASE_SERVICE_ACCOUNT_JSON.', error.message);
    }
  }
}

// We only attempt to get the instance if an app was successfully initialized.
if (admin.apps.length > 0 && admin.apps[0]) {
  try {
    db = admin.firestore();
    adminInstance = admin;
  } catch (error) {
    console.error("Failed to get Firestore instance. The Admin SDK might not have initialized properly.", error);
  }
} else {
  console.error('Firebase Admin SDK not initialized, cannot get Firestore instance.');
}

export { db, adminInstance as admin };
