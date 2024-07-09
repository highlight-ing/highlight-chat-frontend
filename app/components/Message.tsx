import { HighlightContext } from '@highlight-ai/app-runtime'
import { AssistantIcon } from '../icons/icons'
import { Message as MessageType, UserMessage } from '../types/types'

import ReactMarkdown from 'react-markdown'
import { Attachment } from './Attachment'

const hasAttachment = (message: UserMessage) => {
  return message.screenshot || message.clipboardText || message.window || message.fileTitle
}

interface MessageProps {
  message: MessageType
}

export const Message = ({ message }: MessageProps) => {
  console.log('Message:', message)
  return (
    <div className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.type === 'assistant' && (
        <div className="flex-shrink-0 mr-2">
          <div className="flex w-[32px] h-[32px] p-[6px] justify-center items-center rounded-full bg-[#161617]">
            <AssistantIcon className="text-[#FFFFFF66]" />
          </div>
        </div>
      )}
      <div
        className={`
            flex justify-center gap-4 p-5 flex-col
            rounded-lg border border-light-10 bg-[#161617]
            max-w-[80%]
            ${message.type === 'user' ? 'items-end' : 'items-start'}
          `}
      >
        {message.type === 'user' && hasAttachment(message as UserMessage) && (
          <div className={`flex gap-2`}>
            {message.screenshot && <Attachment type="image" value={message.screenshot} />}
            {message.audio && <Attachment type="audio" value={message.audio} />}
            {message.clipboardText && <Attachment type="clipboard" value={message.clipboardText} />}
            {message.fileTitle && <Attachment type="pdf" value={message.fileTitle} />}
          </div>
        )}
        <div
          className={`text-[rgba(255,255,255,0.60)] font-normal leading-[150%] break-words ${
            message.type === 'user' ? 'text-right' : 'text-left'
          }`}
        >
          <ReactMarkdown>{typeof message.content === 'string' ? message.content : ''}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
