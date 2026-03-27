/**
 * @fileOverview Firebase Client SDK initialization.
 * This module ensures a single instance of the Firebase Client SDK is initialized
 * and provides access to Firestore (db) and Auth services.
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

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

/**
 * Initializes and returns Firebase services safely.
 * This version is silent and won't crash the app if environment variables are missing.
 */
function getFirebaseClient() {
    if (typeof window !== 'undefined') {
        // Check if configuration exists
        const isConfigMissing = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined';

        if (isConfigMissing) {
            // Log a warning instead of throwing an error to prevent site-wide crashes
            console.warn('Firebase configuration is missing. Ensure your Environment Variables are set in GitHub.');
            // @ts-ignore - Returning undefined safely to let components handle it
            return { app: undefined, auth: undefined, db: undefined };
        }

        try {
            if (!getApps().length) {
                app = initializeApp(firebaseConfig);
            } else {
                app = getApp();
            }

            auth = getAuth(app);
            db = getFirestore(app);
        } catch (e) {
            console.error('Firebase initialization error:', e);
        }
    }

    // @ts-ignore
    return { app, auth, db };
}

export { getFirebaseClient };