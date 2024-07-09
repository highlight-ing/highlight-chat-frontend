import { useEffect, useRef, useState } from 'react'
import { Attachment } from './Attachment'
import { AttachmentsButton } from './AttachmentsButton'
import { useInputContext } from '../context/InputContext'

const PLACEHOLDER_TEXT = 'Ask Highlight anything...'

interface InputProps {
  onSubmit: () => void
}

export const Input = ({ onSubmit }: InputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { attachment, setAttachment, input, setInput } = useInputContext()
  const inputRef = useRef<HTMLDivElement>(null)
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true)

  useEffect(() => {
    if (inputRef.current && isPlaceholderVisible) {
      inputRef.current.textContent = PLACEHOLDER_TEXT
    }
  }, [isPlaceholderVisible])

  const onFocusInput = () => {
    if (isPlaceholderVisible && inputRef.current) {
      inputRef.current.textContent = ''
      setIsPlaceholderVisible(false)
    }
  }

  const onBlurInput = () => {
    if (input.length === 0 && inputRef.current) {
      inputRef.current.textContent = PLACEHOLDER_TEXT
      setIsPlaceholderVisible(true)
    }
  }

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText
    setInput(content ?? '')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
      setInput('')

      if (inputRef.current) {
        inputRef.current.textContent = ''
      }
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

  return (
    <div className="flex flex-col gap-4 items-space-between bg-[#161617] rounded-lg border border-light-10 ml-[40px] px-4 py-3">
      {attachment?.value && (
        <div className="mb-2">
          {attachment.type === 'image' ? (
            <Attachment type="image" value={URL.createObjectURL(attachment.value)} />
          ) : (
            <Attachment type="pdf" value={attachment.value.name} />
          )}
        </div>
      )}
      <div className="flex flex-1 gap-3 items-center">
        <AttachmentsButton onClick={handleAttachmentClick} />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />
        <div
          contentEditable
          className={`flex outline-none text-base bg-transparent overflow-y-auto overflow-x-hidden max-h-36 min-h-6 ${
            !input ? 'text-light-60' : 'text-light'
          } cursor-auto`}
          ref={inputRef}
          onInput={onInput}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}
