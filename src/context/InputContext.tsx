import React, { createContext, useContext, useRef, useState } from 'react'
import { Attachment } from '../types/types'

interface InputContextProps {
  attachments: Attachment[]
  addAttachment: (attachment: Attachment) => void
  removeAttachment: (attachmentType: string) => void
  clearAttachments: () => void
  input: string
  setInput: (input: string) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  isDisabled: boolean
  setIsDisabled: (isDisabled: boolean) => void
}

export const InputContext = createContext<InputContextProps>({
  attachments: [],
  addAttachment: () => {},
  removeAttachment: () => {},
  clearAttachments: () => {},
  input: '',
  setInput: () => {},
  fileInputRef: { current: null },
  isDisabled: false,
  setIsDisabled: () => {}
})

export const InputContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [input, setInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDisabled, setIsDisabled] = useState(false)

  const addAttachment = (attachment: Attachment) => {
    // Clear fileInputRef if replacing an uploaded image with a screenshot url
    if (attachment.type === 'image' && fileInputRef.current) {
      if (attachments.find((a) => a.type === 'image' && a.file)) {
        fileInputRef.current.value = ''
      }
    }

    setAttachments((attachments) => [...attachments.filter((a) => a.type !== attachment.type), attachment])
  }

  const removeAttachment = (attachmentType: string) => {
    // reset file input value if attachment is pdf or file
    const attachment = attachments.find((a) => a.type === attachmentType)
    if (
      attachment &&
      fileInputRef.current &&
      (attachment.type === 'pdf' || ('file' in attachment && attachment.file))
    ) {
      fileInputRef.current.value = ''
    }

    setAttachments((attachments) => attachments.filter((a) => a.type !== attachmentType))
  }

  const clearAttachments = () => {
    setAttachments([])
  }

  return (
    <InputContext.Provider
      value={{
        attachments,
        addAttachment,
        removeAttachment,
        clearAttachments,
        input,
        setInput,
        fileInputRef,
        isDisabled,
        setIsDisabled
      }}
    >
      {children}
    </InputContext.Provider>
  )
}

export const useInputContext = () => {
  return useContext(InputContext)
}
