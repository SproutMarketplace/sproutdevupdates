
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
    
    // Check for existing subscriber first
    const existingSubscriberQuery = await subscribersCollection.where('email', '==', email).limit(1).get();
    if (!existingSubscriberQuery.empty) {
      return { success: true, message: "You're already signed up! We'll keep you posted.", timestamp: Date.now() };
    }

    // Determine reward tier by getting the current number of subscribers
    // This should be in a transaction to be robust, but for a pre-launch this is sufficient.
    const subscribersSnapshot = await subscribersCollection.get();
    const subscriberCount = subscribersSnapshot.size;

    let rewardTier = 'standard';
    if (subscriberCount < 100) {
      rewardTier = 'early_bird_3_months'; // First 100 users
    } else if (subscriberCount < 250) {
      rewardTier = 'early_bird_1_month'; // Next 150 users
    }

    // Add new subscriber with their reward tier
    await subscribersCollection.add({
      email: email,
      subscribedAt: firebaseAdminInstance.firestore.FieldValue.serverTimestamp(),
      rewardTier: rewardTier,
    });

    // Attempt to send confirmation email
    const emailResult = await sendConfirmationEmail(email);
    if (emailResult.success) {
      console.log(`Confirmation email successfully sent to ${email}.`);
    } else {
      console.warn(`Failed to send confirmation email to ${email}: ${emailResult.message}`);
    }

    return { success: true, message: "Thanks for signing up! We'll keep you posted.", timestamp: Date.now() };

  } catch (error) {
    console.error('Error during sign-up process (Firestore or Email):', error);
    let errorMessage = 'Something went wrong while signing up. Please try again later.';
    if (error instanceof Error && (error.message.includes('firestore') || error.message.includes('Firebase'))) {
        errorMessage = 'Could not connect to the database. Please try again later.';
    }
    return { success: false, message: errorMessage, timestamp: Date.now() };
  }
}
