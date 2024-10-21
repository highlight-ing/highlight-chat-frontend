import { PlusIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { useStore } from '@/providers/store-provider'

const footerVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: 'blur(4px)',
    y: -10,
  },
  show: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { type: 'spring', duration: 0.25, bounce: 0.3, delay: 0.2 },
  },
  exit: {
    opacity: 0,
    filter: 'blur(4px)',
    y: -10,
  },
}

const InputFooter = ({ isInputFocused }: { isInputFocused: boolean }) => {
  const openModal = useStore((state) => state.openModal)

  return (
    <AnimatePresence mode="popLayout">
      {isInputFocused && (
        <motion.div
          layout
          variants={footerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="px-4 pt-1.5"
        >
          <button
            type="button"
            onClick={() => openModal('create-prompt')}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-subtle hover:bg-secondary"
          >
            <div className="grid size-5 place-items-center rounded-full bg-conv-text-subtle text-[#1f1f1f]">
              <PlusIcon />
            </div>
            <span>Create Shortcut</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InputFooter
