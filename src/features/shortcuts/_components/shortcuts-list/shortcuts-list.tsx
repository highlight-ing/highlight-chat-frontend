import React from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/components/providers/store-provider'

import { ShortcutCard } from './shortcut-card'

export interface ShortcutsListProps {
  selectedNavItem?: {
    type: 'application' | 'tag' | 'global'
    id: string
  }
  onSelectShortcut?: (shortcutId: string) => void
}

interface Shortcut {
  id: string
  name: string
}

export function ShortcutsList({ selectedNavItem, onSelectShortcut }: ShortcutsListProps) {
  const openModal = useStore((state) => state.openModal)

  // TODO: Add hook to fetch shortcuts based on selectedNavItem
  const isLoading = false
  const shortcuts: Shortcut[] = []

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4">
          <p className="text-sm text-light-40">Loading shortcuts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-2 border-b border-[#ffffff0d]">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white leading-5 tracking-[-0.225px]">
            {selectedNavItem?.type === 'application'
              ? `${selectedNavItem.id} Shortcuts`
              : selectedNavItem?.type === 'tag'
                ? `#${selectedNavItem.id}`
                : 'Global Shortcuts'}
          </h2>
          {/* <button
            onClick={() => openModal('create-prompt')}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white h-9 px-4 py-2 bg-primary hover:bg-primary/90"
          >
            Create Shortcut
          </button> */}
        </div>
        <p className="text-sm text-light-40 leading-5">
          {selectedNavItem?.type === 'application'
            ? `Shortcuts specific to ${selectedNavItem.id}`
            : selectedNavItem?.type === 'tag'
              ? `Shortcuts tagged with #${selectedNavItem.id}`
              : 'Shortcuts that work across all applications'}
        </p>
      </div>

      {/* Shortcuts List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {shortcuts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <p className="text-sm text-light-40">No shortcuts found</p>
              <button
                onClick={() => openModal('create-prompt')}
                className="mt-2 text-sm text-primary hover:text-primary/90"
              >
                Create your first shortcut
              </button>
            </div>
          ) : (
            shortcuts.map((shortcut) => (
              <ShortcutCard key={shortcut.id} shortcut={shortcut} onClick={onSelectShortcut} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
