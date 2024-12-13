'use client'

import React from 'react'

import { trackEvent } from '@/utils/amplitude'

export function useIsVisibleWithEventTracking(isShowing: boolean) {
  const [isVisible, setIsVisible] = React.useState(isShowing)

  React.useEffect(() => {
    if (isShowing) {
      setIsVisible(true)
      trackEvent('HL Chat Home Viewed', {})
    } else {
      setTimeout(() => {
        setIsVisible(false)
      }, 300)
      trackEvent('HL Chat Home Hidden', {})
    }
  }, [isShowing])

  return isVisible
}
