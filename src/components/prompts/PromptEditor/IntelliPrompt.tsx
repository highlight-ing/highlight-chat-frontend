import Editor, { Monaco } from '@monaco-editor/react'
import styles from './prompteditor.module.scss'
import Button from '@/components/Button/Button'
import { Gallery, Monitor, Sound, User, Windows } from 'iconsax-react'
import variables from '@/variables.module.scss'
import { useEffect, useRef, useState } from 'react'
import { editor, IDisposable } from 'monaco-editor'
import { buildSuggestions } from '@/lib/IntelliPrompt'

function Loading() {
  return <span className="text-sm text-gray-500">Loading editor...</span>
}

/**
 * The new, improved PromptInput component that uses Monaco Editor.
 */
export default function IntelliPrompt({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const monacoRef = useRef<Monaco | undefined>()
  const editorRef = useRef<editor.IStandaloneCodeEditor | undefined>()

  const [completionDisposable, setCompletionDisposable] = useState<IDisposable>()

  useEffect(() => {
    return () => {
      completionDisposable?.dispose()
    }
  }, [completionDisposable])

  function handleEditorWillMount(monaco: Monaco) {
    monacoRef.current = monaco

    monaco.editor.defineTheme('highlight', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
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
          [
            {
              label: 'image',
              insertText: 'image',
              description: 'Adds an image variable, which will be replaced with the text extracted from the image',
            },
            {
              label: 'screen',
              insertText: 'screen',
              description: 'Adds a screen variable, which will be replaced with the text extracted from the screen',
            },
            {
              label: 'audio',
              insertText: 'audio',
              description: 'Adds an audio variable, which will be replaced with the text extracted from the audio',
            },
            {
              label: 'about_me',
              insertText: 'about_me',
              description:
                "Adds an about_me variable, which will be replaced with the about me items configurd in Highlight's settings.",
            },
          ],
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
    })
  }

  function onVariableClick(variable: string) {
    editorRef.current?.trigger('keyboard', 'type', { text: variable })
  }

  function handleEditorChange(value: string | undefined, ev: editor.IModelContentChangedEvent) {
    if (!value) return

    onChange?.(value)
  }

  return (
    <>
      <div className={styles.editorPage}>
        <div className={`${styles.editorActions} px-4`}>
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
          <Button size={'medium'} variant={'ghost-neutral'} onClick={() => onVariableClick('{{windows}}')}>
            <Windows variant="Bold" size={16} color={variables.green60} />
            Windows
          </Button>
          <Button size={'medium'} variant={'ghost-neutral'} onClick={() => onVariableClick('{{about_me}}')}>
            <User variant="Bold" size={16} color={'#ECFF0C'} />
            About Me
          </Button>
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
        }}
        loading={<Loading />}
      />
    </>
  )
}
