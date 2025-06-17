import { SproutLogo } from '@/components/sprout-logo';
import { EmailForm } from '@/components/email-form';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex justify-center sm:justify-start">
          <SproutLogo className="h-10 sm:h-12 w-auto text-primary" />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-8 text-center bg-card p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl border border-border">
          <div>
            <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary tracking-tight">
              Stay Updated with Sprout
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">
              Be the first to know about new features, releases, and special offers. Sign up for our development updates.
            </p>
          </div>
          <EmailForm />
        </div>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sprout Updates. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
