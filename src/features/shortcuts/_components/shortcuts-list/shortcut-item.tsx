import { Command } from 'iconsax-react'

import { PromptWithTags } from '@/types/supabase-helpers'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'

interface ShortcutItemProps {
  shortcut: PromptWithTags
  onClick?: (shortcutId: string) => void
}

export function ShortcutItem({ shortcut, onClick }: ShortcutItemProps) {
  const hasCustomIcon = shortcut.image && shortcut.user_images?.file_extension

  return (
    <div
      onClick={() => onClick?.(shortcut.id.toString())}
      className="p-4 rounded-lg border border-[#ffffff0d] hover:bg-[#ffffff05] cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#ffffff08]">
          {hasCustomIcon ? (
            <PromptAppIcon
              height={24}
              width={24}
              imageId={shortcut.image!}
              imageExtension={shortcut.user_images!.file_extension}
              className="flex-shrink-0"
            />
          ) : (
            <Command size={24} className="text-white" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white">{shortcut.name}</h3>
          {/* {shortcut.description && <p className="text-sm text-light-40 mt-1">{shortcut.description}</p>} */}
        </div>
      </div>
    </div>
  )
}
