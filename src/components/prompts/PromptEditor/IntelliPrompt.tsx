import Editor, { Monaco } from '@monaco-editor/react'
import styles from './prompteditor.module.scss'
import Button from '@/components/Button/Button'
import { Gallery, Monitor, Sound, User, Windows } from 'iconsax-react'
import variables from '@/variables.module.scss'
import { useEffect, useRef, useState } from 'react'
import { editor, IDisposable } from 'monaco-editor'
import { buildSuggestions } from '@/lib/IntelliPrompt'

export default function IntelliPrompt() {
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
      triggerCharacters: ['{', '.'],
      provideCompletionItems: (model, position) => {
        const suggestions = buildSuggestions(
          monaco,
          [
            {
              label: 'image',
              insertText: 'image',
              description: 'Bruh',
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
  }

  function onVariableClick(variable: string) {
    editorRef.current?.trigger('keyboard', 'type', { text: variable })
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
        defaultLanguage="handlebars"
        defaultValue="// some comment"
        options={{
          minimap: {
            enabled: false,
          },
        }}
      />
    </>
  )
}
