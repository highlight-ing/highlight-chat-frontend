'use client'

import React from 'react'
import { StoreProvider } from '@/providers/store-provider'
import App from '@/components/App'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <App>{children}</App>
    </StoreProvider>
  )
}
