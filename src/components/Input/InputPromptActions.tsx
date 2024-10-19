import { AnimatePresence, motion, Variants } from 'framer-motion'
import { SearchIcon } from './Input'
import { useMemo } from 'react'
import usePromptApps from '@/hooks/usePromptApps'
import { PinnedPrompt } from '@/types'
import Image from 'next/image'
import { supabaseLoader } from '@/lib/supabase'

const actionItemVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: 'blur(4px)',
    x: 10,
  },
  show: {
    opacity: 1,
    filter: 'blur(0px)',
    x: 0,
  },
  exit: {
    opacity: 0,
    filter: 'blur(4px)',
    x: 10,
  },
}

const InputActionItem = ({ prompt }: { prompt: PinnedPrompt }) => {
  return (
    <motion.div
      variants={actionItemVariants}
      className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 transition-[background-color] duration-150 hover:bg-black/20"
    >
      {prompt.image && (
        <Image
          src={`/user_content/${prompt.image}.${prompt.user_images?.file_extension}`}
          alt="Prompt image"
          className="h-6 w-6 rounded-full"
          width={24}
          height={24}
          loader={supabaseLoader}
        />
      )}
      <h3>{`${prompt.name}:`}</h3>
      <p className="text-white/40">{prompt.description}</p>
    </motion.div>
  )
}

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

const InputPromptActions = ({ isInputFocused }: { isInputFocused: boolean }) => {
  const { pinnedPrompts } = usePromptApps()
  const visiblePrompts = useMemo(() => pinnedPrompts.slice(0, 4), [pinnedPrompts])

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
          {visiblePrompts.map((prompt) => (
            <InputActionItem prompt={prompt} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InputPromptActions
