'use client';

import { NoSSR } from './no-ssr';
import { EmailForm } from './email-form';

export function EmailFormWrapper() {
  return (
    <NoSSR fallback={
      <div className="mt-8 space-y-4" suppressHydrationWarning>
        <div className="animate-pulse bg-muted h-12 rounded" suppressHydrationWarning></div>
        <div className="animate-pulse bg-muted h-12 rounded" suppressHydrationWarning></div>
        <div className="animate-pulse bg-muted h-12 rounded" suppressHydrationWarning></div>
        <div className="animate-pulse bg-muted h-12 rounded" suppressHydrationWarning></div>
        <div className="animate-pulse bg-muted h-12 rounded" suppressHydrationWarning></div>
        <div className="animate-pulse bg-muted h-12 rounded" suppressHydrationWarning></div>
      </div>
    }>
      <div suppressHydrationWarning>
        <EmailForm />
      </div>
    </NoSSR>
  );
}
