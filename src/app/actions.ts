
'use server';

import { db, admin as firebaseAdminInstance } from '@/lib/firebase-admin';
import { sendConfirmationEmail } from '@/services/email-service';

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
    if (!db || !firebaseAdminInstance || !firebaseAdminInstance.firestore || !firebaseAdminInstance.firestore.FieldValue) {
        console.error('Firestore (db) or Firebase Admin instance/FieldValue is not available. SDK might not have initialized correctly.');
        return { success: false, message: 'Server configuration error. Please try again later.', timestamp: Date.now() };
    }

    const subscribersCollection = db.collection('subscribers');
    
    const existingSubscriberQuery = await subscribersCollection.where('email', '==', email).limit(1).get();
    if (!existingSubscriberQuery.empty) {
      // Email already exists
      // Optionally, send a "you're already signed up" email or handle differently.
      // For now, we just show the message.
      return { success: true, message: "You're already signed up! We'll keep you posted.", timestamp: Date.now() };
    }

    // Add new subscriber
    await subscribersCollection.add({
      email: email,
      subscribedAt: firebaseAdminInstance.firestore.FieldValue.serverTimestamp(),
    });

    // Attempt to send confirmation email
    const emailResult = await sendConfirmationEmail(email);
    if (emailResult.success) {
      console.log(`Confirmation email successfully sent to ${email}.`);
    } else {
      // Log the failure but don't change the overall success status of the sign-up.
      // The primary action (DB save) was successful.
      console.warn(`Failed to send confirmation email to ${email}: ${emailResult.message}`);
    }

    return { success: true, message: "Thanks for signing up! We'll keep you posted.", timestamp: Date.now() };

  } catch (error) {
    console.error('Error during sign-up process (Firestore or Email):', error);
    // Check if it's a Firestore error specifically or general error
    let errorMessage = 'Something went wrong while signing up. Please try again later.';
    if (error instanceof Error && (error.message.includes('firestore') || error.message.includes('Firebase'))) {
        errorMessage = 'Could not connect to the database. Please try again later.';
    }
    return { success: false, message: errorMessage, timestamp: Date.now() };
  }
}
