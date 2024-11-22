'use client'

import React from 'react'
import { ConversationProvider } from '@/context/ConversationContext'
import Highlight from '@highlight-ai/app-runtime'

import { JotaiProvider } from '@/components/providers/jotai-provider'
import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { StoreProvider } from '@/components/providers/store-provider'

import { App } from './app'

export default function Layout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !Highlight.isRunningInHighlight()) {
      window.location.href = 'https://highlight.ing/apps/highlightchat'
    }
  }, [])

  return (
    <StoreProvider>
      <ConversationProvider>
        <ReactQueryProvider>
          <JotaiProvider>
            <App>{children}</App>
          </JotaiProvider>
        </ReactQueryProvider>
      </ConversationProvider>
    </StoreProvider>
  )
}
