
'use server';

import { db, admin as firebaseAdminInstance } from '@/lib/firebase-admin';

interface FormState {
  message: string;
  success: boolean;
  timestamp?: number; // Added to ensure state updates trigger re-renders
}

export async function signUpForUpdatesAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string;

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address.', timestamp: Date.now() };
  }

  try {
    // Check if db and firebaseAdminInstance are available (initialized)
    if (!db || !firebaseAdminInstance || !firebaseAdminInstance.firestore || !firebaseAdminInstance.firestore.FieldValue) {
        console.error('Firestore (db) or Firebase Admin instance/FieldValue is not available. SDK might not have initialized correctly.');
        return { success: false, message: 'Server configuration error. Please try again later.', timestamp: Date.now() };
    }

    const subscribersCollection = db.collection('subscribers');
    
    // Check if email already exists to prevent duplicates
    const existingSubscriberQuery = await subscribersCollection.where('email', '==', email).limit(1).get();
    if (!existingSubscriberQuery.empty) {
      // Email already exists
      return { success: true, message: "You're already signed up! We'll keep you posted.", timestamp: Date.now() };
    }

    // Add new subscriber
    await subscribersCollection.add({
      email: email,
      subscribedAt: firebaseAdminInstance.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Thanks for signing up! We'll keep you posted.", timestamp: Date.now() };

  } catch (error) {
    console.error('Failed to save email to Firestore:', error);
    // Log the detailed error on the server, but return a generic message to the client.
    return { success: false, message: 'Something went wrong while signing up. Please try again later.', timestamp: Date.now() };
  }
}
