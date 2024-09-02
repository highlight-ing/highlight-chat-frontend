import Editor, { Monaco } from '@monaco-editor/react'
import styles from './prompteditor.module.scss'
import variables from '@/variables.module.scss'
import { useCallback, useEffect, useRef, useState } from 'react'
import { editor, IDisposable } from 'monaco-editor'
import { buildSuggestions } from '@/lib/IntelliPrompt'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { TemplatesTool } from '@/components/prompts/PromptEditor/Toolbar/TemplatesTool'
import { VariablesTool } from '@/components/prompts/PromptEditor/Toolbar/VariablesTool'
import { ConditionsTool } from '@/components/prompts/PromptEditor/Toolbar/ConditionsTool'
import { useStore } from '@/providers/store-provider'

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
    label: 'Clipboard Text',
    description: "Reference text from the user's clipboard.",
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
    label: 'Open Windows',
    description: 'Reference a comma-separated list of open window titles.',
  },
  {
    variable: 'audio',
    phrases: ['audio', 'conversation', 'call', 'meeting', 'transcript'],
    label: 'Audio',
    description: 'Reference the audio transcript.',
  },
  {
    variable: 'image',
    phrases: ['screenshot', 'screen shot', 'screenshots', 'print screen'],
    label: 'Image / Screenshot',
    description: 'Reference the text extracted from the image.',
  },
  {
    variable: 'screen',
    phrases: ['screen contents', 'screen data', 'screen text', 'on my screen'],
    label: 'Screen Text',
    description: 'Reference the text extracted from the screen using OCR.',
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
    label: 'App Text',
    description: "Reference the active app's contents as text.",
  },
  {
    variable: 'user_message',
    phrases: ['user message', 'user input', 'user text', 'typed message', 'typed input', 'question'],
    label: 'User Message',
    description: "Reference the user's typed message, or the suggestion they clicked from the assistant.",
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
export default function IntelliPrompt({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const monacoRef = useRef<Monaco | undefined>()
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null)

  const [completionDisposable, setCompletionDisposable] = useState<IDisposable>()

  const { onboarding } = usePromptEditorStore()
  const openModal = useStore((state) => state.openModal)

  useEffect(() => {
    return () => {
      completionDisposable?.dispose()
    }
  }, [completionDisposable])

  useEffect(() => {
    // Effect that makes the editor read only if the user is onboarding
    const editor = monacoRef.current?.editor?.getEditors?.()?.[0]
    editor?.updateOptions({
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
        'editor.background': variables.backgroundSecondary,
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
          VariablePhrases?.map((v) => ({
            label: v.label,
            insertText: v.variable,
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
    const editor = monacoRef.current?.editor?.getEditors?.()?.[0]
    if (!monacoRef.current || !editor || !decorationsRef.current) {
      return
    }

    const model = editor.getModel()
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

  const onVariableClick = useCallback((variable: string, phrase: string) => {
    const editor = monacoRef.current?.editor?.getEditors?.()?.[0]

    openModal('confirm-override-prompt', {
      callback: () => {
        console.log('called back')
      },
    })

    const isCaretOnNewLine = (): boolean => {
      if (editor) {
        const model = editor.getModel()
        if (model) {
          const position = editor.getPosition()
          if (position) {
            // Check if the cursor is at the first column (start) of a line
            return position.column === 1
          }
        }
      }
      return false
    }

    if (editor?.getValue()?.length === 0 || isCaretOnNewLine()) {
      editor?.trigger('keyboard', 'type', { text: phrase })
    } else {
      editor?.trigger('keyboard', 'type', { text: variable })
    }
  }, [])

  function handleEditorChange(value: string | undefined, ev: editor.IModelContentChangedEvent) {
    onChange?.(value ?? '')
  }

  useEffect(() => {
    highlightWords()
  }, [value])

  return (
    <>
      <div className={styles.editorPage}>
        <div className={`${styles.editorActions} px-4`}>
          <TemplatesTool />
          <VariablesTool onSelect={onVariableClick} disabled={onboarding.isOnboarding} />
          <ConditionsTool disabled={onboarding.isOnboarding} />
        </div>
      </div>
      <Editor
        theme="highlight"
        language="handlebars"
        value={value}
        beforeMount={handleEditorWillMount}
        loading={<Loading />}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          minimap: {
            enabled: false,
          },
          automaticLayout: true,
          readOnly: onboarding.isOnboarding,
          fontSize: 14,
        }}
      />
    </>
  )
}
