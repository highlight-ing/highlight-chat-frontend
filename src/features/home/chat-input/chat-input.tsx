import React from 'react'
import { Attachment as AttachmentType } from '@/types'
import { AnimatePresence, motion, MotionConfig, Transition, type Variants } from 'framer-motion'
import { AddCircle, BoxAdd, Setting } from 'iconsax-react'
import { useAtomValue } from 'jotai'
import useMeasure from 'react-use-measure'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { getDisplayValue } from '@/utils/attachments'
import { sidePanelOpenAtom } from '@/atoms/side-panel'
import { Attachment } from '@/components/Attachment'
import { CreateShortcutButton } from '@/components/buttons/create-shortcut-button'
import { OpenAppButton } from '@/components/buttons/open-app-button'
import { AttachmentDropdowns } from '@/components/dropdowns/attachment-dropdowns'
import { useStore } from '@/components/providers/store-provider'
import Tooltip from '@/components/Tooltip/Tooltip'

import { chatInputIsFocusedAtom } from '../atoms'
import { useChatInput } from './hooks'
import { PromptsList } from './prompts-list'

function InputFooter() {
  const footerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -10,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', duration: 0.25, bounce: 0.3, delay: 0.2 },
    },
    exit: {
      opacity: 0,
      y: -10,
    },
  }

  return (
    <motion.div
      layout
      variants={footerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex items-center gap-5 rounded-full px-6 pt-3"
    >
      <OpenAppButton
        appId="prompts"
        className="flex items-center gap-2 pl-0.5 text-sm font-medium text-subtle transition-colors hover:text-secondary"
      >
        <BoxAdd size={20} variant="Bold" />
        <span>Browse Shortcuts</span>
      </OpenAppButton>
      <CreateShortcutButton className="flex items-center gap-2 text-sm font-medium text-subtle transition-colors hover:text-secondary">
        <AddCircle size={20} variant="Bold" />
        <span>Create Shortcut</span>
      </CreateShortcutButton>
    </motion.div>
  )
}

export function InputDivider({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('w-full border-t border-tertiary', className)}
    />
  )
}

export function ChatInput() {
  const { attachments, inputIsDisabled, isConversationLoading } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      inputIsDisabled: state.inputIsDisabled,
      isConversationLoading: state.isConversationLoading,
    })),
  )
  const { input, setInput, inputContainerRef, inputRef, focusInput, handleKeyDown, onRemoveAttachment } = useChatInput()

  const [ref, bounds] = useMeasure()
  const transcriptOpen = useAtomValue(sidePanelOpenAtom)
  const isInputFocused = useAtomValue(chatInputIsFocusedAtom)

  const inputTransition: Transition = { type: 'spring', duration: 0.25, bounce: 0.2 }
  const INPUT_HEIGHT = 48

  return (
    <MotionConfig transition={inputTransition}>
      <div ref={inputContainerRef} className="relative z-30 flex min-h-[60px] w-full flex-col items-center gap-8">
        <motion.div
          layout
          initial={{ height: INPUT_HEIGHT }}
          animate={{ height: bounds.height }}
          transition={{
            duration: 0,
            height: {
              ...inputTransition,
              duration: isInputFocused ? 0.2 : 0.25,
              delay: transcriptOpen ? 0 : isInputFocused ? 0 : 0.15,
            },
          }}
          className={cn(
            'absolute isolate z-10 w-full cursor-text rounded-[20px] border border-tertiary bg-primary transition-colors',
            isInputFocused && 'bg-secondary shadow-xl',
          )}
          onClick={focusInput}
        >
          <div ref={ref} className="min-h-14 flex flex-col justify-between py-3">
            <div className="flex w-full items-end justify-between gap-2 pl-6 pr-4">
              <div className="h-auto w-full">
                <textarea
                  id="textarea-input"
                  ref={inputRef}
                  disabled={isConversationLoading || inputIsDisabled}
                  placeholder={isConversationLoading || inputIsDisabled ? 'Loading new chat...' : 'Ask Highlight'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    'h-6 max-h-[120px] w-full flex-1 resize-none overflow-y-auto bg-transparent text-base font-normal leading-6 outline-none placeholder:select-none placeholder:text-light-40 focus:outline-none',
                    !isInputFocused && 'max-h-6',
                  )}
                />
              </div>
              <motion.div layout className="flex items-center gap-2">
                <AttachmentDropdowns />
                {!isInputFocused && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Tooltip tooltip="Pinned prompts" position="top">
                      <button className="grid h-9 w-9 place-items-center rounded-full text-tertiary hover:bg-light-10">
                        <Setting variant="Bold" size={20} />
                      </button>
                    </Tooltip>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <AnimatePresence mode="popLayout">
              {isInputFocused && attachments.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2 px-[22px]">
                  {attachments.map((attachment: AttachmentType, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...inputTransition, delay: 0.1 }}
                    >
                      <Attachment
                        type={attachment.type}
                        value={getDisplayValue(attachment)}
                        id={attachment?.id}
                        title={attachment?.title}
                        startedAt={attachment.startedAt}
                        endedAt={attachment.endedAt}
                        isFile={
                          attachment.type === 'pdf' ||
                          (attachment.type === 'image' && !!attachment.file) ||
                          attachment.type === 'spreadsheet'
                        }
                        onRemove={() => onRemoveAttachment(attachment)}
                        key={index}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {isInputFocused && (
                <div className="pt-3">
                  <InputDivider />
                  <PromptsList input={input} />
                  <InputDivider />
                  <InputFooter />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  )
}

export const useInputFocus = () => {
  return () => {
    const input = document.getElementById('textarea-input')
    input?.focus()
  }
}
