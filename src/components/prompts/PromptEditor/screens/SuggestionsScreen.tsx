import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'
import { Gallery, Monitor, Sound, User, Windows } from 'iconsax-react'
import sassVariables from '@/variables.module.scss'

export default function SuggestionsScreen() {
  const { promptEditorData, setPromptEditorData } = usePromptEditorStore()

  return (
    <IntelliPrompt
      value={promptEditorData.suggestionsPrompt}
      onChange={(e) => setPromptEditorData({ suggestionsPrompt: e })}
      variables={[
        {
          label: 'Image',
          insertText: 'image',
          description: 'Adds an image variable, which will be replaced with the text extracted from the image.',
          icon: <Gallery variant="Bold" size={16} color="#FF2099" />,
        },
        {
          label: 'Screen',
          insertText: 'screen',
          description: 'Adds a screen variable, which will be replaced with the text extracted from the screen.',
          icon: <Monitor variant="Bold" size={16} color="#FF2099" />,
        },
        {
          label: 'Audio',
          insertText: 'audio',
          description: 'Adds an audio variable, which will be replaced with the text extracted from the audio.',
          icon: <Sound variant="Bold" size={16} color={sassVariables.green60} />,
        },
        {
          label: 'About Me',
          insertText: 'about_me',
          description:
            "Adds an about_me variable, which will be replaced with the about me items configurd in Highlight's settings.",
          icon: <User variant="Bold" size={16} color={'#ECFF0C'} />,
        },
      ]}
    />
  )
}
