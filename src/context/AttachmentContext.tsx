import React, { createContext, useContext, useState } from 'react'

interface AttachmentContextProps {
  attachment: string | undefined
  setAttachment: (attachment: string | undefined) => void
}

export const AttachmentContext = createContext<AttachmentContextProps>({
  attachment: undefined,
  setAttachment: () => {},
})

export const AttachmentContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [attachment, setAttachment] = useState<string | undefined>(undefined)

  return <AttachmentContext.Provider value={{ attachment, setAttachment }}>{children}</AttachmentContext.Provider>
}

export const useAttachmentContext = () => {
  return useContext(AttachmentContext)
}
