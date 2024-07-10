import { AssistantIcon } from '../../icons/icons'
import { Message as MessageType, UserMessage } from '../../types/types'
import ReactMarkdown from 'react-markdown'
import { Attachment } from '../Attachment'

import styles from './message.module.scss'

const hasAttachment = (message: UserMessage) => {
  return message.screenshot || message.clipboardText || message.window || message.fileTitle || message.audio
}

interface MessageProps {
  isFirst: boolean
  message: MessageType
}

export const Message = ({ message, isFirst }: MessageProps) => {
  return (
    <div className={`${styles.messageContainer} ${message.type === 'user' ? styles.self : ''} ${isFirst ? styles.first : ''}`}>
      <div className={styles.message}>
        {message.type === 'assistant' && (
          <div className={styles.avatar}>
            <AssistantIcon />
          </div>
        )}
        {message.type === 'user' && hasAttachment(message as UserMessage) && (
          <div className={`flex gap-2`}>
            {message.screenshot && <Attachment type="image" value={message.screenshot} />}
            {message.audio && <Attachment type="audio" value={message.audio} />}
            {message.clipboardText && <Attachment type="clipboard" value={message.clipboardText} />}
            {message.fileTitle && <Attachment type="pdf" value={message.fileTitle} />}
          </div>
        )}
        <div className={styles.messageBody}>
          <ReactMarkdown>{typeof message.content === 'string' ? message.content : ''}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
