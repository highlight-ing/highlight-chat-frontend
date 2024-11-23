'use client'

import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { TooltipProvider } from '@/components/ui/tooltip'
import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { StoreProvider } from '@/components/providers/store-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ReactQueryProvider>
        <TooltipProvider>{children}</TooltipProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
      </ReactQueryProvider>
    </StoreProvider>
  )
}
