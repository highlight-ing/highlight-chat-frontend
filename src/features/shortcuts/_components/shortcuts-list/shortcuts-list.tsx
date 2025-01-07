import React from 'react'
import { Category, Global } from 'iconsax-react'

import { PromptWithTags } from '@/types/supabase-helpers'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  onSelectShortcut: (shortcutId: string) => void
}

export function ShortcutsList({ selectedNavItem, shortcuts, isLoading, onSelectShortcut }: ShortcutsListProps) {
  const openModal = useStore((state) => state.openModal)
  const { applications } = useApplications()

  const getSelectedAppIcon = () => {
    if (!selectedNavItem) return null
    switch (selectedNavItem.type) {
      case 'all':
        return
      case 'global':
        return
      case 'unassigned':
        return
      case 'app-based':
        return
      case 'application':
        const app = applications.find((a) => a.id === selectedNavItem.id)
        return app?.icon && React.createElement(app.icon, { size: 24 })
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
        return `${selectedNavItem.id}`
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
      <div className=" p-6 space-y-2 border-b border-[#ffffff0d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedNavItem.type === 'application' && (
              <div
                className="flex items-center justify-center h-6 w-6 rounded-md p-1 border border-[0.25px] border-[#333333]"
                style={{
                  background: (() => {
                    const app = applications.find((a) => a.id === selectedNavItem.id)
                    return app?.theme === 'dark'
                      ? 'linear-gradient(139deg, #333 3.52%, #161818 51.69%)'
                      : 'linear-gradient(139deg, #FFFFFF 3.52%, #E5E5E5 51.69%)'
                  })(),
                }}
              >
                {getSelectedAppIcon()}
              </div>
            )}
            <h2 className="text-[15px] font-medium text-light-90 leading-5 tracking-[-0.225px] h-6 flex items-center">
              {getHeaderTitle()}
            </h2>
          </div>
        </div>
        {/* <p className="text-sm text-light-40 leading-5">{getHeaderDescription()}</p> */}
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
