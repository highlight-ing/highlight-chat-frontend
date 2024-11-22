'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export function ReactQueryProvider(props: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
}
