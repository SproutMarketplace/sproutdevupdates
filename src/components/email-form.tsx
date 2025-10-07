
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, PartyPopper, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseClient } from '@/lib/firebase-client';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    fetchSignInMethodsForEmail
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDocs,
    collection,
    query,
    where,
    limit,
    getCountFromServer,
    serverTimestamp,
    runTransaction
} from 'firebase/firestore';

// This is a new client-side action that will handle the signup.
// import { sendConfirmationEmail } from '@/app/send-email';

const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
    userType: z.enum(["buyer", "seller"], { required_error: "Please select an option." }),
    referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface FormState {
    message: string;
    success: boolean;
    timestamp?: number;
    referralCode?: string;
}

// Client-side signup logic
async function signUpClientSide(values: SignupFormValues): Promise<FormState> {
    const { name, email, password, userType, referralCode: referralCodeInput } = values;
    const { auth, db } = getFirebaseClient();

    try {
        console.log('[email-form.tsx] Starting client-side signup process for:', email);

        // 1. Check if user already exists
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
            console.log(`[email-form.tsx] User with email ${email} already exists.`);
            return { success: false, message: "You're already signed up! We'll keep you posted.", timestamp: Date.now() };
        }

        const usersCollection = collection(db, 'users');

        // Handle referral code transactionally
        let referredByUID: string | null = null;
        if (referralCodeInput) {
            const uppercaseReferralCode = referralCodeInput.toUpperCase();
            console.log(`[email-form.tsx] Looking for referring user with code: ${uppercaseReferralCode}`);
            const q = query(usersCollection, where('referralCode', '==', uppercaseReferralCode), limit(1));
            const referringUserQuery = await getDocs(q);
            if (!referringUserQuery.empty) {
                const referringUserDoc = referringUserQuery.docs[0];
                referredByUID = referringUserDoc.id;
                console.log(`[email-form.tsx] Found referring user: ${referredByUID}`);
            } else {
                console.log(`[email-form.tsx] No user found for referral code: ${uppercaseReferralCode}.`);
            }
        }

        // 2. Get user count
        const usersSnapshot = await getCountFromServer(usersCollection);
        const userCount = usersSnapshot.data().count;
        console.log(`[email-form.tsx] Current user count: ${userCount}`);

        let rewardTier = 'standard';
        let successMessage = "Thanks for signing up! We'll keep you posted.";

        if (userCount < 100) {
            rewardTier = 'early_bird_1_month_elite';
            successMessage = "Congratulations! You're one of our first 100 users and get 1 month of the elite plan!";
        } else {
            successMessage = "You've successfully signed up! While the first 100 spots are taken, you can still get a free month of the elite plan by referring friends.";
        }

        // 3. Create user in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        console.log(`[email-form.tsx] Successfully created user in Auth with UID: ${user.uid}`);

        // 4. Generate a unique referral code for the new user
        let newReferralCode: string = '';
        let isCodeUnique = false;
        while (!isCodeUnique) {
            newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const q = query(collection(db, 'users'), where('referralCode', '==', newReferralCode), limit(1));
            const existingCodeQuery = await getDocs(q);
            if (existingCodeQuery.empty) {
                isCodeUnique = true;
            }
        }
        console.log(`[email-form.tsx] Generated unique referral code: ${newReferralCode}`);

        // 5. Create user document in Firestore and update referrer if applicable
        await runTransaction(db, async (transaction) => {
            // Set the new user's document
            const newUserDocRef = doc(db, 'users', user.uid);
            transaction.set(newUserDocRef, {
                userId: user.uid,
                username: name,
                email: email,
                createdAt: serverTimestamp(),
                rewardTier: rewardTier,
                userType: userType,
                referralCode: newReferralCode,
                referrals: 0,
                referredBy: referredByUID,
                eliteMonthsEarned: 0,
                plantsListed: 0,
                plantsTraded: 0,
                rewardPoints: 0,
                favoritePlants: [],
                followers: [],
                following: [],
            });

            // If a valid referral was used, update the referring user's document
            if (referredByUID) {
                const referringUserDocRef = doc(db, 'users', referredByUID);
                const referringUserDoc = await transaction.get(referringUserDocRef);
                if (referringUserDoc.exists()) {
                    const referringUserData = referringUserDoc.data();
                    const newReferralCount = (referringUserData.referrals || 0) + 1;

                    let updates: {[key: string]: any} = { referrals: newReferralCount };

                    if (newReferralCount >= 10) {
                        updates.eliteMonthsEarned = (referringUserData.eliteMonthsEarned || 0) + 1;
                        updates.referrals = 0; // Reset for the next reward cycle
                    }
                    transaction.update(referringUserDocRef, updates);
                    console.log(`[email-form.tsx] Transactionally updated referrer: ${referredByUID}`);
                }
            }
        });

        console.log(`[email-form.tsx] Successfully created user profile for ${email}.`);

        // 6. Send confirmation email - REMOVED TO PREVENT SERVER ACTION
        // try {
        //     console.log(`[email-form.tsx] Preparing to send confirmation email to ${email}.`);
        //     await sendConfirmationEmail({ to: email, name: name, templateId: emailTemplateId });
        //     console.log(`[email-form.tsx] Successfully requested confirmation email for ${email}.`);
        // } catch (emailError: any) {
        //     console.error(`[email-form.tsx] Email sending failed.`, emailError);
        //     successMessage += " (Note: There was an issue sending your confirmation email, but your account is safe!)";
        // }

        return { success: true, message: successMessage, referralCode: newReferralCode, timestamp: Date.now() };

    } catch (error: any) {
        console.error('[email-form.tsx] A critical error occurred in client-side signup:', error);
        let publicMessage = 'Something went wrong on our end. Please try again later.';
        if (error.code?.startsWith('auth/')) {
            publicMessage = "There was a problem creating your account. Please double-check your details.";
        }
        return { success: false, message: publicMessage, timestamp: Date.now() };
    }
}

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow duration-300"
            aria-live="polite"
        >
            {isPending ? (
                <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-primary-foreground rounded-full"></span>
                    Securing Your Spot...
                </>
            ) : (
                <>
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Secure My Spot
                </>
            )}
        </Button>
    );
}

