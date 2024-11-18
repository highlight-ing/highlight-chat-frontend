'use client'

import React from 'react'

import useAuth from '@/hooks/useAuth'
import { useStore } from '@/components/providers/store-provider'
import { checkForFollowUpFeedback, markFollowUpFeedbackAsShown } from '@/app/(app)/actions'

/**
 * Hook that adds a follow up feedback toast to the app.
 */
export function useShowFollowUpFeedbackToast() {
  const { getAccessToken } = useAuth()
  const addToast = useStore((state) => state.addToast)

  async function onShown() {
    const accessToken = await getAccessToken()
    await markFollowUpFeedbackAsShown(accessToken)
  }

  const toast = {
    title: "We'd love to talk to you!",
    description: "We'll happily pay you for a quick call about the product",
    timeout: 1000000,
    action: {
      label: 'Send details',
      onClick: () => {
        onShown()
        window.open('https://forms.gle/8sWMKKZUdwUVoLdR8', '_blank')
      },
    },
    onClose: async () => {
      onShown()
    },
  }

  React.useEffect(() => {
    const checkToPresentToast = async () => {
      const accessToken = await getAccessToken()

      const shouldPresentToast = await checkForFollowUpFeedback(accessToken)

      if (shouldPresentToast) {
        addToast(toast)
      }
    }

    checkToPresentToast()
  }, [])
}
