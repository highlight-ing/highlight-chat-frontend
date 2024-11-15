'use client'

import React from 'react'
import App from '@/components/App'
import { StoreProvider } from '@/components/providers/store-provider'
import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { ConversationProvider } from '@/context/ConversationContext'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ConversationProvider>
        <ReactQueryProvider>
          <App>{children}</App>
          <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
        </ReactQueryProvider>
      </ConversationProvider>
    </StoreProvider>
  )
}
