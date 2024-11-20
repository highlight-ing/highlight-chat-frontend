'use client'

import React from 'react'

import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { StoreProvider } from '@/components/providers/store-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </StoreProvider>
  )
}
