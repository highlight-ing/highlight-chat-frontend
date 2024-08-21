'use client'
import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message } from '@/types'
import { AssistantIcon } from '@/icons/icons'
import CodeBlock from '@/components/Messages/CodeBlock'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import styles from '../Messages/message.module.scss'

interface ShareMessageProps {
  message: Message
}

const ShareMessage: React.FC<ShareMessageProps> = ({ message }) => {
  return (
    <div className={`${styles.messageContainer} ${message.role === 'user' ? styles.self : ''}`}>
      {message.role === 'assistant' && (
        <div className={styles.avatar}>
          <AssistantIcon />
        </div>
      )}
      <div className={styles.message}>
        <div className={styles.messageBody}>
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // @ts-ignore
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
            }}
          >
            {typeof message.content === 'string' ? message.content : ''}
          </Markdown>
        </div>
      </div>
    </div>
  )
}

export default ShareMessage
