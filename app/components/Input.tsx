import { useEffect, useRef, useState } from 'react'
import { Attachment } from './Attachment'
import { AttachmentsButton } from './AttachmentsButton'
import { useInputContext } from '../context/InputContext'
import { Attachment as AttachmentType } from '../types/types'
import { useSubmitQuery } from '../hooks/useSubmitQuery'

const PLACEHOLDER_TEXT = 'Ask Highlight anything...'
const MAX_INPUT_HEIGHT = 80

export const Input = () => {
  const { attachments, addAttachment, input, setInput } = useInputContext()
  const { isWorking, handleSubmit } = useSubmitQuery()

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
      setInput('')
    }
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
    <div className="flex flex-col gap-2 items-space-between justify-center bg-[#161617] rounded-lg border border-light-10 ml-[40px] px-4 py-4 h-fit min-h-16">
      <div className="flex gap-2">
        {attachments.map((attachment: AttachmentType, index: number) => (
          <Attachment
            type={attachment.type}
            value={attachment.type === 'pdf' ? attachment.value.name : attachment.value}
            key={index}
          />
        ))}
      </div>
      <div className="flex flex-1 gap-3 items-center h-fit">
        <AttachmentsButton />
        <textarea
          ref={inputRef}
          className="flex text-sm w-full outline-none resize-none border-0 bg-transparent max-h-80 h-[15px] my-2 leading-4"
          onInput={(e) => setInput(e.currentTarget.value)}
          placeholder={PLACEHOLDER_TEXT}
          value={input}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}
