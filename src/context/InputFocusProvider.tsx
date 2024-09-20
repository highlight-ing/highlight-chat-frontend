import React, { createContext, useContext, useCallback, useRef } from 'react'

interface InputFocusContextType {
  focusInput: () => void
  inputRef: React.RefObject<HTMLTextAreaElement>
}

const InputFocusContext = createContext<InputFocusContextType | undefined>(undefined)

export const InputFocusProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return <InputFocusContext.Provider value={{ focusInput, inputRef }}>{children}</InputFocusContext.Provider>
}

export const useInputFocus = () => {
  const context = useContext(InputFocusContext)
  if (!context) {
    throw new Error('useInputFocus must be used within an InputFocusProvider')
  }
  return context
}
