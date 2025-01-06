import React from 'react'

interface ShortcutCardProps {
  shortcut: {
    id: string
    name: string
  }
  onClick?: (shortcutId: string) => void
}

export function ShortcutCard({ shortcut, onClick }: ShortcutCardProps) {
  return (
    <div
      className="p-4 border border-[#ffffff0d] rounded-lg cursor-pointer hover:bg-[#ffffff05]"
      onClick={() => onClick?.(shortcut.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* TODO: Add icon/visual indicator */}
          <h3 className="text-sm font-medium text-white">{shortcut.name}</h3>
        </div>
        {/* TODO: Add metadata (usage stats, date, etc) */}
      </div>
      {/* TODO: Add description */}
    </div>
  )
}
