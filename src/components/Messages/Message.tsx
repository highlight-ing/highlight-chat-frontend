import Markdown from 'react-markdown'
import remarkGfm from "remark-gfm";
import {Fragment} from "react";

import { AssistantIcon } from "@/icons/icons";
import { Message as MessageType, UserMessage } from "../../types";
import { Attachment } from "../Attachment";

import styles from "./message.module.scss";
import TypedText from "@/components/TypedText/TypedText";
import CodeBlock from "@/components/Messages/CodeBlock";

const hasAttachment = (message: UserMessage) => {
  return (
    message.screenshot ||
    message.clipboard_text ||
    message.window ||
    message.file_title ||
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
              {message.file_title && (
                <Attachment type="pdf" value={message.file_title} />
              )}
              {message.image_url && (
                <Attachment type="image" value={message.image_url} />
              )}
            </div>
          )}
          <div className={styles.messageBody}>
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                // @ts-ignore
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <CodeBlock
                      language={match[1]}
                    >
                      {children}
                    </CodeBlock>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                td({children}) {
                  if (typeof children === 'string') {
                    return <td>{children}</td>
                  }
                  return (
                    <td>
                      {/*// @ts-ignore*/}
                      {children.map((child, index) => (
                        <Fragment key={index}>
                          {child === '<br>' ? <br/> : child}
                        </Fragment>
                      ))}
                    </td>
                  )
                }
              }}
              // remarkToRehypeOptions={{
              //   allowDangerousHtml: true
              // }}
              // rehypeReactOptions={{
              //   components: {
              //     code: (props: any) => {
              //       const match = /language-(\w+)/.exec(props.className || '')
              //       if (match) {
              //         return (
              //           <CodeBlock language={match[1]}>
              //             {props.children}
              //           </CodeBlock>
              //         )
              //       }
              //       return <code {...props}/>
              //     }
              // }}}
            >
              {typeof message.content === "string" ? message.content : ""}
            </Markdown>
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
