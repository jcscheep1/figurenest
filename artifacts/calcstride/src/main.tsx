import { useEffect, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { monetizationConfig } from '@/lib/monetization-config';

import './index.css';
import '@/styles/file-tool-buttons.css';

const PRELOAD_RECOVERY_KEY = 'figurenest-preload-recovery-at';

if (import.meta.env.PROD) {
  window.addEventListener('vite:preloadError', (event) => {
    const lastRecovery = Number(sessionStorage.getItem(PRELOAD_RECOVERY_KEY) || 0);
    const now = Date.now();
    if (now - lastRecovery < 30_000) return;

    event.preventDefault();
    sessionStorage.setItem(PRELOAD_RECOVERY_KEY, String(now));

    const clearFigureNestCaches = 'caches' in window
      ? caches.keys().then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('figurenest-')).map((key) => caches.delete(key)),
      ))
      : Promise.resolve([]);

    const refreshServiceWorker = 'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistration().then((registration) => registration?.update()).catch(() => undefined)
      : Promise.resolve(undefined);

    void Promise.allSettled([clearFigureNestCaches, refreshServiceWorker])
      .finally(() => window.location.reload());
  });
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL(`${import.meta.env.BASE_URL}service-worker.js`, window.location.origin);
    void navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: import.meta.env.BASE_URL,
      updateViaCache: 'none',
    })
      .then((registration) => registration.update())
      .catch((error) => console.error('FigureNest service worker registration failed', error));
  });
}

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (import.meta.env.PROD && monetizationConfig.verificationMetaName && monetizationConfig.verificationCode) {
  const meta = document.createElement('meta');
  meta.name = monetizationConfig.verificationMetaName;
  meta.content = monetizationConfig.verificationCode;
  document.head.appendChild(meta);
}

// PdfSignEditPage derives a device class from pointer media during render. SSR cannot
// know that browser-only signal, so make the first client render match the desktop
// SSR result. A post-hydration effect restores the browser's real media query and
// forces a normal React rerender, preserving mobile limits without racing hydration.
const isPdfSignEditRoute = window.location.pathname.replace(/\/+$/, '') === '/file-tools/pdf-sign-edit';
const browserMatchMedia = window.matchMedia.bind(window);

if (isPdfSignEditRoute) {
  window.matchMedia = ((query: string) => {
    const result = browserMatchMedia(query);
    if (query !== '(pointer: coarse)') return result;

    return {
      media: result.media,
      matches: false,
      onchange: result.onchange,
      addListener: result.addListener.bind(result),
      removeListener: result.removeListener.bind(result),
      addEventListener: result.addEventListener.bind(result),
      removeEventListener: result.removeEventListener.bind(result),
      dispatchEvent: result.dispatchEvent.bind(result),
    } as MediaQueryList;
  }) as typeof window.matchMedia;
}

function HydrationSafeApp() {
  const [, setMediaRestored] = useState(false);

  useEffect(() => {
    if (!isPdfSignEditRoute) return undefined;
    window.matchMedia = browserMatchMedia;
    setMediaRestored(true);
    return () => {
      window.matchMedia = browserMatchMedia;
    };
  }, []);

  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

hydrateRoot(document.getElementById('root')!,
  <HydrationSafeApp />,
  {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
  },
);
