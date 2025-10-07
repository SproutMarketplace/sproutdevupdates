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
  try {
    // In a deployed Google Cloud environment (like App Hosting),
    // initializeApp() automatically discovers service credentials.
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully in App Hosting environment.');
  } catch (error: any) {
    console.error('firebase-admin.ts: CRITICAL: Automatic initialization failed.', error);
  }
}

// Assign db and auth instances. This will work if initialization succeeded.
auth = admin.auth();
db = admin.firestore();


// @ts-ignore - We are intentionally allowing these to be potentially undefined
// if initialization fails, and we will handle it in the code that uses them.
export { db, auth };
