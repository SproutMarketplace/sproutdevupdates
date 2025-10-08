
'use server';

// This file is now only used for revalidating paths and other server-only functions
// that do NOT involve Firebase Admin SDK for user-facing actions.
// The primary user signup logic has been moved to a client-side implementation.

import { revalidatePath } from 'next/cache';

export async function revalidateHomePage() {
    revalidatePath('/');
}
