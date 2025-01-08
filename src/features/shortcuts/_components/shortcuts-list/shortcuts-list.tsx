import React from 'react'
import { Category, Global, Grid1 } from 'iconsax-react'

import { PromptWithTags } from '@/types/supabase-helpers'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useStore } from '@/components/providers/store-provider'

import { useApplications } from '../../_hooks/use-applications'
import { EmptyState } from './empty-state'
import { ShortcutItem } from './shortcut-item'

type NavItemType = 'all' | 'unassigned' | 'application' | 'global' | 'app-based'
type NavItem = {
  type: NavItemType
  id: string
}

interface ShortcutsListProps {
  shortcuts: PromptWithTags[]
  isLoading: boolean
  selectedNavItem: NavItem
  selectedShortcutId?: string
  onSelectShortcut: (shortcutId: string) => void
}

function ShortcutsListLoader() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-2 pt-5">
        <div className="flex items-center justify-between border-b border-[#ffffff0d] pb-5 h-[52px]">
          <div className="flex items-center gap-2 px-3">
            <Skeleton className="h-[17px] w-[17px] rounded-md" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Shortcuts List */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-2 space-y-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 ${i >= 4 ? `opacity-${100 - (i - 3) * 20}` : ''}`}
            >
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-[18px] flex-1 w-full" />
              <Skeleton className="h-6 w-6 rounded-lg" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export function ShortcutsList({
  selectedNavItem,
  shortcuts,
  isLoading,
  onSelectShortcut,
  selectedShortcutId,
}: ShortcutsListProps) {
  const openModal = useStore((state) => state.openModal)
  const { applications } = useApplications()

  const getHeaderIcon = () => {
    switch (selectedNavItem.type) {
      case 'all':
        return <Grid1 size={17} className="text-gray-500" variant="Bold" />
      case 'global':
        return <Global size={17} className="text-gray-500" variant="Bold" />
      case 'application':
        const app = applications.find((a) => a.id === selectedNavItem.id)
        return app?.icon && React.createElement(app.icon, { size: 24 })
      default:
        return null
    }
  }

  const getHeaderTitle = () => {
    switch (selectedNavItem.type) {
      case 'all':
        return 'All Shortcuts'
      case 'global':
        return 'Global Shortcuts'
      case 'unassigned':
        return 'Unassigned Shortcuts'
      case 'app-based':
        return 'App Based Shortcuts'
      case 'application':
        return `${selectedNavItem.id} Shortcuts`
    }
  }

  const getHeaderDescription = () => {
    switch (selectedNavItem.type) {
      case 'all':
        return 'All available shortcuts'
      case 'global':
        return 'Shortcuts that work across all applications'
      case 'unassigned':
        return 'Shortcuts not assigned to any application'
      case 'app-based':
        return 'Shortcuts configured for specific applications'
      case 'application':
        return `Shortcuts specific to ${selectedNavItem.id}`
    }
  }

  if (isLoading) {
    return <ShortcutsListLoader />
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 pt-5">
        <div className="flex items-center justify-between border-b border-[#ffffff0d] pb-5 h-[52px]">
          <div className="flex items-center gap-2 px-3">
            {selectedNavItem.type === 'application' ? (
              <div
                className="flex items-center justify-center h-5 w-5 rounded-md p-0.5 border border-[0.25px] border-[#333333]"
                style={{
                  background: (() => {
                    const app = applications.find((a) => a.id === selectedNavItem.id)
                    return app?.theme === 'dark'
                      ? 'linear-gradient(139deg, #333 3.52%, #161818 51.69%)'
                      : 'linear-gradient(139deg, #FFFFFF 3.52%, #E5E5E5 51.69%)'
                  })(),
                }}
              >
                {getHeaderIcon()}
              </div>
            ) : (
              getHeaderIcon()
            )}
            <h2 className="text-sm font-medium text-light-90 select-none">{getHeaderTitle()}</h2>
          </div>
        </div>
      </div>

      {/* Shortcuts List */}
      <ScrollArea className="flex-1 h-full ">
        <div className="p-2 space-y-1 h-full">
          {shortcuts.length === 0 ? (
            <EmptyState selectedNavItem={selectedNavItem} />
          ) : (
            shortcuts.map((shortcut: PromptWithTags) => (
              <ShortcutItem
                key={shortcut.id}
                shortcut={shortcut}
                isSelected={selectedShortcutId === shortcut.id.toString()}
                onClick={() => onSelectShortcut?.(shortcut.id.toString())}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
