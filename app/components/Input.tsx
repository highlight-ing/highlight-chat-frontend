import { useEffect, useRef, useState } from 'react'
import { Attachment } from './Attachment'
import { AttachmentsButton } from './AttachmentsButton'
import { useInputContext } from '../context/InputContext'

const PLACEHOLDER_TEXT = 'Ask Highlight anything...'
const MAX_INPUT_HEIGHT = 80

interface InputProps {
  onSubmit: () => void
}

export const Input = ({ onSubmit }: InputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { attachment, setAttachment, input, setInput } = useInputContext()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
      setInput('')
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setAttachment({
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        value: file
      })
    } else {
      alert('Please select a valid image or PDF file.')
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
    <div className="flex flex-col gap-2 items-space-between justify-center bg-[#161617] rounded-lg border border-light-10 ml-[40px] px-4 py-4 h-auto min-h-16">
      {attachment?.value && (
        <div className="">
          {attachment.type === 'image' ? (
            <Attachment type="image" value={URL.createObjectURL(attachment.value)} />
          ) : (
            <Attachment type="pdf" value={attachment.value.name} />
          )}
        </div>
      )}
      <div className="flex flex-1 gap-3 items-center h-fit">
        <AttachmentsButton onClick={handleAttachmentClick} />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />
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
