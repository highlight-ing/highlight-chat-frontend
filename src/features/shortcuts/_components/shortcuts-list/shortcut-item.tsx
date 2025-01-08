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

interface ShortcutItemProps {
  shortcut: PromptWithTags & { isUserCreated?: boolean }
  isSelected?: boolean
  onClick?: (shortcutId: string) => void
}

function DeleteAction(props: { shortcut: PromptWithTags; moreOptionsOpen: boolean }) {
  const [state, setState] = useState<'idle' | 'expanded'>('idle')
  const isExpanded = state === 'expanded'
  const { deleteShortcut, isDeleting } = useShortcutActions()

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (isExpanded && props.moreOptionsOpen && e.key === 'Escape') {
        setState('idle')
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isExpanded, props.moreOptionsOpen])

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isExpanded) {
      setState('expanded')
    } else {
      setState('idle')
    }
  }

  function handleConfirmDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    deleteShortcut(props.shortcut.id)
    setState('idle')
  }

  const descriptionVariants: Variants = {
    hidden: { opacity: 0, filter: 'blur(3px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.1, delay: 0.1 } },
  }

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0.05, duration: 0.2 }}>
      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            layoutId={`${props.shortcut.id}-wrapper`}
            style={{ borderRadius: 12 }}
            className="space-y-2 bg-light-5 p-2"
          >
            <motion.p
              variants={descriptionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="text-sm"
            >
              Are you sure you want to permanently delete this shortcut?
            </motion.p>
            <button
              onClick={handleConfirmDeleteClick}
              disabled={isDeleting}
              className="flex w-full items-center gap-3 rounded-xl bg-[#ff3333]/10 px-2 py-1.5 text-[#ff3333] transition-colors hover:bg-[#ff3333]/20"
            >
              <motion.span layoutId={`${props.shortcut.id}-icon`}>
                {isDeleting ? <LoadingSpinner size="16px" color="#ff3333" /> : <Trash variant="Bold" size={16} />}
              </motion.span>
              <motion.span layoutId={`${props.shortcut.id}-button-text`}>Delete</motion.span>
            </button>
          </motion.div>
        ) : (
          <motion.button
            layoutId={`${props.shortcut.id}-wrapper`}
            onClick={handleDeleteClick}
            disabled={isDeleting}
            style={{ borderRadius: 12 }}
            className="flex w-full items-center gap-3 px-2 py-1.5 text-[#ff3333] transition-colors hover:bg-light-5"
          >
            <motion.span layoutId={`${props.shortcut.id}-icon`}>
              {isDeleting ? <LoadingSpinner size="16px" color="#ff3333" /> : <Trash variant="Bold" size={16} />}
            </motion.span>
            <motion.span layoutId={`${props.shortcut.id}-button-text`}>Delete</motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
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
      className={`group hover:bg-[#ffffff05] cursor-pointer rounded-md px-3 py-2 ${isSelected ? 'bg-[#ffffff08]' : ''}`}
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
