import React from 'react'
import { AssistantMessage } from '@/types'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { HighlightIcon } from '@/components/icons'

import 'katex/dist/katex.min.css'

import { AssistantMessageButtonStatus, AssistantMessageButtonType } from '@/types'

import CodeBlock from '@/components/Messages/CodeBlock'

import AssistantMessageButtonRow from './AssistantMessageButtonRow'
import styles from './share-assistant-message.module.scss'
import { useAssistantMessageButtons } from './useAssistantMessageButtons'

interface ShareAssistantMessageProps {
  message: AssistantMessage
  buttonTypes: AssistantMessageButtonType[]
}

const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`)
  return blockProcessedContent.replace(/\\\((.*?)\\\)/g, (_, equation) => `$${equation}$`)
}

export const ShareAssistantMessage: React.FC<ShareAssistantMessageProps> = ({ message, buttonTypes }) => {
  const buttons = useAssistantMessageButtons({
    message: typeof message.content === 'string' ? message.content : '',
    buttonTypes,
  })

  return (
    <div className="mx-auto w-full max-w-[712px] px-6 md:px-4">
      <div className="rounded-[24px] bg-secondary p-4 pb-2">
        <div className="mb-4 flex items-center">
          <HighlightIcon size={16} color="gray" />
          <span className="ml-2 text-xs font-medium text-secondary">Highlight</span>
        </div>
        <div className={styles.messageBody}>
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
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
        <div className="mt-1">
          <AssistantMessageButtonRow buttons={buttons} />
        </div>
      </div>
    </div>
  )
}

export default ShareAssistantMessage
