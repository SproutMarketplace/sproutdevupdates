'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { signUpForUpdatesAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail } from 'lucide-react';

const initialState = {
  message: '',
  success: false,
  timestamp: Date.now(),
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow duration-300"
      aria-live="polite"
    >
      {pending ? (
        <>
          <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-primary-foreground rounded-full"></span>
          Signing Up...
        </>
      ) : (
        <>
          <Mail className="mr-2 h-5 w-5" />
          Sign Up
        </>
      )}
    </Button>
  );
}

export function EmailForm() {
  const [state, formAction] = useActionState(signUpForUpdatesAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset(); // Clear form on success
    }
  }, [state.success, state.timestamp]); // Depend on timestamp to re-run effect on new submissions

  if (state.success) {
    return (
      <div className="mt-6 p-6 sm:p-8 bg-secondary/20 rounded-xl shadow-lg flex flex-col items-center text-center border border-primary/30" role="alert">
        <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-primary mb-4" />
        <h2 className="text-2xl sm:text-3xl font-semibold text-primary font-headline">{state.message}</h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">
          You're all set to receive the latest news from Sprout! Keep an eye on your inbox.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} ref={formRef} className="mt-8 space-y-6">
      <div className="relative flex flex-col sm:flex-row gap-3 items-start">
        <div className="relative w-full">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="your@email.com"
            required
            className="flex-grow pl-10 pr-3 py-3 text-base border-input focus:border-primary focus:ring-primary rounded-md shadow-sm"
            aria-label="Email address for updates"
            aria-describedby={!state.success && state.message ? "email-error" : undefined}
          />
        </div>
        <SubmitButton />
      </div>
      {!state.success && state.message && (
        <p id="email-error" className="text-destructive text-sm mt-2 text-left sm:text-center" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
