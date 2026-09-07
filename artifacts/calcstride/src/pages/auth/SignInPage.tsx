import { SignIn } from '@clerk/react';
import { Link } from 'wouter';
import { FigureNestLogo } from '@/components/FigureNestLogo';

export function SignInPage() {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(31,116,232,0.08),transparent_50%)]" />
      <header className="absolute top-0 w-full p-6 z-10 flex justify-between items-center">
        <Link href="/" className="brand-mark">
          <FigureNestLogo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif font-bold text-foreground">Sign In</h1>
            <p className="text-muted-foreground">Access your FigureNest operations console</p>
          </div>
          <SignIn 
            path={`${baseUrl}/sign-in`}
            routing="path" 
            signUpUrl={`${baseUrl}/sign-up`}
            forceRedirectUrl={`${baseUrl}/control-center`}
            appearance={{
              elements: {
                rootBox: "w-full mx-auto",
                card: "bg-card shadow-xl border border-border rounded-xl",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
