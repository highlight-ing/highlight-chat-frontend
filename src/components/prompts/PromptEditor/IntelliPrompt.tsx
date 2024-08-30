import Editor, { Monaco } from '@monaco-editor/react'
import styles from './prompteditor.module.scss'
import Button from '@/components/Button/Button'
import { useEffect, useRef, useState } from 'react'
import { editor, IDisposable } from 'monaco-editor'
import { buildSuggestions } from '@/lib/IntelliPrompt'
import Tooltip from '@/components/Tooltip/Tooltip'
import { usePromptEditorStore } from '@/stores/prompt-editor'

function Loading() {
  return <span className="text-sm text-gray-500">Loading editor...</span>
}

interface PromptVariable {
  icon: React.ReactNode
  label: string
  insertText: string
  description: string
}

/**
 * The new, improved PromptInput component that uses Monaco Editor.
 * @param otherButtons Additional buttons that will go in the "Context Bar" (the place where users can click to add variables)
 */
export default function IntelliPrompt({
  value,
  onChange,
  variables,
  otherButtons,
}: {
  value?: string
  onChange?: (value: string) => void
  variables?: PromptVariable[]
  otherButtons?: React.ReactNode[]
}) {
  const monacoRef = useRef<Monaco | undefined>()
  const editorRef = useRef<editor.IStandaloneCodeEditor | undefined>()

  const [completionDisposable, setCompletionDisposable] = useState<IDisposable>()

  const { onboarding } = usePromptEditorStore()

  useEffect(() => {
    return () => {
      completionDisposable?.dispose()
    }
  }, [completionDisposable])

  useEffect(() => {
    // Effect that makes the editor read only if the user is onboarding
    editorRef.current?.updateOptions({
      readOnly: onboarding.isOnboarding,
    })
  }, [onboarding.isOnboarding])

  function handleEditorWillMount(monaco: Monaco) {
    monacoRef.current = monaco

    monaco.editor.defineTheme('highlight', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        {
          token: 'comment',
          foreground: '#808080',
        },
      ],
      colors: {
        // 'editor.foreground': '#000000',
        // 'editor.background': '#000000',
        // 'editorCursor.foreground': '#8B0000',
        // 'editor.lineHighlightBackground': '#0000FF20',
        // 'editorLineNumber.foreground': '#008800',
        // 'editor.selectionBackground': '#88000030',
        // 'editor.inactiveSelectionBackground': '#88000015',
      },
    })

    const disposer = monaco.languages.registerCompletionItemProvider('handlebars', {
      triggerCharacters: ['{'],
      provideCompletionItems: (model, position) => {
        const suggestions = buildSuggestions(
          monaco,
          variables?.map((v) => ({
            label: v.label,
            insertText: v.insertText,
            description: v.description,
          })) ?? [],
          model,
          position,
        )

        return {
          suggestions,
        }
      },
    })

    setCompletionDisposable(disposer)
  }

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor

    editor.updateOptions({
      autoClosingBrackets: 'never',
      wordWrap: 'on',
      folding: false,
    })

    editor.createDecorationsCollection([
      {
        range: {
          startColumn: 1,
          startLineNumber: 1,
          endColumn: 10,
          endLineNumber: 2,
        },
        options: {
          className: styles.onboardingDecoration,
        },
      },
    ])
  }

  function onVariableClick(variable: string) {
    editorRef.current?.trigger('keyboard', 'type', { text: `{{${variable}}}` })
  }

  function handleEditorChange(value: string | undefined, ev: editor.IModelContentChangedEvent) {
    if (!value) return

    onChange?.(value)
  }

  return (
    <>
      <div className={styles.editorPage}>
        <div className={`${styles.editorActions} px-4`}>
          {otherButtons?.map((button) => button)}
          {variables?.map((variable) => (
            <Tooltip
              key={variable.label}
              position="top"
              tooltip={variable.description}
              disabled={onboarding.isOnboarding}
            >
              <Button
                size={'medium'}
                variant={'ghost-neutral'}
                onClick={onboarding.isOnboarding ? undefined : () => onVariableClick(variable.insertText)}
                key={variable.label}
                disabled={onboarding.isOnboarding}
              >
                {variable.icon}
                {variable.label}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>
      <Editor
        theme="highlight"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        language="handlebars"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: {
            enabled: false,
          },
          automaticLayout: true,
          readOnly: onboarding.isOnboarding,
          fontFamily: 'Inter',
          fontSize: 16,
        }}
        loading={<Loading />}
      />
    </>
  )
}
