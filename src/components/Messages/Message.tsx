import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import React, { Fragment } from 'react'
import variables from '@/variables.module.scss'
import { AssistantIcon, PersonalizeIcon } from '@/icons/icons'
import { Message as MessageType, UserMessage } from '../../types'
import { Attachment } from '../Attachment'

import globalStyles from '@/global.module.scss'
import styles from './message.module.scss'
import TypedText from '@/components/TypedText/TypedText'
import CodeBlock from '@/components/Messages/CodeBlock'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import Button from '@/components/Button/Button'

// @ts-ignore
import { BlockMath, InlineMath } from 'react-katex'
import { getDisplayValue } from '@/utils/attachments'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import { MessageText } from 'iconsax-react'
import { useStore } from '@/providers/store-provider'

const hasAttachment = (message: UserMessage) => {
  return (
    message.screenshot ||
    message.clipboard_text ||
    message.window_context ||
    message.window ||
    message.file_title ||
    message.audio ||
    message.image_url ||
    (message.file_attachments && message.file_attachments.length > 0)
  )
}

interface MessageProps {
  isThinking?: boolean
  message: MessageType
}

/**
 * LLMs spit out formulas with delimiters that katex doesn't recognize.
 * In this case, we try to replace it with `$$` delimiters.
 *
 * Thanks to @prashantbhudwal on GitHub:
 * https://github.com/remarkjs/react-markdown/issues/785#issuecomment-1966495891
 *
 * @param content
 */
const preprocessLaTeX = (content: string) => {
  // Replace block-level LaTeX delimiters \[ \] with $$ $$
  const blockProcessedContent = content.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`)
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(/\\\((.*?)\\\)/g, (_, equation) => `$${equation}$`)
  return inlineProcessedContent
}

export const Message = ({ message, isThinking }: MessageProps) => {
  const promptApp = useStore((state) => state.promptApp)
  return (
    <div className={`${styles.messageContainer} ${message.role === 'user' ? styles.self : ''}`}>
      {message.role === 'assistant' && (
        <div className={styles.avatar}>
          {/* @todo icon type */}
          <div
            className={`${globalStyles.promptIcon} ${promptApp && promptApp.image && promptApp.user_images?.file_extension ? globalStyles.none : globalStyles.self}`}
            style={{ '--size': '32px' } as React.CSSProperties}
          >
            {promptApp && promptApp.image && promptApp.user_images?.file_extension ? (
              <PromptAppIcon
                width={32}
                height={32}
                imageId={promptApp!.image!}
                imageExtension={promptApp!.user_images?.file_extension ?? ''}
              />
            ) : promptApp ? (
              <MessageText variant={'Bold'} size={16} />
            ) : (
              <AssistantIcon />
            )}
          </div>
        </div>
      )}
      {!isThinking ? (
        <div className={styles.message}>
          {message.role === 'user' && hasAttachment(message as UserMessage) && (
            <div className={`flex gap-2`}>
              {message.screenshot && <Attachment type="image" value={message.screenshot} />}
              {message.audio && <Attachment type="audio" value={message.audio} />}
              {message.window && message.window?.title && (
                <Attachment type="window" value={message.window.title} appIcon={message.window.appIcon} />
              )}
              {message.clipboard_text && <Attachment type="clipboard" value={message.clipboard_text} />}
              {message.file_title && <Attachment type="pdf" value={message.file_title} />}
              {message.image_url && <Attachment type="image" value={message.image_url} />}
              {message.file_attachments &&
                message.file_attachments.map((a) => {
                  return <Attachment type={a.type} value={getDisplayValue(a)} />
                })}
              {message.window_context && <Attachment type="window_context" value={message.window_context} />}
            </div>
          )}
          <div className={styles.messageBody}>
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                a({ children, href }) {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  )
                },
                // @ts-ignore
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isStringWithNewlines = typeof children === 'string' && children.includes('\n')
                  if ((!inline && match) || isStringWithNewlines) {
                    return <CodeBlock language={match?.[1] ?? 'plaintext'}>{children}</CodeBlock>
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                td({ children }) {
                  if (typeof children === 'string') {
                    return <td>{children}</td>
                  }
                  if (Array.isArray(children)) {
                    return (
                      <td>
                        {/*// @ts-ignore*/}
                        {children.map((child, index) => (
                          <Fragment key={index}>{child === '<br>' ? <br /> : child}</Fragment>
                        ))}
                      </td>
                    )
                  }
                  return <td>{children}</td>
                },
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
              {typeof message.content === 'string' ? preprocessLaTeX(message.content) : ''}
            </Markdown>
          </div>
          {message.personalize && (
            <Button
              size="large"
              variant="ghost"
              onClick={() => {
                window.open('highlight://settings/about-me', '_blank')
              }}
            >
              <PersonalizeIcon size={24} color={variables.light80} />
              <span className={styles.personalizeText}>Personalize your About Me</span>
            </Button>
          )}
        </div>
      ) : (
        <span className={styles.thinking}>
          <TypedText text={message.content} cursor={false} speed={1.5} />
        </span>
      )}
    </div>
  )
}
