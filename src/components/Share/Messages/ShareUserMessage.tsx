import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { UserMessage } from '@/types'
import { Attachment } from '@/components/Attachment'
import CodeBlock from '@/components/Messages/CodeBlock'
import { getDisplayValue } from '@/utils/attachments'

interface ShareUserMessageProps {
  message: UserMessage
}

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

const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`)
  return blockProcessedContent.replace(/\\\((.*?)\\\)/g, (_, equation) => `$${equation}$`)
}

export const ShareUserMessage: React.FC<ShareUserMessageProps> = ({ message }) => {
  return (
    <div className="mx-auto my-4 w-full max-w-[712px]">
      <p className="mb-4 text-center text-xs text-text-tertiary">
        Created with Highlight. Download to create and share your own chats
      </p>
      <div className="rounded-[16px] border border-border-tertiary bg-background-primary p-4">
        <div className="mb-4 text-xs font-light leading-[1.6] text-text-primary/90">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              //@ts-ignore
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <CodeBlock language={match[1]}>{children}</CodeBlock>
                ) : (
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
                      {children.map((child, index) => (
                        <React.Fragment key={index}>{child === '<br>' ? <br /> : child}</React.Fragment>
                      ))}
                    </td>
                  )
                }
                return <td>{children}</td>
              },
            }}
          >
            {typeof message.content === 'string' ? preprocessLaTeX(message.content) : ''}
          </Markdown>
        </div>
        {hasAttachment(message) && (
          <div className="flex flex-wrap gap-2">
            {message.screenshot && <Attachment type="image" value={message.screenshot} />}
            {message.audio && <Attachment type="audio" value={message.audio} />}
            {message.window && message.window?.title && (
              <Attachment type="window" value={message.window.title} appIcon={message.window.appIcon} />
            )}
            {message.clipboard_text && <Attachment type="clipboard" value={message.clipboard_text} />}
            {message.file_title && <Attachment type="pdf" value={message.file_title} />}
            {message.image_url && <Attachment type="image" value={message.image_url} />}
            {message.file_attachments &&
              message.file_attachments.map((a, index) => (
                <Attachment key={index} type={a.type} value={getDisplayValue(a)} />
              ))}
            {message.window_context && <Attachment type="window_context" value={message.window_context} />}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShareUserMessage
