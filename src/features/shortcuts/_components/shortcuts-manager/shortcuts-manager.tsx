import React, { useState } from 'react'

import { ShortcutEditor } from '../shortcut-editor'
import { ShortcutsList } from '../shortcuts-list'
import { ShortcutsNavigation } from '../shortcuts-navigation'

export function ShortcutsManager() {
  const [selectedNavItem, setSelectedNavItem] = useState<
    | {
        type: 'application' | 'tag' | 'global'
        id: string
      }
    | undefined
  >()

  const [selectedShortcut, setSelectedShortcut] = useState<string | undefined>()

  // Reset selected shortcut when navigation changes
  const handleNavChange = (navItem: { type: 'application' | 'tag' | 'global'; id: string }) => {
    setSelectedShortcut(undefined)
    setSelectedNavItem(navItem)
  }

  return (
    <div className="flex w-full h-[calc(100vh-48px)] mt-[48px]">
      <div className="w-96 border-r border-[#ffffff0d]">
        <ShortcutsNavigation selectedNavItem={selectedNavItem} onSelectNavItem={handleNavChange} />
      </div>
      <div className="w-full border-r border-[#ffffff0d]">
        <ShortcutsList selectedNavItem={selectedNavItem} onSelectShortcut={setSelectedShortcut} />
      </div>
      {/* {selectedShortcut && (
        <div className="flex-1">
          <ShortcutEditor />
        </div>
      )} */}
    </div>
  )
}
