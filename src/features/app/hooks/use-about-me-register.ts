'use client'

import React from 'react'
import Highlight from '@highlight-ai/app-runtime'

import { useStore } from '@/components/providers/store-provider'

/**
 * Hook that automatically registers the about me data when the app mounts or when a new message is sent.
 */
export function useAboutMeRegister() {
  const setAboutMe = useStore((state) => state.setAboutMe)
  const lastMessageSentTimestamp = useStore((state) => state.lastMessageSentTimestamp)

  React.useEffect(() => {
    const getAboutMe = async () => {
      const aboutMe = await Highlight.user.getFacts()
      if (aboutMe?.length > 0) {
        setAboutMe(aboutMe)
      }
    }
    getAboutMe()
  }, [lastMessageSentTimestamp])
}
