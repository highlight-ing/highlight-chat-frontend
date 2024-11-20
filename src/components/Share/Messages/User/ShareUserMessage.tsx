import React from 'react'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import 'katex/dist/katex.min.css'

import { UserMessage } from '@/types'
import { getDisplayValue } from '@/utils/attachments'

import { Attachment } from '@/components/Attachment'
import CodeBlock from '@/components/Messages/CodeBlock'
import Spinner from '@/components/Spinner'

import { useFileMetadata } from './hooks'

type UserFileProps = {
  fileId: UserMessage['file_ids'][0]
}

function UserFile(props: UserFileProps) {
  const { data, isLoading, isError } = useFileMetadata(props.fileId)

  if (isLoading) return <div>Loading...</div>

  if (isError) return <div>Error</div>

  return <div>{data?.type}</div>
}

interface ShareUserMessageProps {
  message: UserMessage & { fetchedImage?: string; isImageLoading?: boolean }
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

export const ShareUserMessage: React.FC<ShareUserMessageProps> = React.memo(({ message }) => {
  const hasAttachments = React.useMemo(() => hasAttachment(message), [message])
  const hasContent = typeof message.content === 'string' && message.content.trim() !== ''
  const hasFiles = message?.file_ids && message.file_ids.length > 0

  return (
    <div className="mx-auto my-4 w-full max-w-[712px] px-6 md:px-4">
      <div className="rounded-[16px] border border-tertiary bg-primary p-4">
        {hasFiles && (
          <div className="flex items-center gap-2">
            {message?.file_ids.map((fileId) => <UserFile fileId={fileId} />)}
          </div>
        )}
        {hasContent && (
          <div className={`text-sm font-light leading-[1.6] text-primary/90 ${hasAttachments ? 'mb-4' : ''}`}>
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
        )}
        {hasAttachments && (
          <div className="flex flex-wrap gap-2">
            {/* {message.screenshot && <Attachment type="image" value={message.screenshot} />} */}
            {message.audio && <Attachment type="audio" value={message.audio} />}
            {message.window && message.window?.title && (
              <Attachment type="window" value={message.window.title} appIcon={message.window.appIcon} />
            )}
            {message.clipboard_text && <Attachment type="clipboard" value={message.clipboard_text} />}
            {message.file_title && <Attachment type="pdf" value={message.file_title} />}
            {message.file_attachments &&
              message.file_attachments.map((a, index) => (
                <Attachment key={index} type={a.type} value={getDisplayValue(a)} />
              ))}
            {message.window_context && <Attachment type="window_context" value={message.window_context} />}
            {message.image_url &&
              (message.isImageLoading ? (
                <div className="flex h-24 w-24 items-center justify-center rounded bg-light-10">
                  <Spinner size="small" />
                </div>
              ) : message.fetchedImage ? (
                <Attachment type="image" value={message.fetchedImage} isSharedImage={true} />
              ) : null)}
          </div>
        )}
      </div>
    </div>
  )
})

ShareUserMessage.displayName = 'ShareUserMessage'

export default ShareUserMessage
