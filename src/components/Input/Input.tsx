import { useEffect, useRef, useState } from 'react'
import { Attachment as AttachmentType, isFileAttachmentType } from '@/types'
import { AnimatePresence, motion, MotionConfig, Transition } from 'framer-motion'
import { useAtomValue } from 'jotai'
import useMeasure from 'react-use-measure'
import { useShallow } from 'zustand/react/shallow'

import { trackEvent } from '@/utils/amplitude'
import { getDisplayValue } from '@/utils/attachments'
import { sidePanelOpenAtom } from '@/atoms/side-panel'
import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import { useStore } from '@/components/providers/store-provider'

import { Attachment } from '../Attachment'
import { AttachmentDropdowns } from '../dropdowns/attachment-dropdowns'
import styles from './chatinput.module.scss'
import { InputDivider } from './InputDivider'
import InputFooter from './InputFooter'
import InputPromptActions from './InputPromptActions'

const MAX_INPUT_HEIGHT = 160

/**
 * This is the main Highlight Chat input box, not a reusable Input component.
 */
export const Input = ({ isActiveChat }: { isActiveChat: boolean }) => {
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
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [input, setInput] = useState('')
  const transcriptOpen = useAtomValue(sidePanelOpenAtom)

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
  }, [inputBlurTimeoutRef])

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
      <div className="flex w-full flex-col items-center gap-8">
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
          className={`${styles.inputContainer} ${isActiveChat ? styles.active : ''} min-h-[68px]`}
          onClick={focusInput}
        >
          <div ref={ref} className={`${styles.inputWrapper} flex-col justify-between`}>
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
                  className="h-6 max-h-[120px] w-full resize-none overflow-y-auto leading-6"
                />
              </div>
              <div onFocus={handleNonInputFocus}>
                <AttachmentDropdowns />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {attachments.length > 0 && (
                <div className={`${styles.attachmentsRow} mt-1.5`}>
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
                  <InputPromptActions input={input} />
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
