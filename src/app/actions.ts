'use server';

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

  // Simulate saving the email
  console.log('Email submitted for updates:', email);

  // Simulate a delay to mimic network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real application, you would save the email to a database or mailing list here.
  // For example:
  // try {
  //   await db.collection('subscribers').add({ email, subscribedAt: new Date() });
  // } catch (error) {
  //   console.error('Failed to save email:', error);
  //   return { success: false, message: 'Something went wrong. Please try again later.', timestamp: Date.now() };
  // }

  return { success: true, message: "Thanks for signing up! We'll keep you posted.", timestamp: Date.now() };
}
