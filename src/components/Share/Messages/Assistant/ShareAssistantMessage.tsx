import React from 'react'
import { AssistantMessage } from '@/types'
import { HighlightIcon } from '@/icons/icons'
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
    <div className="mx-auto my-4 w-full max-w-[712px] px-6 sm:px-4">
      <div className="rounded-[24px] border border-border-tertiary bg-background-secondary p-4">
        <div className="mb-4 flex items-center">
          <HighlightIcon size={16} color="gray" />
          <span className="ml-2 text-xs font-medium text-text-secondary">Highlight</span>
        </div>
        <div className="whitespace-pre-wrap text-sm font-light leading-[1.6] text-text-primary/90">
          <div className="prose prose-invert max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                //@ts-ignore
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isStringWithNewlines = typeof children === 'string' && children.includes('\n')
                  if ((!inline && match) || isStringWithNewlines) {
                    return <CodeBlock language={match?.[1] ?? 'plaintext'}>{children}</CodeBlock>
                  }
                  return (
                    <code className="rounded border border-light-10 bg-dark-60 p-1 text-xs" {...props}>
                      {children}
                    </code>
                  )
                },
                p: ({ children }) => <p className="mb-1">{children}</p>,
                strong: ({ children }) => <strong className="font-medium text-text-primary">{children}</strong>,
                ol: ({ children }) => <ol className="mb-2 list-decimal pl-6">{children}</ol>,
                ul: ({ children }) => <ul className="list-disc pl-6">{children}</ul>,
                li: ({ children }) => <li className="my-1">{children}</li>,
                h1: ({ children }) => <h1 className="mb-2 mt-4 text-2xl font-medium text-text-primary">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-2 mt-3 text-xl font-medium text-text-primary">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-1 mt-2 text-lg font-medium text-text-primary">{children}</h3>,
                h4: ({ children }) => <h4 className="mb-1 mt-2 text-base font-medium text-text-primary">{children}</h4>,
                table: ({ children }) => (
                  <div className="my-2 overflow-x-auto">
                    <table className="w-full border-collapse overflow-hidden rounded-lg">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-light-5">{children}</thead>,
                th: ({ children }) => <th className="border border-light-5 p-2 text-left">{children}</th>,
                td: ({ children }) => <td className="border border-light-5 p-2 align-top">{children}</td>,
                tr: ({ children, index }) => (
                  <tr className={index % 2 === 0 ? 'bg-dark-20' : 'bg-dark-10'}>{children}</tr>
                ),
              }}
            >
              {typeof message.content === 'string' ? preprocessLaTeX(message.content) : ''}
            </Markdown>
          </div>
        </div>
        <AssistantMessageButtonRow buttons={buttons} />
      </div>
    </div>
  )
}

export default ShareAssistantMessage
