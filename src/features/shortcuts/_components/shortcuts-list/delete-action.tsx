import { useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig, Variants } from 'framer-motion'
import { Trash } from 'iconsax-react'

import { PromptWithTags } from '@/types/supabase-helpers'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'

import { useShortcutActions } from '../../_hooks/use-shortcut-actions'

export function DeleteAction(props: { shortcut: PromptWithTags; moreOptionsOpen: boolean }) {
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
