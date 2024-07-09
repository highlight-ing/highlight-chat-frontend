import React, { createContext, useContext, useState } from 'react'
import { Attachment } from '../types/types'

interface InputContextProps {
  attachment?: Attachment
  setAttachment: (attachment: Attachment | undefined) => void
  input: string
  setInput: (input: string) => void
}

export const InputContext = createContext<InputContextProps>({
  attachment: undefined,
  setAttachment: () => {},
  input: '',
  setInput: () => {}
})

export const InputContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined)
  const [input, setInput] = useState('')

  return (
    <InputContext.Provider value={{ attachment, setAttachment, input, setInput }}>{children}</InputContext.Provider>
  )
}

export const useInputContext = () => {
  return useContext(InputContext)
}
