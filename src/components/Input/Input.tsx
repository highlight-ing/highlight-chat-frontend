import { useEffect, useRef, useState } from 'react'
import { Attachment } from '../Attachment'
import { Attachment as AttachmentType, isFileAttachmentType } from '@/types'
import { useSubmitQuery } from '../../hooks/useSubmitQuery'
import { useStore } from '@/providers/store-provider'
import Highlight from '@highlight-ai/app-runtime'
import styles from './chatinput.module.scss'
import { getDisplayValue } from '@/utils/attachments'
import { useShallow } from 'zustand/react/shallow'
import { trackEvent } from '@/utils/amplitude'
import { AnimatePresence, motion, MotionConfig, Transition } from 'framer-motion'
import useMeasure from 'react-use-measure'
import InputPromptActions from './InputPromptActions'
import { AttachmentDropdowns } from '../dropdowns/attachment-dropdowns'
import InputFooter from './InputFooter'
import { BoxAdd } from 'iconsax-react'
import { InputDivider } from './InputDivider'
import { cn } from '@/lib/utils'

const MAX_INPUT_HEIGHT = 160

/**
 * This is the main Highlight Chat input box, not a reusable Input component.
 */
export const Input = ({ isActiveChat }: { isActiveChat: boolean }) => {
  const { attachments, inputIsDisabled, promptName, promptApp, removeAttachment, fileInputRef, isConversationLoading } =
    useStore(
      useShallow((state) => ({
        attachments: state.attachments,
        inputIsDisabled: state.inputIsDisabled,
        promptName: state.promptName,
        promptApp: state.promptApp,
        removeAttachment: state.removeAttachment,
        fileInputRef: state.fileInputRef,
        isConversationLoading: state.isConversationLoading,
      })),
    )
  const { handleSubmit } = useSubmitQuery()
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [input, setInput] = useState('')

  let inputRef = useRef<HTMLTextAreaElement>(null)
  let inputBlurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use to handle the auto closing when the window is focused
  // and to prevent toggling the input focus when pressing a dropdown
  useEffect(() => {
    let windowFocusTimeout: NodeJS.Timeout | null

    const onWindowFocus = () => {
      windowFocusTimeout = setTimeout(() => {
        inputRef.current?.focus()
        setIsInputFocused(true)
      }, 100)
    }

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

    window.addEventListener('focus', onWindowFocus)

    return () => {
      window.removeEventListener('focus', onWindowFocus)

      if (inputElement) {
        inputElement.removeEventListener('focus', onInputFocus)
        inputElement.removeEventListener('blur', onInputBlur)
      }

      if (windowFocusTimeout) clearTimeout(windowFocusTimeout)
      if (inputBlurTimeoutRef.current) clearTimeout(inputBlurTimeoutRef.current)
    }
  }, [inputRef, inputBlurTimeoutRef])

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

  const onClickContainer = () => {
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
          transition={{ ...inputTransition, duration: isInputFocused ? 0.2 : 0.25, delay: isInputFocused ? 0 : 0.15 }}
          className={`${styles.inputContainer} ${isActiveChat ? styles.active : ''} min-h-[68px]`}
          onClick={onClickContainer}
          onFocus={handleNonInputFocus}
        >
          <div ref={ref} className={`${styles.inputWrapper} flex-col justify-between`}>
            <div className="flex w-full items-end justify-between gap-2 pl-6 pr-4">
              <div className="grid h-9 place-items-center">
                <SearchIcon size={24} />
              </div>
              <div className="h-auto w-full">
                <textarea
                  id={'textarea-input'}
                  ref={inputRef}
                  disabled={isConversationLoading}
                  placeholder={
                    isConversationLoading
                      ? 'Loading new chat...'
                      : `Ask ${promptName ? promptName : 'Highlight AI'} anything...`
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-6 max-h-[120px] w-full resize-none overflow-y-auto leading-6"
                />
              </div>
              <AttachmentDropdowns isInputFocused={isInputFocused} inputRef={inputRef} />
            </div>

            <AnimatePresence mode="popLayout">
              {attachments.length > 0 && (
                <div className={`${styles.attachmentsRow} mt-1.5`}>
                  {attachments.map((attachment: AttachmentType, index: number) => (
                    <motion.div
                      initial={{ opacity: 0, filter: 'blur(4px)', y: -5 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      transition={{ ...inputTransition, delay: 0.15 }}
                    >
                      <Attachment
                        type={attachment.type}
                        value={getDisplayValue(attachment)}
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
                  <InputPromptActions />
                  <InputDivider />
                  <InputFooter />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {!isActiveChat && <BrowseShortcutsButton isInputFocused={isInputFocused} />}
      </div>
    </MotionConfig>
  )
}

function BrowseShortcutsButton({ isInputFocused }: { isInputFocused: boolean }) {
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
      onClick={handleOpenClick}
      disabled={isInputFocused}
      className={cn(
        'flex items-center gap-2 rounded-xl border border-tertiary px-3 py-1.5 text-sm font-medium text-tertiary opacity-0 transition hover:bg-hover',
        {
          'opacity-100': !isInputFocused,
        },
      )}
    >
      <span>Browse Shortcuts</span>
      <BoxAdd size={20} variant="Bold" className="opacity-80" />
    </button>
  )
}

export const useInputFocus = () => {
  return () => {
    const input = document.getElementById('textarea-input')
    input?.focus()
  }
}

export const SearchIcon = ({ size }: { size?: number }) => {
  return (
    <svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.01 20.02C15.9861 20.02 20.02 15.9861 20.02 11.01C20.02 6.03391 15.9861 2 11.01 2C6.03391 2 2 6.03391 2 11.01C2 15.9861 6.03391 20.02 11.01 20.02Z"
        fill="#B4B4B4"
      />
      <path
        d="M21.9901 18.95C21.6601 18.34 20.9601 18 20.0201 18C19.3101 18 18.7001 18.29 18.3401 18.79C17.9801 19.29 17.9001 19.96 18.1201 20.63C18.5501 21.93 19.3001 22.22 19.7101 22.27C19.7701 22.28 19.8301 22.28 19.9001 22.28C20.3401 22.28 21.0201 22.09 21.6801 21.1C22.2101 20.33 22.3101 19.56 21.9901 18.95Z"
        fill="#B4B4B4"
      />
    </svg>
  )
}
