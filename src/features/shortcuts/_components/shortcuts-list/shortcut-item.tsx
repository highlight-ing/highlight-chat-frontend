import { Command } from 'iconsax-react'

import { PromptWithTags } from '@/types/supabase-helpers'
import { Tooltip } from '@/components/ui/tooltip'
import Button from '@/components/Button/Button'
import { UserCreatedShortcutIcon } from '@/components/icons'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'

interface ShortcutItemProps {
  shortcut: PromptWithTags & { isUserCreated?: boolean }
  isSelected?: boolean
  onClick?: (shortcutId: string) => void
}

export function ShortcutItem({ shortcut, isSelected, onClick }: ShortcutItemProps) {
  const hasCustomIcon = shortcut.image && shortcut.user_images?.file_extension

  return (
    <div
      onClick={() => onClick?.(shortcut.id.toString())}
      className={`hover:bg-[#ffffff05] cursor-pointer rounded-md px-3 py-2 ${isSelected ? 'bg-[#ffffff08]' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-full bg-[#ffffff08]">
          {hasCustomIcon ? (
            <PromptAppIcon
              height={24}
              width={24}
              imageId={shortcut.image!}
              imageExtension={shortcut.user_images!.file_extension}
              className="flex-shrink-0"
            />
          ) : (
            <div className="flex items-center justify-center rounded-full bg-[#ffffff08] w-6 h-6">
              <Command size={12} className="text-light-60" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-base text-white">{shortcut.name}</h3>
          {/* {shortcut.description && <p className="text-sm text-light-40 mt-1">{shortcut.description}</p>} */}
        </div>
        {shortcut.isUserCreated && (
          <Tooltip content="User created shortcut">
            <div
              role="button"
              tabIndex={0}
              className="flex items-center justify-center w-6 h-6"
              onClick={(e) => e.stopPropagation()}
            >
              <UserCreatedShortcutIcon />
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
