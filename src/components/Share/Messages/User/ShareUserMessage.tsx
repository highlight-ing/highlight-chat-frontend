import React from 'react'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import 'katex/dist/katex.min.css'

import { UserMessage } from '@/types'
import { DocumentText1, GallerySlash } from 'iconsax-react'

import { getDisplayValue } from '@/utils/attachments'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip } from '@/components/ui/tooltip'
import { Attachment } from '@/components/Attachment'
import CodeBlock from '@/components/Messages/CodeBlock'
import Spinner from '@/components/Spinner'

import { useFileMetadata } from './hooks'
import { hasAttachment, preprocessLaTeX } from './utils'

type UserFileLayoutProps = {
  children: React.ReactNode
  tooltipContent?: string
}

function UserFileLayout(props: UserFileLayoutProps) {
  return (
    <Tooltip content={props.tooltipContent ?? 'File'}>
      <div className="grid h-10 w-16 place-items-center rounded-xl border border-secondary/60">{props.children}</div>
    </Tooltip>
  )
}

type UserFileProps = {
  fileId: string
}

const ATTACHMENT_SIZE = 20

function UserFile(props: UserFileProps) {
  const { data, isLoading, isError } = useFileMetadata(props.fileId)

  if (isLoading) {
    return (
      <UserFileLayout tooltipContent="Getting file type">
        <Skeleton className="size-full bg-secondary" />
      </UserFileLayout>
    )
  }

  if (isError)
    return (
      <UserFileLayout tooltipContent="Error retreving file type">
        <DocumentText1 variant="Bold" size={ATTACHMENT_SIZE} color="#FF8A65" />
      </UserFileLayout>
    )

  if (data?.file_type.includes('image')) {
    return (
      <UserFileLayout tooltipContent="Image">
        <GallerySlash variant="Bold" size={ATTACHMENT_SIZE} color="#00FAFF" />
      </UserFileLayout>
    )
  }

  if (data?.file_type.includes('pdf')) {
    return (
      <UserFileLayout tooltipContent="PDF">
        <DocumentText1 variant="Bold" size={ATTACHMENT_SIZE} />
      </UserFileLayout>
    )
  }

  return (
    <UserFileLayout>
      <DocumentText1 size={ATTACHMENT_SIZE} className="text-secondary" />
    </UserFileLayout>
  )
}

type MessageContent = {
  content?: string
  attached_context: Array<{
    file_id: string
    type: string
  }>
  file_ids: Array<string>
}

interface ShareUserMessageProps {
  message: UserMessage & { fetchedImage?: string; isImageLoading?: boolean }
}

export const ShareUserMessage: React.FC<ShareUserMessageProps> = React.memo(({ message }) => {
  const content = typeof message.content === 'string' ? (JSON.parse(message.content) as MessageContent) : undefined
  const hasAttachments = React.useMemo(() => hasAttachment(message), [message])
  const hasContent = content?.content?.trim() !== ''
  const hasFiles = content?.file_ids && content.file_ids.length > 0

  return (
    <div className="mx-auto my-4 w-full max-w-[712px] px-6 md:px-4">
      <div className="space-y-2 rounded-[16px] border border-tertiary bg-primary p-4">
        {hasFiles && (
          <div className="flex items-center gap-2">
            {content.file_ids.map((fileId) => (
              <UserFile key={fileId} fileId={fileId} />
            ))}
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
              {typeof content?.content === 'string' ? preprocessLaTeX(content.content) : ''}
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
