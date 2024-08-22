import Editor, { Monaco } from '@monaco-editor/react'
import styles from './prompteditor.module.scss'
import Button from '@/components/Button/Button'
import { Gallery, Monitor, Sound, User, Windows } from 'iconsax-react'
import variables from '@/variables.module.scss'
import { useRef } from 'react'
import { editor } from 'monaco-editor'

// function createDependencyProposals(range: any) {
//     // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
//     // here you could do a server side lookup
//     return [
//       {
//         label: '"lodash"',
//         kind: monaco.languages.CompletionItemKind.Function,
//         documentation: 'The Lodash library exported as Node.js modules.',
//         insertText: '"lodash": "*"',
//         range: range,
//       },
//       {
//         label: '"express"',
//         kind: monaco.languages.CompletionItemKind.Function,
//         documentation: 'Fast, unopinionated, minimalist web framework',
//         insertText: '"express": "*"',
//         range: range,
//       },
//       {
//         label: '"mkdirp"',
//         kind: monaco.languages.CompletionItemKind.Function,
//         documentation: 'Recursively mkdir, like <code>mkdir -p</code>',
//         insertText: '"mkdirp": "*"',
//         range: range,
//       },
//       {
//         label: '"my-third-party-library"',
//         kind: monaco.languages.CompletionItemKind.Function,
//         documentation: 'Describe your library here',
//         insertText: '"${1:my-third-party-library}": "${2:1.2.3}"',
//         insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
//         range: range,
//       },
//     ]
//   }

export default function IntelliPrompt() {
  const monacoRef = useRef<Monaco | undefined>()
  const editorRef = useRef<editor.IStandaloneCodeEditor | undefined>()

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

    monaco.languages.registerCompletionItemProvider('handlebars', {
      triggerCharacters: ['{'], // Trigger when typing `{`

      provideCompletionItems: function (model, position) {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        // Ensure the completion is triggered after {{
        if (!textUntilPosition.endsWith('{{')) {
          return { suggestions: [] }
        }

        // Define the suggestions for `{{text}}` and `{{audio}}`
        const suggestions = [
          {
            label: '{{image}}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'image}}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
            documentation: '{{image}} will be replaced with the text pulled from the image.',
          },
          {
            label: '{{audio}}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'audio}}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
            documentation: '{{audio}} will be replaced with the text pulled from the audio.',
          },
          {
            label: '{{screen}}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'screen}}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
            documentation: '{{screen}} will be replaced with the text pulled from the screen.',
          },
          {
            label: '{{about_me}}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'about_me}}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
            documentation: '{{about_me}} will be replaced with the text pulled from the about me.',
          },
        ]

        return { suggestions: suggestions }
      },
    })
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
