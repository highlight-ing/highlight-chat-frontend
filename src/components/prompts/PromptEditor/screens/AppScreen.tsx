import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'
import { ClipboardText, ExportSquare, Gallery, I3Square, MessageText1, Monitor, Sound } from 'iconsax-react'
import sassVariables from '@/variables.module.scss'

export default function AppScreen() {
  const { promptEditorData, setPromptEditorData } = usePromptEditorStore()

  return (
    <IntelliPrompt
      value={promptEditorData.appPrompt}
      onChange={(e) => setPromptEditorData({ appPrompt: e })}
      variables={[
        {
          label: 'User Message',
          insertText: 'user_message',
          description:
            'Adds a user message variable. The action the user is performing, what they clicked or typed in the floating action menu.',
          icon: <MessageText1 variant="Bold" size={16} color={sassVariables.green60} />,
        },
        {
          label: 'Image',
          insertText: 'image',
          description: 'Adds an image variable, which will be replaced with the text extracted from the image.',
          icon: <Gallery variant="Bold" size={16} color="#FF2099" />,
        },
        {
          label: 'Screen',
          insertText: 'screen',
          description:
            'Adds a screen variable, which will be replaced with the OCR screen text extracted from the screen.',
          icon: <Monitor variant="Bold" size={16} color="#FF2099" />,
        },
        {
          label: 'Audio',
          insertText: 'audio',
          description: 'Adds an audio variable, which will be replaced with the text extracted from the audio.',
          icon: <Sound variant="Bold" size={16} color={sassVariables.green60} />,
        },
        {
          label: 'Open Windows',
          insertText: 'windows',
          description: "A list of all the windows open on the user's machine.",
          icon: <I3Square variant="Bold" size={16} color={sassVariables.green60} />,
        },
        {
          label: 'Window Context',
          insertText: 'window_context',
          description:
            'Adds a window_context variable, the raw context of the window the user is currently interacting with.',
          icon: <ExportSquare variant="Bold" size={16} color={sassVariables.green60} />,
        },
        {
          label: 'Clipboard Text',
          insertText: 'clipboard_text',
          description:
            'Adds a clipboard_text variable, which will be replaced with the text currently in the user’s clipboard.',
          icon: <ClipboardText variant="Bold" size={16} color={'#ECFF0C'} />,
        },
      ]}
    />
  )
}
