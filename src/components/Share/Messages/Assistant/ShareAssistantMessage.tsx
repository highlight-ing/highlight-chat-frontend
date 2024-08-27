import React from 'react'
import { AssistantMessage } from '@/types'
import { HighlightIcon } from '@/icons/icons'
import { Copy, Send2, ExportCircle } from 'iconsax-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import CodeBlock from '@/components/Messages/CodeBlock'
import AssistantMessageButtonRow from './AssistantMessageButtonRow'
import { useAssistantMessageButtons } from './useAssistantMessageButtons'
import { AssistantMessageButtonType, AssistantMessageButtonStatus } from '@/types'

interface ShareAssistantMessageProps {
  message: AssistantMessage
  buttonTypes: AssistantMessageButtonType[]
}

const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`)
  return blockProcessedContent.replace(/\\\((.*?)\\\)/g, (_, equation) => `$${equation}$`)
}

export const ShareAssistantMessage: React.FC<ShareAssistantMessageProps> = ({ message, buttonTypes }) => {
  const buttons = useAssistantMessageButtons({ message: message.content, buttonTypes })

  return (
    <div className="mx-auto my-4 w-full max-w-[712px]">
      <div className="rounded-[24px] border border-border-tertiary bg-background-secondary p-4">
        <div className="mb-4 flex items-center">
          <HighlightIcon size={16} color="gray" />
          <span className="ml-2 text-xs font-medium text-text-secondary">Highlight</span>
        </div>
        <div className="mb-4 text-sm font-light leading-[1.6] text-text-primary/90">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              //@ts-ignore
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const isStringWithNewlines = typeof children === 'string' && children.includes('\n')
                if ((!inline && match) || isStringWithNewlines) {
                  return (
                    <div className="my-4">
                      <CodeBlock language={match?.[1] ?? 'plaintext'}>{children}</CodeBlock>
                    </div>
                  )
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {typeof message.content === 'string' ? preprocessLaTeX(message.content) : ''}
          </Markdown>
        </div>
        <AssistantMessageButtonRow buttons={buttons} />
      </div>
    </div>
  )
}

export default ShareAssistantMessage
