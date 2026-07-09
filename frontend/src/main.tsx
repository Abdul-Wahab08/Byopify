import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as Sentry from "@sentry/react";
import { ClerkProvider } from '@clerk/react'
import { SentryUserSync } from './components/SentryUserSync.tsx';
import { SentryErrorFallback } from './components/SentryErrorFallback.tsx';

Sentry.init({
  dsn: import.meta.env.VITE_PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
})

const publishableKey = import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryUserSync />
    <ClerkProvider publishableKey={publishableKey}>
      <Sentry.ErrorBoundary fallback={<SentryErrorFallback />}>
      <App />
      </Sentry.ErrorBoundary>
    </ClerkProvider>
  </StrictMode>,
)
