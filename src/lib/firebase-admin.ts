
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

  console.log('Attempting Firebase Admin SDK initialization...');
  try {
    if (serviceAccountEnvJson) {
      const serviceAccount = JSON.parse(serviceAccountEnvJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_JSON.');
    } else if (projectIdEnv && clientEmailEnv && privateKeyEnv) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectIdEnv,
          clientEmail: clientEmailEnv,
          privateKey: privateKeyEnv.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin SDK initialized using individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
    } else {
      // Fallback for environments like Google Cloud Functions or App Engine
      // where GOOGLE_APPLICATION_CREDENTIALS might be set implicitly.
      // This is common in Firebase Studio environments.
      admin.initializeApp();
      console.log('Firebase Admin SDK initialized using default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS or Application Default Credentials).');
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    console.error('Stack trace:', error.stack);
    // If initialization fails, subsequent Firestore operations will fail.
  }
} else {
  console.log('Firebase Admin SDK already initialized.');
}

// Export firestore instance and admin namespace
let db: admin.firestore.Firestore | undefined = undefined;
let adminInstance: typeof admin | undefined = undefined;

try {
  if (admin.apps.length) { // Ensure an app is initialized before trying to use services
    db = admin.firestore();
    adminInstance = admin;
    console.log('Firestore instance obtained successfully.');
  } else {
    console.error('Firebase Admin SDK not initialized, cannot get Firestore instance.');
  }
} catch (error: any) {
  console.error("Failed to get Firestore instance or admin namespace. Firebase Admin SDK might not have initialized properly.");
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
  // db and adminInstance will remain undefined if admin.firestore() or admin itself throws an error.
}

export { db, adminInstance as admin };
