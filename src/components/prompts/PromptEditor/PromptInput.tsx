import CodeEditor from '@uiw/react-textarea-code-editor'
import { Gallery, Monitor, Sound, User } from 'iconsax-react'
import Button from '@/components/Button/Button'
import variables from '@/variables.module.scss'
import styles from './prompteditor.module.scss'
import { useRef, useState } from 'react'

/**
 * PromptInput is a component that allows the user to input a prompt with
 * buttons to insert variables into that prompt.
 */
export default function PromptInput({
  value,
  onChange,
  placeholder,
}: {
  value?: string
  onChange?: (prompt: string) => void
  placeholder?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const onVariableClick = (variable: string) => {
    const cursorPosition = textareaRef.current?.selectionEnd
    onChange?.(value?.slice(0, cursorPosition) + variable + value?.slice(cursorPosition))
  }

  console.log()

  return (
    <>
      <div className={styles.editorPage}>
        <div className={styles.editorActions}>
          <Button size={'medium'} variant={'ghost-neutral'} onClick={() => onVariableClick('{{image}}')}>
            <Gallery variant="Bold" size={16} color="#FF2099" />
            Image
          </Button>
          <Button size={'medium'} variant={'ghost-neutral'} onClick={() => onVariableClick('{{screen}}')}>
            <Monitor variant="Bold" size={16} color="#FF2099" />
            Screen
          </Button>
          <Button size={'medium'} variant={'ghost-neutral'} onClick={() => onVariableClick('{{audio}}')}>
            <Sound variant="Bold" size={16} color={variables.green60} />
            Audio
          </Button>
          <Button size={'medium'} variant={'ghost-neutral'} onClick={() => onVariableClick('{{about_me}}')}>
            <User variant="Bold" size={16} color={'#ECFF0C'} />
            About Me
          </Button>
        </div>
      </div>

      <div className={'flex w-full justify-center overflow-y-auto'}>
        <CodeEditor
          className={styles.codeEditor}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          language="handlebars"
          placeholder={placeholder}
          padding={0}
          style={{
            overflow: 'visible',
          }}
          ref={textareaRef}
        />
      </div>
    </>
  )
}
