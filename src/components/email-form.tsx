
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUpForUpdatesAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, PartyPopper, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

    // Check localStorage on initial render
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
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            const value = data[key as keyof SignupFormValues];
            if (value !== undefined) {
                formData.append(key, value);
            }
        });

        startTransition(async () => {
            const result = await signUpForUpdatesAction({
                message: '',
                success: false
            }, formData);

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
        // If signup was successful, store the state in localStorage
        if (state.success) {
            form.reset();
            localStorage.setItem('sprout_signup_state', JSON.stringify(state));
        }
    }, [state.success, form, state]);

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
                    Your account is created! We've sent a confirmation to your email. We'll send you another message the moment we go live.
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
                {!state.success && state.message && (
                    <p className="text-destructive text-sm mt-2 text-center" role="alert">
                        {state.message}
                    </p>
                )}
            </form>
        </Form>
    );
}
