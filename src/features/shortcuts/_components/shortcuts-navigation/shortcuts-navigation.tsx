import React from 'react'
import { PlusIcon } from '@radix-ui/react-icons'
import { Global, Grid1 } from 'iconsax-react'

import { AppShortcutPreferences, PromptWithTags } from '@/types/supabase-helpers'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip } from '@/components/ui/tooltip'
import Button from '@/components/Button/Button'
import { NewShortcutIcon, ShortcutIcon } from '@/components/icons'
import { useStore } from '@/components/providers/store-provider'

import { useApplications } from '../../_hooks/use-applications'
import { ShortcutsLoader } from './shortcuts-loader'

type NavItemType = 'all' | 'unassigned' | 'application' | 'global' | 'app-based'
type NavItem = {
  type: NavItemType
  id: string
}

interface ShortcutsNavigationProps {
  selectedNavItem: NavItem
  onSelectNavItem: (navItem: NavItem) => void
  shortcuts: PromptWithTags[]
  preferences?: AppShortcutPreferences[]
}

export function ShortcutsNavigation({
  selectedNavItem,
  onSelectNavItem,
  shortcuts = [],
  preferences = [],
}: ShortcutsNavigationProps) {
  const { isLoading, applications } = useApplications()
  const openModal = useStore((state) => state.openModal)

  const counts = React.useMemo(() => {
    return {
      all: shortcuts.length,
      global: shortcuts.filter(
        (shortcut) =>
          !shortcut.external_id ||
          preferences?.some(
            (pref) =>
              pref.prompt_id === shortcut.id &&
              (pref.application_name_darwin === '*' || pref.application_name_win32 === '*'),
          ),
      ).length,
      unassigned: shortcuts.filter((shortcut) => !preferences?.some((pref) => pref.prompt_id === shortcut.id)).length,
      appBased: shortcuts.filter((shortcut) =>
        preferences?.some((pref) => {
          if (pref.prompt_id !== shortcut.id) return false
          return (
            (pref.application_name_darwin && pref.application_name_darwin !== '*') ||
            (pref.application_name_win32 && pref.application_name_win32 !== '*')
          )
        }),
      ).length,
    }
  }, [shortcuts, preferences])

  // Navigation Item component to reduce repetition
  const NavItem = ({ type, label }: { type: NavItemType; label: string }) => {
    const getIcon = () => {
      switch (type) {
        case 'global':
          return <Global size={17} className="text-light-40" variant="Bold" />
        case 'all':
          return <Grid1 size={17} className="text-light-40" variant="Bold" />
        default:
          return null
      }
    }

    return (
      <div
        className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-light-5 ${
          selectedNavItem.type === type ? 'bg-light-5' : ''
        }`}
        onClick={() => onSelectNavItem({ type, id: type })}
      >
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="text-sm font-medium text-light-80">{label}</h3>
        </div>
      </div>
    )
  }
  if (isLoading) {
    return <ShortcutsLoader />
  }

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      <div className="px-2 pt-5">
        <div className="flex items-center justify-between border-b border-[#ffffff0d] pb-5 h-[52px]">
          <div className="flex items-center gap-2 px-3">
            <div className="text-gray-500">
              <ShortcutIcon size={17} />
            </div>

            <h2 className="text-sm font-medium text-light-90 select-none">My Shortcuts</h2>
          </div>
          <div className="px-3">
            <Tooltip content="Create new shortcut">
              <Button size="icon" variant="ghost-neutral" onClick={() => openModal('create-prompt')}>
                <NewShortcutIcon size={15} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2 min-h-full">
            <NavItem type="all" label="All Shortcuts" />
            {/* <NavItem type="unassigned" label="Unassigned Shortcuts" /> */}
            <NavItem type="global" label="Global Shortcuts" />
            {/* <NavItem type="app-based" label="App Based Shortcuts" /> */}

            {/* App List */}
            <div className="relative pl-0 space-y-1">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-light-5 ${
                    selectedNavItem.type === 'application' && selectedNavItem.id === app.id ? 'bg-light-5' : ''
                  }`}
                  onClick={() => onSelectNavItem({ type: 'application', id: app.id })}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center h-5 w-5 rounded-md p-0.5 border border-[0.25px] border-[#333333]"
                      style={{
                        background:
                          app.theme === 'dark'
                            ? 'linear-gradient(139deg, #333 3.52%, #161818 51.69%)'
                            : 'linear-gradient(139deg, #FFFFFF 3.52%, #E5E5E5 51.69%)',
                      }}
                    >
                      {app.icon && React.createElement(app.icon, { size: 24 })}
                    </div>
                    <h3 className="text-sm font-medium text-light-80">{app.displayName}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
