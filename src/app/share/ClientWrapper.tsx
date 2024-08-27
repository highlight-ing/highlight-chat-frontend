'use client'

import React from 'react'
import { StoreProvider } from '@/providers/store-provider'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>
}
