import React, { useMemo } from 'react'

import { Message } from '@/components/Messages/Message'

const THINKING_MESSAGES = ['Hmm.. Let me think...', 'Working on it...', 'Just a moment...', 'Hang on a second...']

const ThinkingMessage = () => {
  const thinkingMessage = useMemo(() => {
    return THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
  }, [])
  // @ts-expect-error
  return <Message isThinking={true} message={{ role: 'assistant', content: thinkingMessage }} />
}

export default ThinkingMessage
