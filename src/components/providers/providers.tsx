"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import GoogleAuthProvider from "@/providers/GoogleAuthProvider"
import StoreProviders from "@/providers/StoreProvider"

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleAuthProvider>
      <QueryClientProvider client={queryClient}>
        <StoreProviders>
          {children}
        </StoreProviders>
      </QueryClientProvider>
    </GoogleAuthProvider>
  )
}
