import { useEffect, useRef, useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion, MotionConfig, Variants } from 'framer-motion'
import { Command, Edit2, Send2, TickCircle, Trash } from 'iconsax-react'

import { PromptWithTags } from '@/types/supabase-helpers'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip } from '@/components/ui/tooltip'
import { UserCreatedShortcutIcon } from '@/components/icons'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import { useStore } from '@/components/providers/store-provider'

import { useShortcutActions } from '../../_hooks/use-shortcut-actions'
import { DeleteAction } from './delete-action'

interface ShortcutItemProps {
  shortcut: PromptWithTags & { isUserCreated?: boolean }
  isSelected?: boolean
  onClick?: (shortcutId: string) => void
}

export function ShortcutItem({ shortcut, isSelected, onClick }: ShortcutItemProps) {
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false)
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const [copied, setCopied] = useState(false)

  const openModal = useStore((state) => state.openModal)

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation()

    if (copied || !shortcut.slug) return

    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    const url = `https://chat.highlight.ing/prompts/${shortcut.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)

    timeout.current = setTimeout(() => {
      setCopied(false)
    }, 2500)
  }

  const hasCustomIcon = shortcut.image && shortcut.user_images?.file_extension

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setMoreOptionsOpen(false)
    openModal('edit-prompt', { data: { prompt: shortcut } })
  }

  function handleUnpin(e: React.MouseEvent) {
    e.stopPropagation()
    openModal('unpin-prompt', { prompt: shortcut })
  }

  return (
    <div
      onClick={() => onClick?.(shortcut.id.toString())}
      className={`group hover:bg-light-5 cursor-pointer rounded-md px-3 py-2 ${isSelected ? 'bg-light-5' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-full bg-[#ffffff08] h-6 w-6">
          {hasCustomIcon ? (
            <PromptAppIcon
              height={24}
              width={24}
              imageId={shortcut.image!}
              imageExtension={shortcut.user_images!.file_extension}
              className="flex-shrink-0"
            />
          ) : (
            <Command size={14} className="text-light-60" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-[15px]  text-light-80">{shortcut.name}</h3>
        </div>
        <Popover open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
          <PopoverTrigger className="size-6 invisible grid place-items-center rounded-lg p-1 transition-colors hover:bg-light-5 group-hover:visible data-[state=open]:visible data-[state=open]:bg-light-5">
            <DotsHorizontalIcon className="size-4 text-tertiary" />
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={16} className="max-w-52 p-1.5 text-secondary">
            <button
              onClick={handleEdit}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-light-5"
            >
              <Edit2 size={16} variant="Bold" />
              <p>Edit</p>
            </button>
            <button
              onClick={handleShare}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-light-5"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={copied ? 'check' : 'share'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <TickCircle size={16} variant="Bold" className="text-green-400" />
                  ) : (
                    <Send2 size={16} variant="Bold" />
                  )}
                  <p>{copied ? 'Copied!' : 'Share'}</p>
                </motion.div>
              </AnimatePresence>
            </button>
            {shortcut.isUserCreated && <DeleteAction shortcut={shortcut} moreOptionsOpen={moreOptionsOpen} />}
          </PopoverContent>
        </Popover>
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
