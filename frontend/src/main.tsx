import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as Sentry from "@sentry/react";
import { ClerkProvider } from '@clerk/react'
import { SentryUserSync } from './components/SentryUserSync.tsx';
import { SentryErrorFallback } from './components/SentryErrorFallback.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import ProductDetails from './pages/ProductDetails.tsx';
import Cart from './pages/Cart.tsx';
import CheckoutReturn from './pages/CheckoutReturn.tsx';
import Orders from './pages/Orders.tsx';
import AuthLayout from './components/AuthLayout.tsx';
import { SentryDemoPage } from './pages/SentryDemoPage.tsx';
import OrderDetails from './pages/OrderDetails.tsx';
import OrderSummaryPage from './pages/OrderSummaryPage.tsx';
import OrderChat from './pages/OrderChat.tsx';
import OrderVideoCall from './pages/OrderVideoCall.tsx';
import AdminProducts from './pages/AdminProducts.tsx';

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

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "/product/:slug",
        element: <ProductDetails />
      },
      {
        path: "/cart",
        element: <Cart />
      },
      {
        path: "/checkout/return",
        element: <CheckoutReturn />
      },
      {
        path: "/orders",
        element: (
          <AuthLayout authentication>
            <Orders />
          </AuthLayout>
        )
      },
      {
        path: "/order/:id",
        element: (
          <AuthLayout authentication>
            <OrderDetails />
          </AuthLayout>
        ),
        children: [
          {
            index: true,
            element: <OrderSummaryPage />
          },
          {
            path: "/order/:id/chat",
            element: <OrderChat />
          }
        ],
      },
      {
        path: "/order/:id/call",
        element: (
          <AuthLayout authentication>
            <OrderVideoCall />
          </AuthLayout>
        ),
      },
      {
        path: "/admin",
        element: (
          <AuthLayout authentication>
            <AdminProducts />
          </AuthLayout>
        )
      },
      {
        path: "/sentry-demo",
        element: <SentryDemoPage />
      }
    ]
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <SentryUserSync />
      <QueryClientProvider client={queryClient}>
        <Sentry.ErrorBoundary fallback={<SentryErrorFallback />}>
          <Provider store={store}>
            <RouterProvider router={router} />
          </Provider>
        </Sentry.ErrorBoundary>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
)
