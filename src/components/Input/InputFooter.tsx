import { motion, Variants } from 'framer-motion'
import { BoxAdd, AddCircle } from 'iconsax-react'
import { BrowseShortcutsButton, CreateShortcutButton } from './ShortcutsActions'

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
  return (
    <motion.div
      layout
      variants={footerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex items-center gap-5 rounded-full bg-[#1f1f1f] px-6 pt-3"
    >
      <BrowseShortcutsButton className="flex items-center gap-2 pl-0.5 text-sm font-medium text-subtle transition-colors hover:text-secondary">
        <BoxAdd size={20} variant="Bold" />
        <span>Browse Shortcuts</span>
      </BrowseShortcutsButton>
      <CreateShortcutButton className="flex items-center gap-2 text-sm font-medium text-subtle transition-colors hover:text-secondary">
        <AddCircle size={20} variant="Bold" />
        <span>Create Shortcut</span>
      </CreateShortcutButton>
    </motion.div>
  )
}

export default InputFooter
