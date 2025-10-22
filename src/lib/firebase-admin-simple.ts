/**
 * Simplified Firebase Admin SDK initialization to avoid deployment timeouts
 */
import admin from 'firebase-admin';

let app: admin.app.App | undefined;
let db: admin.firestore.Firestore | undefined;
let auth: admin.auth.Auth | undefined;

// Lazy initialization function
export function getFirebaseAdminLazy() {
  // Only initialize if not already done
  if (!app) {
    try {
      // Check if we're in a hosted environment
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Local development
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        }, 'lazy-init');
      } else {
        // Firebase App Hosting - use automatic discovery
        app = admin.initializeApp({
          projectId: 'sprout-prod-4280b'
        }, 'lazy-init');
      }
      console.log('Firebase Admin SDK lazy initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin SDK lazy initialization failed:', error);
      return { auth: undefined, db: undefined };
    }
  }

  // Get services only when needed
  if (!auth) {
    try {
      auth = app!.auth();
    } catch (error: any) {
      console.error('Failed to initialize Firebase Auth:', error);
    }
  }

  if (!db) {
    try {
      db = app!.firestore('sproutproductiondb');
    } catch (error: any) {
      console.error('Failed to initialize Firestore:', error);
    }
  }

  return { auth, db };
}

// Export for backward compatibility
export const getFirebaseAdmin = getFirebaseAdminLazy;
