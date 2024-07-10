import { useEffect, useRef, useState } from 'react'
import { Attachment } from './Attachment'
import { AttachmentsButton } from './AttachmentsButton'
import { useInputContext } from '../context/InputContext'
import { Attachment as AttachmentType } from '../types/types'
import { useSubmitQuery } from '../hooks/useSubmitQuery'

import styles from './ChatInput/chatinput.module.scss'

const PLACEHOLDER_TEXT = 'Ask Highlight anything...'
const MAX_INPUT_HEIGHT = 160

export const Input = () => {
  const { attachments, input, setInput, isDisabled } = useInputContext()
  const { handleSubmit } = useSubmitQuery()

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isDisabled && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
      setInput('')
    }
  }

  const onClickContainer = (e: React.MouseEvent) => {
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '0px'
      const scrollHeight = inputRef.current.scrollHeight

      const newHeight = scrollHeight > MAX_INPUT_HEIGHT ? MAX_INPUT_HEIGHT : scrollHeight
      inputRef.current.style.height = newHeight + 'px'
    }
  }, [inputRef, input])

  return (
    <div className={styles.inputContainer} onClick={onClickContainer}>
      {attachments.length > 0 &&
        <div className="flex gap-2">
          {attachments.map((attachment: AttachmentType, index: number) => (
            <Attachment
              type={attachment.type}
              value={attachment.type === 'pdf' ? attachment.value.name : attachment.value}
              removeEnabled
              key={index}
            />
          ))}
        </div>
      }
      <div className={styles.attachmentsButtonContainer}>
        <AttachmentsButton />
      </div>
      <textarea
        autoFocus={true}
        ref={inputRef}
        className=""
        onInput={(e) => setInput(e.currentTarget.value)}
        placeholder={PLACEHOLDER_TEXT}
        value={input}
        onKeyDown={handleKeyDown}
        rows={1}
      />
    </div>
  )
}
