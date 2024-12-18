import { useEffect, useRef, useState } from 'react'
import { Attachment as AttachmentType, isFileAttachmentType } from '@/types'
import { AnimatePresence, motion, MotionConfig, Transition, type Variants } from 'framer-motion'
import { AddCircle, BoxAdd } from 'iconsax-react'
import { useAtom, useAtomValue } from 'jotai'
import useMeasure from 'react-use-measure'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { getDisplayValue } from '@/utils/attachments'
import { sidePanelOpenAtom } from '@/atoms/side-panel'
import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import { Attachment } from '@/components/Attachment'
import { CreateShortcutButton } from '@/components/buttons/create-shortcut-button'
import { OpenAppButton } from '@/components/buttons/open-app-button'
import { AttachmentDropdowns } from '@/components/dropdowns/attachment-dropdowns'
import { useStore } from '@/components/providers/store-provider'

import { chatInputIsFocusedAtom } from '../atoms'
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
      className="flex items-center gap-5 rounded-full bg-[#1f1f1f] px-6 pt-3"
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

const MAX_INPUT_HEIGHT = 160

export function InputDivider({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('w-full border-t border-[#191919]', className)}
    />
  )
}

export function ChatInput({ isActiveChat }: { isActiveChat: boolean }) {
  const {
    attachments,
    inputOverride,
    setInputOverride,
    inputIsDisabled,
    promptApp,
    removeAttachment,
    fileInputRef,
    isConversationLoading,
  } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      inputIsDisabled: state.inputIsDisabled,
      inputOverride: state.inputOverride,
      setInputOverride: state.setInputOverride,
      promptApp: state.promptApp,
      removeAttachment: state.removeAttachment,
      fileInputRef: state.fileInputRef,
      isConversationLoading: state.isConversationLoading,
    })),
  )
  const { handleSubmit } = useSubmitQuery()
  const [isInputFocused, setIsInputFocused] = useAtom(chatInputIsFocusedAtom)
  const [input, setInput] = useState('')
  const transcriptOpen = useAtomValue(sidePanelOpenAtom)

  let inputContainerRef = useRef<HTMLDivElement>(null)
  let inputRef = useRef<HTMLTextAreaElement>(null)
  let inputBlurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use to handle the auto closing when the window is focused
  // and to prevent toggling the input focus when pressing a dropdown
  useEffect(() => {
    const onInputFocus = () => {
      if (inputBlurTimeoutRef.current) {
        clearTimeout(inputBlurTimeoutRef.current)
      }
      setIsInputFocused(true)
    }

    const onInputBlur = () => {
      inputBlurTimeoutRef.current = setTimeout(() => {
        setIsInputFocused(false)
      }, 100)
    }

    const inputElement = inputRef.current

    if (inputElement) {
      inputElement.addEventListener('focus', onInputFocus)
      inputElement.addEventListener('blur', onInputBlur)
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', onInputFocus)
        inputElement.removeEventListener('blur', onInputBlur)
      }

      if (inputBlurTimeoutRef.current) clearTimeout(inputBlurTimeoutRef.current)
    }
  }, [inputBlurTimeoutRef, setIsInputFocused])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsInputFocused(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [inputRef, setIsInputFocused])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setIsInputFocused(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [inputContainerRef, setIsInputFocused])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '24px'
      const scrollHeight = inputRef.current.scrollHeight

      const newHeight = scrollHeight > MAX_INPUT_HEIGHT ? MAX_INPUT_HEIGHT : scrollHeight
      inputRef.current.style.height = newHeight + 'px'
    }
  }, [inputRef, input])

  useEffect(() => {
    if (inputOverride && inputOverride?.length > 0 && input !== inputOverride) {
      setInput(inputOverride)
      setInputOverride(null)
    }
  }, [input, inputOverride, setInputOverride])

  const handleNonInputFocus = () => {
    if (inputBlurTimeoutRef.current) {
      clearTimeout(inputBlurTimeoutRef.current)
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputIsDisabled && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input, promptApp)
      setInput('')
    }
  }

  const focusInput = () => {
    inputRef.current?.focus()
    trackEvent('HL Chat Input Focused', {})
  }

  const onRemoveAttachment = (attachment: AttachmentType) => {
    if (isFileAttachmentType(attachment.type) && fileInputRef?.current) {
      fileInputRef.current.value = ''
    }

    removeAttachment(attachment)
    trackEvent('HL Chat Attachment Removed', { type: attachment.type })
  }

  const [ref, bounds] = useMeasure()

  const inputTransition: Transition = { type: 'spring', duration: 0.25, bounce: 0.3 }

  return (
    <MotionConfig transition={inputTransition}>
      <div ref={inputContainerRef} className="relative z-30 flex min-h-[68px] w-full flex-col items-center gap-8">
        <motion.div
          layout
          initial={{ height: 68 }}
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
            'absolute isolate z-10 min-h-[68px] w-full cursor-text rounded-[24px] bg-[#1f1f1f]',
            isActiveChat && 'mb-5 max-w-[min(800px,83%)]',
            isInputFocused && 'shadow-xl',
          )}
          onClick={focusInput}
        >
          <div ref={ref} className="flec min-h-14 flex-col justify-between py-4">
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
                  className="h-6 max-h-[120px] w-full flex-1 resize-none overflow-y-auto bg-transparent text-base font-normal leading-6 outline-none placeholder:select-none placeholder:text-light-40 focus:outline-none"
                />
              </div>
              <div onFocus={handleNonInputFocus}>
                <AttachmentDropdowns />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {attachments.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2 px-6">
                  {attachments.map((attachment: AttachmentType, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...inputTransition, delay: 0.15 }}
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
              {!isActiveChat && isInputFocused && (
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
