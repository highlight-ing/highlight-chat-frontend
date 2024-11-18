'use client'

import React from 'react'
import { ConversationProvider } from '@/context/ConversationContext'
import Highlight from '@highlight-ai/app-runtime'

import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { StoreProvider } from '@/components/providers/store-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !Highlight.isRunningInHighlight()) {
      window.location.href = 'https://highlight.ing/apps/highlightchat'
    }
  }, [])

  return (
    <StoreProvider>
      <ConversationProvider>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </ConversationProvider>
    </StoreProvider>
  )
}
