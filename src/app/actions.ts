
'use server';

import { admin } from '@/lib/firebase-admin';
import { sendConfirmationEmail } from './send-email';

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


  // Basic validation on the server
  if (!name || !email || !password || !userType) {
    return { success: false, message: 'Please fill out all fields.', timestamp: Date.now() };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: 'Please enter a valid email address.', timestamp: Date.now() };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.', timestamp: Date.now() };
  }

  if (!admin || !admin.firestore || !admin.auth) {
    const errorMessage = 'CRITICAL: Server is not connected to Firebase services. Please check server logs for Firebase Admin SDK initialization errors.';
    console.error(errorMessage);
    return { success: false, message: errorMessage, timestamp: Date.now() };
  }

  const db = admin.firestore();
  const auth = admin.auth();
  const usersCollection = db.collection('users');

  try {
    console.log(`[actions.ts] Checking for existing user: ${email}`);

    // Check if user already exists in Firebase Auth
    try {
      await auth.getUserByEmail(email);
      console.log(`[actions.ts] User with email ${email} already exists in Auth.`);
      return { success: false, message: "You're already signed up! We'll keep you posted.", timestamp: Date.now() };
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error; // Re-throw other auth errors
      }
      // If user is not found, we can proceed.
      console.log(`[actions.ts] User with email ${email} is new. Proceeding to create.`);
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
        console.log(`[actions.ts] No user found for referral code: ${uppercaseReferralCode}. Proceeding without referral.`);
      }
    }


    const usersSnapshot = await usersCollection.count().get();
    const userCount = usersSnapshot.data().count;

    let rewardTier = 'standard';
    let successMessage = "Thanks for signing up! We'll keep you posted.";
    let emailTemplateId: number;

    const earlyBirdTemplateId = parseInt(process.env.MAILJET_TEMPLATE_ID || "0");
    const standardTemplateId = parseInt(process.env.MAILJET_STANDARD_TEMPLATE_ID || "0");

    if (userCount < 100) {
      rewardTier = 'early_bird_1_month_elite';
      successMessage = "Congratulations! You're one of our first 100 users and get 1 month of the elite plan!";
      emailTemplateId = earlyBirdTemplateId;
    } else {
      successMessage = "You've successfully signed up! While the first 100 spots are taken, you can still get a free month of the elite plan by referring friends.";
      emailTemplateId = standardTemplateId;
    }

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

    console.log(`[actions.ts] Creating user profile in Firestore collection '${usersCollection.path}'.`);
    await usersCollection.doc(userRecord.uid).set({
      userId: userRecord.uid,
      username: name,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      rewardTier: rewardTier,
      userType: userType,
      referralCode: referralCode,
      referrals: validReferralUsed ? 1 : 0, // New user gets +1 referral if they used a code
      referredBy: referringUserDoc?.id || null, // Track who referred this user
      eliteMonthsEarned: 0,
      plantsListed: 0,
      plantsTraded: 0,
      rewardPoints: 0,
      favoritePlants: [],
      followers: [],
      following: [],
    });
    console.log(`[actions.ts] Successfully created user profile for ${email}.`);

    // Increment referrer's count and check for rewards
    if (referringUserDoc) {
      const referringUserData = referringUserDoc.data();
      const newReferralCount = (referringUserData.referrals || 0) + 1;

      let updates: {[key: string]: any} = { referrals: newReferralCount };

      if (newReferralCount >= 10) {
        console.log(`[actions.ts] User ${referringUserDoc.id} has reached 10 referrals!`);
        updates.eliteMonthsEarned = (referringUserData.eliteMonthsEarned || 0) + 1;
        updates.referrals = 0; // Reset for the next reward cycle
        console.log(`[actions.ts] Awarding 1 elite month to ${referringUserDoc.id} and resetting their referral count.`);
      }
      await referringUserDoc.ref.update(updates);
    }

    // Send confirmation email
    const emailResult = await sendConfirmationEmail({ to: email, name: name, templateId: emailTemplateId });
    if (!emailResult.success) {
      // Log the error but don't block the user from seeing the success message.
      // The account has been created, which is the most important part.
      console.error(`[actions.ts] User account for ${email} created, but confirmation email failed to send. Reason: ${emailResult.message}`);
    } else {
      console.log(`[actions.ts] Successfully sent confirmation email to ${email}.`);
    }

    return { success: true, message: successMessage, referralCode: referralCode, timestamp: Date.now() };

  } catch (error: any) {
    console.error('[actions.ts] Detailed error in signUpForUpdatesAction:', error);
    let publicMessage = 'Something went wrong while signing up. Please try again later.';
    if(error.code === 'auth/email-already-exists') {
      publicMessage = "This email is already signed up!";
    }
    return { success: false, message: publicMessage, timestamp: Date.now() };
  }
}
