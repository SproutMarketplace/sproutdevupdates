/**
 * @fileOverview Firebase Admin SDK initialization for server-side operations.
 * This module ensures a single instance of the Firebase Admin SDK is initialized
 * and provides access to Firestore (db) and Auth services.
 */
import admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;
let auth: admin.auth.Auth | undefined;

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // Check if we're in a hosted environment with automatic credentials
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Local development or environment with explicit service account
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
        console.log('Firebase Admin SDK initialized with service account credentials.');
      } else {
        // Firebase App Hosting environment - automatic discovery
        admin.initializeApp();
        console.log('Firebase Admin SDK initialized with automatic credentials.');
      }
    } catch (error: any) {
      console.error('firebase-admin.ts: CRITICAL: Firebase Admin SDK initialization failed.', error);
      return false;
    }
  }
  return true;
}

// Initialize and get instances
function getFirebaseAdmin() {
  if (!db || !auth) {
    const initialized = initializeFirebaseAdmin();
    if (initialized) {
      try {
        auth = admin.auth();
        db = admin.firestore();
        console.log('Firebase Admin SDK services initialized successfully.');
      } catch (error: any) {
        console.error('firebase-admin.ts: Failed to initialize Firebase services.', error);
      }
    }
  }
  return { auth, db };
}

export { getFirebaseAdmin };
