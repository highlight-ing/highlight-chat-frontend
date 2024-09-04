'use client'

import Highlight from '@highlight-ai/app-runtime'
import { useEffect } from 'react'
import { useStore } from '@/providers/store-provider'
import { useRouter } from 'next/navigation'
import usePromptApps from '@/hooks/usePromptApps'

const useOnExternalMessage = () => {
  const router = useRouter()
  //   const { setActiveApp } = useStore()
  //   const { handlePromptApp } = usePromptApps()

  useEffect(() => {
    const removeListener = Highlight.app.addListener('onExternalMessage', (message: string) => {
      console.log('Received external message:', message)
    })

    // Clean up the listener when the component unmounts
    return () => {
      removeListener()
    }
  }, [router])
}

export default useOnExternalMessage
