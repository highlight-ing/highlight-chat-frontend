import React, { Fragment, useState } from 'react'
import globalStyles from '@/global.module.scss'
import variables from '@/variables.module.scss'
import Highlight from '@highlight-ai/app-runtime'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { AssistantIcon, PersonalizeIcon } from '@/components/icons'
import CodeBlock from '@/components/Messages/CodeBlock'
import TypedText from '@/components/TypedText/TypedText'

import { Message as MessageType, UserMessage } from '../../types'
import { Attachment } from '../Attachment'
import styles from './message.module.scss'

import 'katex/dist/katex.min.css'

import { getDisplayValue } from '@/utils/attachments'
import { AttachedContextContextTypes } from '@/utils/formDataUtils'
import { MessageText } from 'iconsax-react'

import Button from '@/components/Button/Button'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import { useStore } from '@/components/providers/store-provider'

import { useIntegration } from '@/features/integrations/_hooks/use-integration'

import AssistantMessageButton from './AssistantMessageButton'

const hasAttachment = (message: UserMessage) => {
  return (
    message.screenshot ||
    message.clipboard_text ||
    message.window_context ||
    message.window ||
    message.file_title ||
    message.audio ||
    message.image_url ||
    (message.file_attachments && message.file_attachments.length > 0) ||
    (message.attached_context?.length ?? 0) > 0
  )
}

interface MessageProps {
  isThinking?: boolean
  message: MessageType
}

const FactButton = ({ factIndex, fact }: { factIndex?: number; fact?: string }) => {
  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    setClicked(true)
    console.log('handleClick func fact: ', fact, 'factIndex: ', factIndex)
    if (typeof factIndex === 'number' && fact) {
      // If update
      Highlight.user.updateFact(factIndex, fact)
    } else if (fact) {
      Highlight.user.addFact(fact)
    }
    window.open('highlight://about-me', '_blank')
  }

  if (clicked || (!factIndex && !fact)) {
    return null
  }

  let buttonText = 'Personalize your About Me'
  if (typeof factIndex === 'number' && fact) {
    buttonText = 'Update About Me'
  } else if (fact) {
    buttonText = 'Add info to your About Me'
  }

  return (
    <Button size="large" variant="ghost" onClick={handleClick}>
      <PersonalizeIcon size={24} color={variables.light80} />
      <span className={styles.personalizeText}>{buttonText}</span>
    </Button>
  )
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
  const openModal = useStore((state) => state.openModal)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { factIndex, fact } = message
  const { createAction } = useIntegration()

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    setCopyStatus('success')
    setTimeout(() => {
      setCopyStatus('idle')
    }, 2000)
  }

  const handleSendFeedbackModal = (e: any, rating: string) => {
    e.stopPropagation()
    if (message.given_feedback !== null) {
      openModal('update-feedback', { id: 'update-feedback', header: 'Update Feedback', message, rating })
    } else {
      openModal('send-feedback', { id: 'send-feedback', header: 'Give Feedback', message, rating })
    }
  }

  const renderAttachment = (attachment: AttachedContextContextTypes) => {
    switch (attachment.type) {
      case 'image':
        return <Attachment type="image" value={attachment.file_id} version={message.version} />
      case 'clipboard_text':
        return <Attachment type="clipboard" value={attachment.text} />
      case 'pdf':
      case 'spreadsheet':
      case 'text_file':
        return <Attachment type={attachment.type} value={attachment.name} />
      case 'window_contents':
        // case 'ocr_text':
        return <Attachment type="window_context" value={attachment.name} appName={attachment.appName} />
      case 'conversation':
        return <Attachment type="conversation" value={attachment.text} />
      case 'selected_text':
        return <Attachment type="selected_text" value={attachment.text} />
    }
  }

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
            <div className={`mb-2 flex gap-2`}>
              {message.version === 'v4' && message.attached_context && message.attached_context.length > 0 ? (
                message.attached_context?.map((attachment, index) => (
                  <div key={index}>{renderAttachment(attachment)}</div>
                ))
              ) : (
                <>
                  {message.screenshot && <Attachment type="image" value={message.screenshot} />}
                  {message.audio && <Attachment type="audio" value={message.audio} />}
                  {message.window && message.window?.title && (
                    <Attachment type="window" value={message.window.title} appIcon={message.window.appIcon} />
                  )}
                  {message.clipboard_text && <Attachment type="clipboard" value={message.clipboard_text} />}
                  {message.file_title && <Attachment type="pdf" value={message.file_title} />}
                  {message.image_url && <Attachment type="image" value={message.image_url} />}
                  {message.file_attachments &&
                    message.file_attachments.map((a, index) => {
                      return <Attachment type={a.type} value={getDisplayValue(a)} key={index} />
                    })}
                  {message.window_context && <Attachment type="window_context" value={message.window_context} />}
                </>
              )}
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
            {typeof message.content !== 'string' && message.content}
            <div className="mt-2 flex gap-2">
              {typeof message.content === 'string' && (
                <AssistantMessageButton
                  type="Copy"
                  onClick={() => copyMessage(message.content as string)}
                  status={copyStatus}
                />
              )}
              {typeof message.content === 'string' && message.role === 'assistant' && (
                <>
                  <AssistantMessageButton type="Notion" onClick={() => createAction('notion')} status={'idle'} />
                  <AssistantMessageButton type="Linear" onClick={() => createAction('linear')} status={'idle'} />
                </>
              )}
              {message.id && message.role === 'assistant' && (
                <>
                  <AssistantMessageButton
                    type="Like"
                    onClick={(e) => handleSendFeedbackModal(e, 'like')}
                    status="idle"
                  />
                  <AssistantMessageButton
                    type="Dislike"
                    onClick={(e) => handleSendFeedbackModal(e, 'dislike')}
                    status="idle"
                  />
                </>
              )}
            </div>
          </div>
          {factIndex || fact ? <FactButton factIndex={factIndex} fact={fact} /> : null}
        </div>
      ) : (
        <span className={styles.thinking}>
          {typeof message.content === 'string' ? (
            <TypedText text={message.content} cursor={false} speed={1.5} />
          ) : (
            message.content
          )}
        </span>
      )}
    </div>
  )
}
