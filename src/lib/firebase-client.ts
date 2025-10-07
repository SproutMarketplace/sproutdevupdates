
/**
 * @fileOverview Firebase Client SDK initialization.
 * This module ensures a single instance of the Firebase Client SDK is initialized
 * and provides access to Firestore (db) and Auth services.
 * It is designed to be called only on the client-side to prevent server-side execution.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/**
 * Initializes and returns Firebase services. This function ensures that Firebase is
 * initialized only once, and it should only be called on the client-side.
 * @returns An object containing the initialized Firebase app, auth, and firestore instances.
 */
function getFirebaseClient() {
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
        } else {
            app = getApp();
            auth = getAuth(app);
            db = getFirestore(app);
        }
    }
    // This function should not be called on the server, but we return empty objects
    // to prevent an error during server-side rendering if it accidentally is.
    // The actual logic in components should handle this case.
    // @ts-ignore
    return { app, auth, db };
}

export { getFirebaseClient };
