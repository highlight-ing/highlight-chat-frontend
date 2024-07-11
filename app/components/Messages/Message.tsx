import { AssistantIcon } from '../../icons/icons'
import { Message as MessageType, UserMessage } from '../../types/types'
// import Markdown from 'markdown-to-jsx'
import { Remark } from 'react-remark';
import { Attachment } from '../Attachment'

import styles from './message.module.scss'
import TypedText from "@/app/components/TypedText/TypedText";
import {PropsWithChildren} from "react";

const hasAttachment = (message: UserMessage) => {
  return message.screenshot || message.clipboardText || message.window || message.fileTitle || message.audio
}

interface MessageProps {
  isFirst?: boolean
  isThinking?: boolean
  message: MessageType
}

export const Message = ({ message, isFirst, isThinking }: MessageProps) => {
  return (
    <div className={`${styles.messageContainer} ${message.type === 'user' ? styles.self : ''} ${isFirst ? styles.first : ''}`}>
      {message.type === 'assistant' && (
        <div className={styles.avatar}>
          <AssistantIcon />
        </div>
      )}
      {
        !isThinking
          ? <div className={styles.message}>
            {message.type === 'user' && hasAttachment(message as UserMessage) && (
              <div className={`flex gap-2`}>
                {message.screenshot && <Attachment type="image" value={message.screenshot} />}
                {message.audio && <Attachment type="audio" value={message.audio} />}
                {message.clipboardText && <Attachment type="clipboard" value={message.clipboardText} />}
                {message.fileTitle && <Attachment type="pdf" value={message.fileTitle} />}
              </div>
            )}
            <div className={styles.messageBody}>
              <Remark>{typeof message.content === 'string' ? message.content : ''}</Remark>
            </div>
          </div>
          : <span className={styles.thinking}><TypedText text={message.content} cursor={false} speed={1.5}/></span>
      }
    </div>
  )
}
