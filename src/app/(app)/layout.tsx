'use client'

import React from 'react'
import { ConversationProvider } from '@/context/ConversationContext'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { StoreProvider } from '@/components/providers/store-provider'

import { App } from '@/features/app/app'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ReactQueryProvider>
        <ConversationProvider>
          <TooltipProvider>
            <App>
              {children}
              <Toaster position="bottom-center" />
            </App>
            <ReactQueryDevtools buttonPosition="bottom-right" initialIsOpen={false} />
          </TooltipProvider>
        </ConversationProvider>
      </ReactQueryProvider>
    </StoreProvider>
  )
}
