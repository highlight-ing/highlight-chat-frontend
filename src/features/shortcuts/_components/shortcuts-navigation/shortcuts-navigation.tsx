import React from 'react'
import { Global } from 'iconsax-react'

import { ScrollArea } from '@/components/ui/scroll-area'

import { useApplications } from '../../_hooks/use-applications'

interface ShortcutsNavigationProps {
  selectedNavItem?: {
    type: 'application' | 'tag' | 'global'
    id: string
  }
  onSelectNavItem?: (navItem: { type: 'application' | 'tag' | 'global'; id: string }) => void
}

export function ShortcutsNavigation({ selectedNavItem, onSelectNavItem }: ShortcutsNavigationProps) {
  const { isLoading, applications } = useApplications()

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-light-40">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-2">
        <h2 className="text-[15px] font-semibold text-white leading-5 tracking-[-0.225px]">My Shortcuts</h2>
        <p className="text-sm text-light-40 leading-5">
          Add prompts and instructions for all of your favorite applications to make Highlight the ultimate assistant.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-1 p-4">
          {/* Global Option */}
          <div
            className={`flex items-center gap-3 rounded-2xl px-3 py-2 cursor-pointer hover:bg-light-5 mb-6 ${
              selectedNavItem?.type === 'global' ? 'bg-light-5' : ''
            }`}
            onClick={() => onSelectNavItem?.({ type: 'global', id: 'global' })}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-7 w-7 rounded-md p-1">
                <Global variant="Bold" size={24} />
              </div>
              <h3 className="text-sm font-medium text-light-80">Global</h3>
            </div>
          </div>

          {applications.map((app) => (
            <div
              key={app.id}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 cursor-pointer hover:bg-light-5 ${
                selectedNavItem?.type === 'application' && selectedNavItem.id === app.id ? 'bg-light-5' : ''
              }`}
              onClick={() => onSelectNavItem?.({ type: 'application', id: app.id })}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center h-7 w-7 rounded-md p-1.5 border border-[0.25px] border-[#333333]"
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
      </ScrollArea>
    </div>
  )
}
