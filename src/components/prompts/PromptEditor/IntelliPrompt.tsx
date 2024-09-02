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

const VariablePhrases = [
  {
    variable: 'clipboard_text',
    phrases: ['clipboard text', 'my clipboard', 'clipboard'],
  },
  {
    variable: 'windows',
    phrases: [
      'open windows',
      'open apps',
      'active programs',
      'open programs',
      'running apps',
      'running programs',
      'active apps',
    ],
  },
  {
    variable: 'audio',
    phrases: ['audio', 'conversation', 'call', 'meeting', 'transcript'],
  },
  {
    variable: 'image',
    phrases: ['screenshot', 'screen shot', 'screenshots', 'print screen'],
  },
  {
    variable: 'screen',
    phrases: ['screen contents', 'screen data', 'screen text', 'on my screen'],
  },
  {
    variable: 'window_context',
    phrases: [
      'app text',
      'window text',
      'app context',
      'window context',
      'active app',
      'focused app',
      'app contents',
      'window contents',
    ],
  },
  {
    variable: 'user_message',
    phrases: ['user message', 'user input', 'user text', 'typed message', 'typed input', 'question'],
  },
]

const matchPhrase = (text: string, variable: string, phrase: string | null) => {
  const regex = new RegExp(phrase ?? variable, 'gi')
  const matches = regex.exec(text)
  if (!matches?.length) {
    return matchPhrase(text, variable, null)
  }
  return matches
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
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null)

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

    decorationsRef.current = editor.createDecorationsCollection()

    // Initial highlight
    highlightWords()
  }

  const highlightWords = () => {
    if (!editorRef.current || !decorationsRef.current) return

    const model = editorRef.current.getModel()
    if (!model) return

    const text = model.getValue()
    const decorationsArray: editor.IModelDeltaDecoration[] = []

    for (const v of VariablePhrases) {
      const variable = v.variable
      const phrases = v.phrases
      const regex = new RegExp(variable, 'gi')
      let match
      while ((match = regex.exec(text)) !== null) {
        const startPosition = model.getPositionAt(match.index)
        const endPosition = model.getPositionAt(match.index + variable.length)
        const className = styles[variable]
        decorationsArray.push({
          range: {
            startColumn: startPosition.column,
            startLineNumber: startPosition.lineNumber,
            endColumn: endPosition.column,
            endLineNumber: endPosition.lineNumber,
          },
          options: {
            inlineClassName: className,
          },
        })
      }
      for (const phrase of phrases) {
        const regex = new RegExp(phrase, 'gi')
        let match
        while ((match = regex.exec(text)) !== null) {
          const startPosition = model.getPositionAt(match.index)
          const endPosition = model.getPositionAt(match.index + phrase.length)
          const className = styles[variable]
          decorationsArray.push({
            range: {
              startColumn: startPosition.column,
              startLineNumber: startPosition.lineNumber,
              endColumn: endPosition.column,
              endLineNumber: endPosition.lineNumber,
            },
            options: {
              inlineClassName: className,
            },
          })
        }
      }
    }

    decorationsRef.current.set(decorationsArray)
  }

  function onVariableClick(variable: string) {
    editorRef.current?.trigger('keyboard', 'type', { text: `{{${variable}}}` })
  }

  function handleEditorChange(value: string | undefined, ev: editor.IModelContentChangedEvent) {
    if (!value) return
    onChange?.(value)
  }

  useEffect(() => {
    highlightWords()
  }, [value])

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
          fontSize: 14,
        }}
        loading={<Loading />}
      />
    </>
  )
}
