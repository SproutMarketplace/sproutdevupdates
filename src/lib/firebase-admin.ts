/**
 * @fileOverview Firebase Admin SDK initialization for server-side operations.
 * This module ensures a single instance of the Firebase Admin SDK is initialized
 * and provides access to Firestore (db) and Auth services.
 */
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent re-initialization
if (!admin.apps.length) {
  try {
    // Get credentials from environment variable
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set.');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('CRITICAL: Failed to initialize Firebase Admin SDK.', error);
    // We throw an error to halt execution if Firebase Admin fails to initialize,
    // as it's critical for the application's backend logic.
    throw new Error('Server configuration error: Could not initialize Firebase Admin SDK.');
  }
}

// Export auth and firestore instances
const auth = admin.auth();
const db = admin.firestore();

export { db, auth, admin };