function ReferralDisplay({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast({ title: "Referral code copied!" });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-6 w-full text-center p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/10">
            <h3 className="font-semibold text-lg text-primary">Refer Friends, Get Rewards!</h3>
            <p className="text-muted-foreground mt-1">Share this code with your friends. For every 10 users who sign up with your code, you'll get another month of the elite plan for free!</p>
            <div className="mt-3 flex justify-center items-center gap-2">
            <span className="font-mono text-xl tracking-widest text-primary bg-card px-4 py-2 rounded-md border border-border">
                {code}
            </span>
                <Button onClick={copyToClipboard} size="icon" variant="ghost" className="text-primary hover:bg-primary/20">
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    <span className="sr-only">Copy referral code</span>
                </Button>
            </div>
        </div>
    );
}

export function EmailForm() {
    const [state, setState] = useState<FormState>({ success: false, message: '' });
    const [isPending, startTransition] = useTransition();

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            referralCode: "",
        },
    });

    useEffect(() => {
        const storedStateRaw = localStorage.getItem('sprout_signup_state');
        if (storedStateRaw) {
            try {
                const storedState = JSON.parse(storedStateRaw);
                if(storedState.success && storedState.referralCode) {
                    setState(storedState);
                }
            } catch(e) {
                console.error("Could not parse stored signup state", e);
            }
        }
    }, []);

    const onSubmit = (data: SignupFormValues) => {
        startTransition(async () => {
            const result = await signUpClientSide(data);
            setState(result);
        });
    };

    useEffect(() => {
        if (state.timestamp && !state.success) {
            form.setError("root.serverError", {
                type: "manual",
                message: state.message,
            });
        }
    }, [state, form]);

    useEffect(() => {
        if (state.success) {
            form.reset();
            localStorage.setItem('sprout_signup_state', JSON.stringify(state));
        }
    }, [state, form]);

    const handleReset = () => {
        localStorage.removeItem('sprout_signup_state');
        setState({ success: false, message: '' });
        form.reset();
    };

    if (state.success) {
        const isEarlyBird = state.message.toLowerCase().includes('congratulations');

        return (
            <div className="mt-6 p-6 sm:p-8 bg-secondary/20 rounded-xl shadow-lg flex flex-col items-center text-center border border-primary/30" role="alert">
                {isEarlyBird ? (
                    <PartyPopper className="w-16 h-16 sm:w-20 sm:h-20 text-primary mb-4" />
                ) : (
                    <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-primary mb-4" />
                )}
                <h2 className="text-2xl sm:text-3xl font-semibold text-primary font-headline">{state.message}</h2>
                <p className="text-muted-foreground mt-3 text-base sm:text-lg">
                    Your account is created and your spot is secured! We'll send you an email the moment we go live.
                </p>
                {state.referralCode && <ReferralDisplay code={state.referralCode} />}
                <Button onClick={handleReset} variant="outline" className="mt-6">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Another Sign-up
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-left block">Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-left block">Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-left block">Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-left block">Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-left block">How will you primarily use Sprout?</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="buyer" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            I'm primarily a buyer
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="seller" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            I'm primarily a seller
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-left block">Referral Code (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="ABC123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-4">
                    <SubmitButton isPending={isPending} />
                </div>

                {form.formState.errors.root?.serverError && (
                    <div className="text-destructive text-sm mt-2 text-center" role="alert">
                        {form.formState.errors.root.serverError.message}
                    </div>
                )}
            </form>
        </Form>
    );
}

