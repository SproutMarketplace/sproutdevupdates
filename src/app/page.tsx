
import Image from 'next/image';
import { EmailForm } from '@/components/email-form';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <main className="flex-grow flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8">
        <Image
          src="/sprout.png"
          alt="Sprout Logo"
          width={720}
          height={192}
          className="h-48 w-auto mt-4"
          priority
          data-ai-hint="company logo"
        />
        <div className="relative z-10 -mt-16 max-w-xl w-full space-y-8 text-center bg-card p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl border border-border">
          <div>
            <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary tracking-tight">
              The Marketplace is About to Blossom.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">
              Be an early bird! The first 100 users get <strong>3 months of no fees</strong>, and the next 150 get 1 month free. Sign up for launch updates and secure your spot!
            </p>
          </div>
          <EmailForm />
        </div>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sprout Marketplace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
