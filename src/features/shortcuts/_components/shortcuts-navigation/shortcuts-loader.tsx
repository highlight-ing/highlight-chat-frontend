import React from 'react'

import { Skeleton } from '@/components/ui/skeleton'

export function ShortcutsLoader() {
  return (
    <div className="flex flex-col h-full bg-[#121212]">
      {/* Header */}
      <div className="px-2 pt-5">
        <div className="flex items-center justify-between border-b border-[#ffffff0d] pb-5">
          <div className="flex items-center gap-2 px-3">
            <Skeleton className="h-[17px] w-[17px] rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="px-3">
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="space-y-1 p-2 min-h-full">
          {/* Navigation Items */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              <Skeleton className="h-[17px] w-[17px] rounded-md" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}

          {/* App List */}
          <div className="relative pl-0 space-y-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 ${i === 1 ? 'opacity-70' : i === 2 ? 'opacity-40' : ''}`}
              >
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
