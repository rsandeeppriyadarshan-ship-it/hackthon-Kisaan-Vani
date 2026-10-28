import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Krushak Bani Odisha runtime error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border-2 border-emerald-700 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 font-black flex items-center justify-center mx-auto text-xl">
              !
            </div>
            <h1 className="text-lg font-black text-emerald-950">
              Krushak Bani Odisha — କୃଷକ ବାଣୀ ଓଡ଼ିଶା
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              The screen encountered a temporary loading issue ({this.state.errorMessage}). Your local farmer data on this phone is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Google Maps Platform Demo Key Quota Defense (Tier 1)
declare global {
  interface Window {
    gm_authFailure?: () => void;
    __gmpQuotaExceeded?: boolean;
  }
}

if (typeof window !== 'undefined') {
  const triggerQuotaBanner = () => {
    if (window.__gmpQuotaExceeded) return;
    window.__gmpQuotaExceeded = true;
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };

  window.gm_authFailure = triggerQuotaBanner;

  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    origConsoleError.apply(console, args);
    if (
      args.some(
        (a) =>
          typeof a === 'string' &&
          (a.includes('OverQuotaMapError') ||
            a.includes('RESOURCE_EXHAUSTED') ||
            a.includes('You have exceeded your request quota'))
      )
    ) {
      triggerQuotaBanner();
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);

// Register PWA service worker for full offline and home screen installability
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('Krushak Bani Odisha: App update available');
        },
        onOfflineReady() {
          console.log('Krushak Bani Odisha: Ready for offline use');
        },
      });
    })
    .catch((err) => {
      console.warn('PWA service worker registration skipped:', err);
    });
}
