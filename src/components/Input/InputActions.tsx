import { AnimatePresence, motion, Variants } from 'framer-motion'
import { SearchIcon } from './Input'

const InputActionItem = ({ title }: { title: string }) => {
  const actionItemVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: 'blur(4px)',
      y: -10,
    },
    show: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
    },
    exit: {
      opacity: 0,
      filter: 'blur(4px)',
      y: -10,
    },
  }

  return (
    <motion.div
      variants={actionItemVariants}
      className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 hover:bg-black/20"
    >
      <SearchIcon />
      <h3>{`${title}:`}</h3>
      <p className="text-white/40">what I'm seeing</p>
    </motion.div>
  )
}

const InputActions = ({ isInputFocused }: { isInputFocused: boolean }) => {
  const actionItemContainerVariants: Variants = {
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  }

  return (
    <AnimatePresence mode="popLayout">
      {isInputFocused && (
        <motion.div
          layout
          variants={actionItemContainerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="space-y-1"
        >
          <InputActionItem title="Summarize" />
          <InputActionItem title="Explain" />
          <InputActionItem title="Rewrite" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InputActions
