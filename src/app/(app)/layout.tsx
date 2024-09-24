'use client'

import React from 'react'
import { StoreProvider } from '@/providers/store-provider'
import App from '@/components/App'
import { ConversationProvider } from '@/context/ConversationContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ConversationProvider>
        <App>{children}</App>
      </ConversationProvider>
    </StoreProvider>
  )
}
