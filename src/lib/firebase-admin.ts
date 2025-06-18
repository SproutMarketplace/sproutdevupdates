
'use server';
/**
 * @fileOverview Firebase Admin SDK initialization.
 * This module initializes the Firebase Admin SDK for use in server-side logic,
 * primarily for interacting with Firestore.
 *
 * - db: Exported Firestore instance.
 * - admin: Exported Firebase Admin namespace.
 */
import admin from 'firebase-admin';

// Check if the SDK has already been initialized
if (!admin.apps.length) {
  const serviceAccountEnvJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectIdEnv = process.env.FIREBASE_PROJECT_ID;
  const clientEmailEnv = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

  try {
    if (serviceAccountEnvJson) {
      const serviceAccount = JSON.parse(serviceAccountEnvJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (projectIdEnv && clientEmailEnv && privateKeyEnv) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectIdEnv,
          clientEmail: clientEmailEnv,
          privateKey: privateKeyEnv.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Fallback for environments like Google Cloud Functions or App Engine
      // where GOOGLE_APPLICATION_CREDENTIALS might be set implicitly.
      // This is common in Firebase Studio environments.
      admin.initializeApp();
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    // If initialization fails, subsequent Firestore operations will fail.
    // Consider how to handle this case based on application requirements.
  }
}

// Export firestore instance and admin namespace
let db: admin.firestore.Firestore;
let adminInstance: typeof admin;

try {
  db = admin.firestore();
  adminInstance = admin;
} catch (error) {
  console.error("Failed to get Firestore instance or admin namespace. Firebase Admin SDK might not have initialized properly.");
  // Fallback or rethrow, depending on desired error handling
  // For now, db and adminInstance might be undefined if admin.firestore() or admin itself throws an error
  // which can happen if admin.initializeApp() failed silently or was not called.
  // The action using this will need to check for their existence.
}

export { db, adminInstance as admin };
