'use client'

import React from 'react'
import Highlight from '@highlight-ai/app-runtime'

/**
 * Hook that checks if highlight is running and redirects if not.
 */
export function useCheckHighlightIsRunning() {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !Highlight.isRunningInHighlight()) {
      window.location.href = 'https://highlight.ing/apps/highlightchat'
    }
  }, [])
}
