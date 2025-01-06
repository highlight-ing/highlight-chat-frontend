import React from 'react'

import { Skeleton } from '@/components/ui/skeleton'

export function ShortcutsLoader() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="p-4">
        {/* Global Option */}
        <div className="rounded-xl px-3 cursor-default mb-6">
          <div className="flex items-center justify-between gap-2 border-b border-subtle py-3">
            <div className="flex items-center gap-2 font-medium">
              <Skeleton className="size-5" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>

        {/* App Options */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 cursor-default ${i === 1 ? 'opacity-70' : i === 2 ? 'opacity-40' : ''}`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-subtle py-3">
              <div className="flex items-center gap-2 font-medium">
                <Skeleton className="size-5" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
