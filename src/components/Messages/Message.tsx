import { Remark } from "react-remark";

// @ts-ignore
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { AssistantIcon } from "@/icons/icons";
import { Message as MessageType, UserMessage } from "../../types";
import { Attachment } from "../Attachment";
import { AttachmentType } from '@/types';

import styles from "./message.module.scss";
import TypedText from "@/components/TypedText/TypedText";
import CodeBlock from "@/components/Messages/CodeBlock";

const hasAttachment = (message: UserMessage) => {
  return (
    message.screenshot ||
    message.clipboard_text ||
    message.window ||
    message.fileTitle ||
    message.audio || 
    message.image_url
  );
};

interface MessageProps {
  isThinking?: boolean;
  message: MessageType;
}

export const Message = ({ message, isThinking }: MessageProps) => {
  return (
    <div
      className={`${styles.messageContainer} ${
        message.role === "user" ? styles.self : ""
      }`}
    >
      {message.role === "assistant" && (
        <div className={styles.avatar}>
          <AssistantIcon />
        </div>
      )}
      {!isThinking ? (
        <div className={styles.message}>
          {message.role === "user" && hasAttachment(message as UserMessage) && (
            <div className={`flex gap-2`}>
              {message.screenshot && (
                <Attachment type="image" value={message.screenshot} />
              )}
              {message.audio && (
                <Attachment type="audio" value={message.audio} />
              )}
              {message.window && message.window?.title && (
                <Attachment type="window" value={message.window.title} />
              )}
              {message.clipboard_text && (
                <Attachment type="clipboard" value={message.clipboard_text} />
              )}
              {message.fileTitle && (
                <Attachment type="pdf" value={message.fileTitle} />
              )}
              {message.image_url && (
                <Attachment type="image" value={message.image_url} />
              )}
            </div>
          )}
          <div className={styles.messageBody}>
            <Remark rehypeReactOptions={{
              components: {
                code: (props: any) => {
                  const match = /language-(\w+)/.exec(props.className || '')
                  if (match) {
                    return (
                      <CodeBlock language={match[1]}>
                        {props.children}
                      </CodeBlock>
                    )
                  }
                  return <code {...props}/>
                }
              }
            }}>
              {typeof message.content === "string" ? message.content : ""}
            </Remark>
          </div>
        </div>
      ) : (
        <span className={styles.thinking}>
          <TypedText text={message.content} cursor={false} speed={1.5} />
        </span>
      )}
    </div>
  );
};