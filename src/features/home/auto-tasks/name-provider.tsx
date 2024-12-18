import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import Highlight from '@highlight-ai/app-runtime'

// Define the shape of the context's value
interface NameContextType {
  name: string
  handleNameUpdate: (newName: string) => Promise<void>
}

const defaultContextValue: NameContextType = {
  name: '',
  handleNameUpdate: async () => { }, // Provide a no-op function
}

const NameContext = createContext<NameContextType>(defaultContextValue)

export function useName() {
  return useContext(NameContext)
}

interface NameProviderProps {
  children: ReactNode
}

export const NameProvider: React.FC<NameProviderProps> = ({ children }) => {
  const [name, setName] = useState<string>('')

  useEffect(() => {
    async function fetchName() {
      const fetchedName = await Highlight.appStorage.get('name')
      setName(fetchedName)
    }
    fetchName()
  }, [])

  const handleNameUpdate = async (newName: string) => {
    await Highlight.appStorage.set('name', newName)
    setName(newName)
  }

  return <NameContext.Provider value={{ name, handleNameUpdate }}>{children}</NameContext.Provider>
}
