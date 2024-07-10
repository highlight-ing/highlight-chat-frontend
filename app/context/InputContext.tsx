import React, { createContext, useContext, useState } from 'react'
import { Attachment } from '../types/types'

interface InputContextProps {
  attachments: Attachment[]
  addAttachment: (attachment: Attachment) => void
  removeAttachment: (attachmentType: string) => void
  clearAttachments: () => void
  input: string
  setInput: (input: string) => void
}

export const InputContext = createContext<InputContextProps>({
  attachments: [],
  addAttachment: () => {},
  removeAttachment: () => {},
  clearAttachments: () => {},
  input: '',
  setInput: () => {}
})

export const InputContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [input, setInput] = useState('')

  const addAttachment = (attachment: Attachment) => {
    setAttachments((attachments) => [...attachments.filter((a) => a.type !== attachment.type), attachment])
  }

  const removeAttachment = (attachmentType: string) => {
    setAttachments((attachments) => attachments.filter((a) => a.type !== attachmentType))
  }

  const clearAttachments = () => {
    setAttachments([])
  }

  return (
    <InputContext.Provider value={{ attachments, addAttachment, removeAttachment, clearAttachments, input, setInput }}>
      {children}
    </InputContext.Provider>
  )
}

export const useInputContext = () => {
  return useContext(InputContext)
}
