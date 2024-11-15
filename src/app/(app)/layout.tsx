'use client'

import React from 'react'
import { ConversationProvider } from '@/context/ConversationContext'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import App from '@/components/App'
import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { StoreProvider } from '@/components/providers/store-provider'

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
