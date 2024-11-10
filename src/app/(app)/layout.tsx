'use client'

import React from 'react'
import { StoreProvider } from '@/providers/store-provider'
import App from '@/components/App'
import { ConversationProvider } from '@/context/ConversationContext'
import { ReactQueryProvider } from '@/providers/react-query-provider'
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
