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
        admin.initializeApp({
          projectId: 'sprout-prod-4280b'
        });
        console.log('Firebase Admin SDK initialized with automatic credentials.');
      }
    } catch (error: any) {
      console.error('firebase-admin.ts: CRITICAL: Firebase Admin SDK initialization failed.', error);
      // Don't return false, let it continue with undefined values
      return false;
    }
  }
  return true;
}

// Initialize and get instances
function getFirebaseAdmin() {
  try {
    if (!db || !auth) {
      const initialized = initializeFirebaseAdmin();
      if (initialized && admin.apps.length > 0) {
        try {
          auth = admin.auth();
          db = admin.firestore('sproutproductiondb');
          console.log('Firebase Admin SDK services initialized successfully.');
        } catch (error: any) {
          console.error('firebase-admin.ts: Failed to initialize Firebase services.', error);
        }
      }
    }
    return { auth, db };
  } catch (error: any) {
    console.error('firebase-admin.ts: Error in getFirebaseAdmin:', error);
    return { auth: undefined, db: undefined };
  }
}

export { getFirebaseAdmin };
