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
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const onRemoveAttachment = (attachment: AttachmentType) => {
    if (isFileAttachmentType(attachment.type) && fileInputRef?.current) {
      fileInputRef.current.value = ''
    }

    removeAttachment(attachment)
    trackEvent('HL Chat Attachment Removed', { type: attachment.type })
  }

  return (
    <div className={`${styles.inputContainer} ${isActiveChat ? styles.active : ''}`} onClick={onClickContainer}>
      <div className={styles.inputRow}>
        <AttachmentsButton />
        <textarea
          id={'textarea-input'}
          ref={inputRef}
          autoFocus={true}
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
    </div>
  )
}

export const useInputFocus = () => {
  return () => {
    const input = document.getElementById('textarea-input')
    input?.focus()
  }
}
