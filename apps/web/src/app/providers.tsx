'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { useMe } from '@/hooks/use-auth';

// ─── Auth initializer ─────────────────────────────────────────────
function AuthInitializer() {
  useMe();
  return null;
}

// ─── QueryClient factory ──────────────────────────────────────────
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error: unknown) => {
          const status = (error as { response?: { status?: number } })
            ?.response?.status;
          if (status === 401 || status === 403 || status === 404) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error: unknown) => {
        const status = (error as { response?: { status?: number } })
          ?.response?.status;
        if (status === 401) {
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        console.error('[Mutation Error]', error);
      },
    }),
  });
}

// ─── Providers ────────────────────────────────────────────────────
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
