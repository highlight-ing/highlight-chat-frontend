import { MouseEvent } from 'react'
import Image from 'next/image'
import { PinnedPrompt } from '@/types'
import { motion, Variants } from 'framer-motion'
import { Archive, Edit2 } from 'iconsax-react'

import { supabaseLoader } from '@/lib/supabase'
import usePromptApps from '@/hooks/usePromptApps'
import { useStore } from '@/components/providers/store-provider'

import Tooltip from '../Tooltip/Tooltip'
import { ScrollArea } from '../ui/scroll-area'

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

const InputActionItem = ({ prompt, input }: { prompt: PinnedPrompt; input: string }) => {
  const { selectPrompt } = usePromptApps()
  const openModal = useStore((state) => state.openModal)
  const setStoreInput = useStore((state) => state.setInputOverride)

  function handlePromptClick() {
    setStoreInput(input)
    selectPrompt(prompt.external_id, false)
  }

  function handleEditPromptClick(e: MouseEvent) {
    e.stopPropagation()
    openModal('edit-prompt', { prompt })
  }

  function handleUnpinPromptClick(e: MouseEvent) {
    e.stopPropagation()
    openModal('unpin-prompt', { prompt })
  }

  return (
    <motion.div
      variants={actionItemVariants}
      className="group flex h-10 w-full cursor-pointer items-center justify-between gap-2 pl-6 pr-4 transition-[background-color] duration-150 hover:bg-hover"
      onClick={handlePromptClick}
    >
      <div className="flex items-center gap-2">
        {prompt.image && (
          <Image
            src={`/user_content/${prompt.image}.${prompt.user_images?.file_extension}`}
            alt="Prompt image"
            className="h-5 w-5 rounded-full"
            width={20}
            height={20}
            loader={supabaseLoader}
          />
        )}
        <h3>{`${prompt.name}`}</h3>
      </div>
      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip position="top" tooltip="Edit prompt">
          <button
            type="button"
            aria-label="Edit prompt"
            onClick={(e) => handleEditPromptClick(e)}
            className="size-8 grid place-items-center"
          >
            <Edit2 variant="Bold" size={16} />
            <span className="sr-only">Edit prompt</span>
          </button>
        </Tooltip>
        <Tooltip position="top" tooltip="Unpin prompt">
          <button
            type="button"
            aria-label="Unpin prompt"
            onClick={handleUnpinPromptClick}
            className="size-8 grid place-items-center"
          >
            <Archive variant="Bold" size={16} />
            <span className="sr-only">Unpin prompt</span>
          </button>
        </Tooltip>
      </div>
    </motion.div>
  )
}

const actionItemContainerVariants: Variants = {
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.01,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

const InputPromptActions = ({ input }: { input: string }) => {
  const { isPinnedPromptsLoading, pinnedPrompts } = usePromptApps()
  const userId = useStore((state) => state.userId)

  const uniquePrompts = pinnedPrompts.reduce((acc: Array<PinnedPrompt>, curr) => {
    const externalIds = acc.map((prompt) => prompt.external_id)
    if (!externalIds.includes(curr.external_id)) acc.push(curr)
    else console.log('Duplicate prompt found:', curr.external_id)

    return acc
  }, [])

  if (isPinnedPromptsLoading || !userId) {
    return (
      <motion.div variants={actionItemVariants} initial="hidden" animate="show" exit="exit">
        <div className="flex w-full items-center gap-2 rounded-2xl px-6 py-2 transition-[background-color] duration-150">
          <h3 className="text-sm text-tertiary">Loading shortcuts...</h3>
        </div>
      </motion.div>
    )
  }

  if (!uniquePrompts || uniquePrompts.length === 0) {
    return null
  }

  return (
    <motion.div layout variants={actionItemContainerVariants} initial="hidden" animate="show" exit="exit">
      <ScrollArea type="scroll" scrollHideDelay={100} viewportClassName="max-h-52">
        {uniquePrompts.map((prompt, index) => (
          <InputActionItem key={`${prompt.external_id}-${index}`} prompt={prompt} input={input} />
        ))}
      </ScrollArea>
    </motion.div>
  )
}

export default InputPromptActions
