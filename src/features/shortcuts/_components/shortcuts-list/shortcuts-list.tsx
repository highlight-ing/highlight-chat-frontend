import React from 'react'
import { Global } from 'iconsax-react'

import { PromptWithTags } from '@/types/supabase-helpers'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/components/providers/store-provider'

import { useApplications } from '../../_hooks/use-applications'
import { EmptyState } from './empty-state'
import { ShortcutItem } from './shortcut-item'

export interface ShortcutsListProps {
  selectedNavItem?: {
    type: 'application' | 'tag' | 'global'
    id: string
  }
  shortcuts: PromptWithTags[]
  isLoading?: boolean
  onSelectShortcut?: (shortcutId: string) => void
}

export function ShortcutsList({ selectedNavItem, shortcuts, isLoading, onSelectShortcut }: ShortcutsListProps) {
  const openModal = useStore((state) => state.openModal)
  const { applications } = useApplications()

  const getSelectedAppIcon = () => {
    if (!selectedNavItem) return null
    if (selectedNavItem.type === 'global') {
      return <Global variant="Bold" size={24} />
    }
    const app = applications.find((a) => a.id === selectedNavItem.id)
    return app?.icon && React.createElement(app.icon, { size: 24 })
  }

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
          <div className="flex items-center gap-2">
            {selectedNavItem && (
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-md p-1.5 ${
                  selectedNavItem.type === 'application' ? 'border border-[0.25px] border-[#333333]' : 'p-1'
                }`}
                style={{
                  background:
                    selectedNavItem.type === 'application'
                      ? 'linear-gradient(139deg, #333 3.52%, #161818 51.69%)'
                      : undefined,
                }}
              >
                {getSelectedAppIcon()}
              </div>
            )}
            <h2 className="text-[15px] font-semibold text-white leading-5 tracking-[-0.225px]">
              {selectedNavItem?.type === 'application'
                ? `${selectedNavItem.id} Shortcuts`
                : selectedNavItem?.type === 'tag'
                  ? `#${selectedNavItem.id}`
                  : 'Global Shortcuts'}
            </h2>
          </div>
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
      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-2 h-full">
          {shortcuts.length === 0 ? (
            <EmptyState selectedNavItem={selectedNavItem} />
          ) : (
            shortcuts.map((shortcut: PromptWithTags) => (
              <ShortcutItem
                key={shortcut.id}
                shortcut={shortcut}
                onClick={() => onSelectShortcut?.(shortcut.id.toString())}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
