import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Turso } from '@/turso';

export const queryClient = new QueryClient();

declare global {
  var turso: Turso
}

globalThis.turso = new Turso("http://localhost:8008", process.env.NEXT_PUBLIC_TURSO_TOKEN!);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
