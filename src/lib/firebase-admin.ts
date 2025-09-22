
/**
 * @fileOverview Firebase Admin SDK initialization for server-side operations.
 * This module ensures a single instance of the Firebase Admin SDK is initialized
 * and provides access to Firestore (db) and Auth services.
 */
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error: any) {
    console.error('CRITICAL: Failed to initialize Firebase Admin SDK.', error);
    // This will be caught by the server action and result in a user-facing error.
    throw new Error('Server configuration error: Could not initialize Firebase Admin SDK.');
  }
}


// Export auth and firestore instances for use in server-side code.
const auth = admin.auth();
const db = admin.firestore();

export { db, auth };
