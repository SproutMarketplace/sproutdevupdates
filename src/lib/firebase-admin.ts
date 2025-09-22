
/**
 * @fileOverview Firebase Admin SDK initialization.
 * This module initializes the Firebase Admin SDK for use in server-side logic,
 * primarily for interacting with Firestore and Firebase Auth.
 *
 * It uses a singleton pattern to ensure that the SDK is initialized only once,
 * providing reliable instances of Firestore (db) and the Admin SDK (admin).
 */
import admin from 'firebase-admin';

// Define a type for our singleton to ensure type safety.
interface FirebaseAdminSingleton {
  app: admin.app.App;
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
}

// Function to initialize and return the Firebase Admin SDK instances.
const initializeAdminApp = (): FirebaseAdminSingleton => {
  // If an app with the default name is already initialized, return its instances.
  const existingApp = admin.apps.find(app => app?.name === '[DEFAULT]');
  if (existingApp) {
    console.log('Firebase Admin SDK already initialized. Reusing existing instances.');
    return {
      app: existingApp,
      db: admin.firestore(existingApp),
      auth: admin.auth(existingApp),
    };
  }

  // If no app is initialized, proceed with initialization.
  console.log('Attempting Firebase Admin SDK initialization...');
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_JSON is not set. Cannot initialize Firebase Admin SDK.');
    // Throwing an error here is important to prevent the server from running in a broken state.
    throw new Error('Server configuration error: Firebase service account credentials are not available.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
    return {
      app,
      db: admin.firestore(app),
      auth: admin.auth(app),
    };
  } catch (error: any) {
    console.error('CRITICAL: Failed to initialize Firebase Admin SDK. Error:', error.message);
    throw new Error('Server configuration error: Could not initialize Firebase Admin SDK.');
  }
};

// Get the initialized instances.
const { db, auth } = initializeAdminApp();

// Export the instances for use in other server-side modules.
export { db, auth, admin };
