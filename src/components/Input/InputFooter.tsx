import { motion, Variants } from 'framer-motion'
import { useStore } from '@/providers/store-provider'
import Highlight from '@highlight-ai/app-runtime'
import { BoxAdd, AddCircle } from 'iconsax-react'

function BrowseShortcutsFooterButton() {
  const handleOpenClick = async () => {
    try {
      await Highlight.app.openApp('prompts')
    } catch (error) {
      console.error('Failed to open the prompts app:', error)
      window.location.href = 'highlight://app/prompts'
    }
  }

  return (
    <button
      type="button"
      onClick={handleOpenClick}
      className="group flex items-center gap-2 pl-0.5 text-sm font-medium text-subtle transition-colors hover:text-secondary"
    >
      <BoxAdd size={20} variant="Bold" />
      <span>Browse Shortcuts</span>
    </button>
  )
}

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

const InputFooter = () => {
  const openModal = useStore((state) => state.openModal)

  return (
    <motion.div
      layout
      variants={footerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex items-center gap-5 px-6 pt-1.5"
    >
      <button
        type="button"
        onClick={() => openModal('create-prompt')}
        className="group flex items-center gap-2 pl-0.5 text-sm font-medium text-subtle transition-colors hover:text-secondary"
      >
        <AddCircle size={20} variant="Bold" />
        <span>Create Shortcut</span>
      </button>
      <BrowseShortcutsFooterButton />
    </motion.div>
  )
}

export default InputFooter
