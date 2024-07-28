import { useEffect, useRef } from 'react'
import { Attachment } from '../Attachment'
import { AttachmentsButton } from '../AttachmentsButton/AttachmentsButton'
import { Attachment as AttachmentType } from '@/types'
import { useSubmitQuery } from '../../hooks/useSubmitQuery'
import { useStore } from '@/providers/store-provider'

import styles from './chatinput.module.scss'
import * as React from 'react'
import { HighlightIcon } from '@/icons/icons'
import { getDurationUnit } from '@/utils/string'

const MAX_INPUT_HEIGHT = 160

/**
 * The space above the actual input that shows the Highlight/prompt logo or name.
 */
function InputHeading() {
  const { promptName, promptDescription } = useStore((state) => ({
    promptName: state.promptName,
    promptDescription: state.promptDescription
  }))

  if (!promptName || !promptDescription) {
    return <HighlightIcon />
  }

  return (
    <div className="flex flex-col gap-1 text-center">
      <h3 className="text-xl text-light-40">{promptName}</h3>
      <p className="text-light-60">{promptDescription}</p>
    </div>
  )
}

/**
 * This is the main Highlight Chat input box, not a reusable Input component.
 */
export const Input = ({ offset }: { offset: boolean }) => {
  const { attachments, input, setInput, inputIsDisabled, promptName, prompt } = useStore((state) => ({
    attachments: state.attachments,
    input: state.input,
    setInput: state.setInput,
    inputIsDisabled: state.inputIsDisabled,
    promptName: state.promptName,
    prompt: state.prompt
  }))

  const { handleSubmit } = useSubmitQuery()

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputIsDisabled && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(prompt)
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

  const getValue = (attachment: AttachmentType) => {
    switch (attachment.type) {
      case 'pdf':
        return attachment.value.name
      case 'audio':
        return `Last ${
          attachment.duration % 60 === 0 ? attachment.duration / 60 : attachment.duration
        } ${getDurationUnit(attachment.duration, attachment.duration % 60 === 0 ? 'hours' : 'minutes')}:\n${
          attachment.value
        }`
      default:
        return attachment.value
    }
  }

  return (
    <div className={`${styles.inputContainer} ${offset ? styles.offset : ''}`} onClick={onClickContainer}>
      <div className={`${styles.empty} ${!offset ? styles.hide : ''}`}>
        <InputHeading />
      </div>
      {attachments.length > 0 && (
        <div className="flex gap-2">
          {attachments.map((attachment: AttachmentType, index: number) => (
            <Attachment
              type={attachment.type}
              value={getValue(attachment)}
              isFile={attachment.type === 'pdf' || (attachment.type === 'image' && !!attachment.file)}
              removeEnabled
              key={index}
            />
          ))}
        </div>
      )}
      <div className={styles.attachmentsButtonContainer}>
        <AttachmentsButton />
      </div>
      <textarea
        ref={inputRef}
        autoFocus={true}
        placeholder={`Ask ${promptName ? promptName : 'Highlight'} anything...`}
        value={input}
        rows={1}
        onInput={(e) => setInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
