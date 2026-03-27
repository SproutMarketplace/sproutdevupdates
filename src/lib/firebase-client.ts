
/**
 * @fileOverview Firebase Client SDK initialization.
 * This module ensures a single instance of the Firebase Client SDK is initialized
 * and provides access to Firestore (db) and Auth services.
 * It is designed to be called only on the client-side to prevent server-side execution.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Validate that all required environment variables are present
const requiredEnvVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => {
        // Convert camelCase to UPPER_SNAKE_CASE
        const snakeCase = key.replace(/([A-Z])/g, '_$1').toUpperCase();
        return `NEXT_PUBLIC_FIREBASE_${snakeCase}`;
    });

if (missingVars.length > 0 && typeof window !== 'undefined') {
    console.error('Firebase configuration error: Missing environment variables:', missingVars);
    console.error('Please create a .env.local file with your Firebase configuration. See FIREBASE_SETUP.md for instructions.');
}

const firebaseConfig = {
    apiKey: requiredEnvVars.apiKey || 'demo-api-key',
    authDomain: requiredEnvVars.authDomain || 'demo-project.firebaseapp.com',
    projectId: requiredEnvVars.projectId || 'demo-project',
    storageBucket: requiredEnvVars.storageBucket || 'demo-project.appspot.com',
    messagingSenderId: requiredEnvVars.messagingSenderId || '123456789',
    appId: requiredEnvVars.appId || 'demo-app-id',
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
    // Check if we're missing critical environment variables
    const hasValidConfig = requiredEnvVars.apiKey && requiredEnvVars.apiKey !== 'demo-api-key';
    
    if (typeof window !== 'undefined') {
        if (!hasValidConfig) {
            console.error('Firebase is not properly configured. Please set up your environment variables.');
            throw new Error('Firebase configuration is missing. Please create a .env.local file with your Firebase configuration.');
        }
        
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app, 'sproutproductiondb');
        } else {
            app = getApp();
            auth = getAuth(app);
            db = getFirestore(app, 'sproutproductiondb');
        }
    }
    
    // This function should not be called on the server, but we return empty objects
    // to prevent an error during server-side rendering if it accidentally is.
    // The actual logic in components should handle this case.
    // @ts-ignore
    return { app, auth, db };
}

export { getFirebaseClient };
