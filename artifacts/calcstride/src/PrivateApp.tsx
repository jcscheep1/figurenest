import { type ReactNode, useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Route, Switch, useLocation, useRouter } from 'wouter';
import { SignInPage } from '@/pages/auth/SignInPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { ControlCenterPage } from '@/pages/control-center/ControlCenterPage';
import './private.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const clerkPubKey = publishableKeyFromHost(
  typeof window !== 'undefined' ? window.location.hostname : 'localhost',
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function ClerkQueryClientCacheInvalidator() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      queryClient.clear();
    }
  }, [userId, queryClient]);

  return null;
}

// Custom navigation keeps Clerk paths compatible with Wouter's configured base.
function ClerkWouterProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const router = useRouter();

  const stripBase = (path: string) => {
    const base = router.base;
    if (base && path.startsWith(base)) {
      return path.slice(base.length) || '/';
    }
    return path;
  };

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      signInUrl={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sign-in`}
      signUpUrl={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sign-up`}
      afterSignOutUrl={import.meta.env.BASE_URL}
      appearance={{
        elements: {
          rootBox: 'font-sans',
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
          footerActionLink: 'text-primary hover:text-primary/90 font-medium',
        },
      }}
    >
      <ClerkQueryClientCacheInvalidator />
      {children}
    </ClerkProvider>
  );
}

export default function PrivateApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkWouterProvider>
        <Switch>
          <Route path="/sign-in/*?">
            <SignInPage />
          </Route>
          <Route path="/sign-up/*?">
            <SignUpPage />
          </Route>
          <Route path="/control-center" component={ControlCenterPage} />
          <Route path="/control-center/:section" component={ControlCenterPage} />
        </Switch>
      </ClerkWouterProvider>
    </QueryClientProvider>
  );
}