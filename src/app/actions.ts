
'use server';

import { auth, db } from '@/lib/firebase-admin';
import { sendConfirmationEmail } from './send-email';
import type admin from 'firebase-admin';

interface FormState {
  message: string;
  success: boolean;
  timestamp?: number;
  referralCode?: string;
}

export async function signUpForUpdatesAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const userType = formData.get('userType') as string;
  const referralCodeInput = formData.get('referralCode') as string;

  console.log('[actions.ts] Starting signup process for email:', email);

  // Basic validation on the server
  if (!name || !email || !password || !userType) {
    console.log('[actions.ts] Validation failed: Missing fields.');
    return { success: false, message: 'Please fill out all fields.', timestamp: Date.now() };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log('[actions.ts] Validation failed: Invalid email format.');
    return { success: false, message: 'Please enter a valid email address.', timestamp: Date.now() };
  }
  if (password.length < 6) {
    console.log('[actions.ts] Validation failed: Password too short.');
    return { success: false, message: 'Password must be at least 6 characters.', timestamp: Date.now() };
  }

  try {
    const usersCollection = db.collection('users');
    console.log(`[actions.ts] Using Firestore collection: '${usersCollection.path}'`);

    // Check if user already exists in Firebase Auth
    try {
      console.log(`[actions.ts] Checking for existing user in Auth: ${email}`);
      await auth.getUserByEmail(email);
      console.log(`[actions.ts] User with email ${email} already exists in Auth.`);
      return { success: false, message: "You're already signed up! We'll keep you posted.", timestamp: Date.now() };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`[actions.ts] User with email ${email} is new. Proceeding to create.`);
      } else {
        console.error(`[actions.ts] Error checking user in Auth: ${error.code}`, error);
        throw error; // Re-throw other unexpected auth errors
      }
    }

    // Handle referral code
    let referringUserDoc;
    let validReferralUsed = false;
    if (referralCodeInput) {
      const uppercaseReferralCode = referralCodeInput.toUpperCase();
      console.log(`[actions.ts] Looking for referring user with code: ${uppercaseReferralCode}`);
      const referringUserQuery = await usersCollection.where('referralCode', '==', uppercaseReferralCode).limit(1).get();
      if (!referringUserQuery.empty) {
        referringUserDoc = referringUserQuery.docs[0];
        validReferralUsed = true;
        console.log(`[actions.ts] Found referring user: ${referringUserDoc.id}`);
      } else {
        console.log(`[actionsts] No user found for referral code: ${uppercaseReferralCode}. Proceeding without referral.`);
      }
    }

    console.log('[actions.ts] Counting existing users in Firestore.');
    const usersSnapshot = await usersCollection.count().get();
    const userCount = usersSnapshot.data().count;
    console.log(`[actions.ts] Current user count: ${userCount}`);

    let rewardTier = 'standard';
    let successMessage = "Thanks for signing up! We'll keep you posted.";

    const earlyBirdTemplateIdStr = process.env.MAILJET_TEMPLATE_ID;
    const standardTemplateIdStr = process.env.MAILJET_STANDARD_TEMPLATE_ID;

    if (!earlyBirdTemplateIdStr || !standardTemplateIdStr) {
      console.error('[actions.ts] CRITICAL: Mailjet template ID environment variables are not set.');
    }

    const earlyBirdTemplateId = parseInt(earlyBirdTemplateIdStr || "0");
    const standardTemplateId = parseInt(standardTemplateIdStr || "0");
    let emailTemplateId: number;


    if (userCount < 100) {
      rewardTier = 'early_bird_1_month_elite';
      successMessage = "Congratulations! You're one of our first 100 users and get 1 month of the elite plan!";
      emailTemplateId = earlyBirdTemplateId;
    } else {
      successMessage = "You've successfully signed up! While the first 100 spots are taken, you can still get a free month of the elite plan by referring friends.";
      emailTemplateId = standardTemplateId;
    }
    console.log(`[actions.ts] User reward tier: ${rewardTier}. Email template ID: ${emailTemplateId}`);

    // Ensure the generated code is unique
    let referralCode;
    let isCodeUnique = false;
    while (!isCodeUnique) {
      referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingCodeQuery = await usersCollection.where('referralCode', '==', referralCode).limit(1).get();
      if (existingCodeQuery.empty) {
        isCodeUnique = true;
      }
    }
    console.log(`[actions.ts] Generated unique referral code: ${referralCode}`);

    console.log(`[actions.ts] Creating user ${email} in Firebase Auth.`);
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });
    console.log(`[actions.ts] Successfully created user in Auth with UID: ${userRecord.uid}`);

    console.log(`[actions.ts] Creating user profile in Firestore for UID: ${userRecord.uid}`);
    await usersCollection.doc(userRecord.uid).set({
      userId: userRecord.uid,
      username: name,
      email: email,
      createdAt: (await import('firebase-admin')).firestore.FieldValue.serverTimestamp(),
      rewardTier: rewardTier,
      userType: userType,
      referralCode: referralCode,
      referrals: validReferralUsed ? 1 : 0,
      referredBy: referringUserDoc?.id || null,
      eliteMonthsEarned: 0,
      plantsListed: 0,
      plantsTraded: 0,
      rewardPoints: 0,
      favoritePlants: [],
      followers: [],
      following: [],
    });
    console.log(`[actions.ts] Successfully created user profile for ${email}.`);

    if (referringUserDoc) {
      console.log(`[actions.ts] Updating referrer's count: ${referringUserDoc.id}`);
      const referringUserData = referringUserDoc.data();
      const newReferralCount = (referringUserData.referrals || 0) + 1;

      let updates: {[key: string]: any} = { referrals: newReferralCount };

      if (newReferralCount >= 10) {
        console.log(`[actions.ts] Referrer ${referringUserDoc.id} has reached 10 referrals!`);
        updates.eliteMonthsEarned = (referringUserData.eliteMonthsEarned || 0) + 1;
        updates.referrals = 0; // Reset for the next reward cycle
        console.log(`[actions.ts] Awarding 1 elite month to ${referringUserDoc.id} and resetting referral count.`);
      }
      await referringUserDoc.ref.update(updates);
      console.log(`[actions.ts] Successfully updated referrer.`);
    }

    // Send confirmation email in a try/catch block to prevent it from crashing the whole action
    try {
      console.log(`[actions.ts] Preparing to send confirmation email to ${email}.`);
      const emailResult = await sendConfirmationEmail({ to: email, name: name, templateId: emailTemplateId });
      if (!emailResult.success) {
        console.error(`[actions.ts] User account for ${email} created, but confirmation email failed to send. Reason: ${emailResult.message}`);
        // Don't block the user from seeing success, but add a note.
        successMessage += " (Note: There was an issue sending your confirmation email, but your account is safe!)";
      } else {
        console.log(`[actions.ts] Successfully sent confirmation email to ${email}.`);
      }
    } catch (emailError: any) {
      console.error(`[actions.ts] A critical, unhandled error occurred while trying to send an email to ${email}.`, emailError);
      successMessage += " (Note: Your account was created, but we hit a critical error sending your confirmation email.)";
    }

    console.log('[actions.ts] Signup process completed successfully.');
    return { success: true, message: successMessage, referralCode: referralCode, timestamp: Date.now() };

  } catch (error: any) {
    console.error('[actions.ts] A critical error occurred in signUpForUpdatesAction:', error);
    let publicMessage = 'Something went wrong on our end. Please try again later.';

    if (error.code?.startsWith('auth/')) {
      publicMessage = "There was a problem creating your account. Please double-check your details.";
    } else if (error.message.includes('firestore')) {
      publicMessage = "Could not save your user profile. Please try again.";
    }

    return { success: false, message: publicMessage, timestamp: Date.now() };
  }
}
