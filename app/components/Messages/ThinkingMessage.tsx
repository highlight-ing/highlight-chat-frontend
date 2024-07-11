import {Message} from "@/app/components/Messages/Message";
import React, {useMemo} from "react";

const THINKING_MESSAGES = [
  'Hmm.. Let me think...',
  'Working on it...',
  'Just a moment...',
  'Hang on a second...'
]

const ThinkingMessage = () => {
  const thinkingMessage = useMemo(() => {
    return THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
  }, [])
  return (
    <Message
      isThinking={true}
      message={{type: 'assistant', content: thinkingMessage}}
    />
  )
}

export default ThinkingMessage
