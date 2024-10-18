import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Attachment } from '../Attachment'
import { AttachmentsButton } from '../AttachmentsButton/AttachmentsButton'
import { Attachment as AttachmentType, isFileAttachmentType } from '@/types'
import { useSubmitQuery } from '../../hooks/useSubmitQuery'
import { useStore } from '@/providers/store-provider'

import styles from './chatinput.module.scss'
import { getDisplayValue } from '@/utils/attachments'
import { useShallow } from 'zustand/react/shallow'
import { trackEvent } from '@/utils/amplitude'
import { AnimatePresence, motion, MotionConfig, Transition, Variants } from 'framer-motion'
import useMeasure from 'react-use-measure'

const MAX_INPUT_HEIGHT = 160

/**
 * This is the main Highlight Chat input box, not a reusable Input component.
 */
export const Input = ({ isActiveChat }: { isActiveChat: boolean }) => {
  const { attachments, inputIsDisabled, promptName, promptApp, removeAttachment, fileInputRef } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      inputIsDisabled: state.inputIsDisabled,
      promptName: state.promptName,
      promptApp: state.promptApp,
      removeAttachment: state.removeAttachment,
      fileInputRef: state.fileInputRef,
    })),
  )
  const [isInputFocused, setIsInputFocused] = useState(false)

  const storeInput = useStore((state) => state.input)
  const [input, setInput] = useState(storeInput ?? '')

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { handleSubmit } = useSubmitQuery()

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputIsDisabled && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input, promptApp)
      setInput('')
    }
  }

  const onClickContainer = (e: React.MouseEvent) => {
    inputRef.current?.focus()
    trackEvent('HL Chat Input Focused', {})
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '0px'
      const scrollHeight = inputRef.current.scrollHeight

      const newHeight = scrollHeight > MAX_INPUT_HEIGHT ? MAX_INPUT_HEIGHT : scrollHeight
      inputRef.current.style.height = newHeight + 'px'
    }
  }, [inputRef, input])

  useEffect(() => {
    setInput(storeInput)
  }, [storeInput])

  useEffect(() => {
    const onFocus = () => {
      inputRef.current?.focus()
      console.log('HERE')
    }
    window.addEventListener('focus', onFocus)
    setIsInputFocused(true)
    return () => {
      window.removeEventListener('focus', onFocus)
      setIsInputFocused(false)
    }
  }, [])

  const onRemoveAttachment = (attachment: AttachmentType) => {
    if (isFileAttachmentType(attachment.type) && fileInputRef?.current) {
      fileInputRef.current.value = ''
    }

    removeAttachment(attachment)
    trackEvent('HL Chat Attachment Removed', { type: attachment.type })
  }

  const [ref, bounds] = useMeasure()

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

  const transition: Transition = { type: 'spring', duration: 0.25, bounce: 0 }

  return (
    <MotionConfig transition={transition}>
      <motion.div
        animate={{ height: bounds.height }}
        transition={{ ...transition, delay: isInputFocused ? 0 : 0.05 }}
        className={`${styles.inputContainer} ${isActiveChat ? styles.active : ''}`}
        onClick={onClickContainer}
      >
        <div ref={ref} className={styles.inputWrapper}>
          <div className={styles.inputRow}>
            <AttachmentsButton />
            <SearchIcon size={24} />
            <textarea
              id={'textarea-input'}
              ref={inputRef}
              autoFocus={true}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={`Ask ${promptName ? promptName : 'Highlight'} anything...`}
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          {attachments.length > 0 && (
            <div className={styles.attachmentsRow}>
              {attachments.map((attachment: AttachmentType, index: number) => (
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
              ))}
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {isInputFocused && (
              <motion.div
                variants={actionItemContainerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-1"
              >
                <motion.div
                  variants={actionItemVariants}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 hover:bg-black/20"
                >
                  <SearchIcon />
                  <h3>Summarize:</h3>
                  <p className="text-white/40">what I'm seeing</p>
                </motion.div>
                <motion.div
                  variants={actionItemVariants}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 hover:bg-black/20"
                >
                  <SearchIcon />
                  <h3>Explain:</h3>
                  <p className="text-white/40">what I'm seeing</p>
                </motion.div>
                <motion.div
                  variants={actionItemVariants}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 hover:bg-black/20"
                >
                  <SearchIcon />
                  <h3>Rewrite:</h3>
                  <p className="text-white/40">what I'm seeing</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  )
}

export const useInputFocus = () => {
  return () => {
    const input = document.getElementById('textarea-input')
    input?.focus()
  }
}

function SearchIcon(props: { size?: number }) {
  return (
    <svg
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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
