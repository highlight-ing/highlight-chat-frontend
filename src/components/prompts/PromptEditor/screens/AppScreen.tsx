import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'
import { ClipboardText, ExportSquare, Gallery, I3Square, MessageText1, Monitor, Sound } from 'iconsax-react'
import sassVariables from '@/variables.module.scss'
import styles from '../prompteditor.module.scss'
import { useEffect } from 'react'
import OnboardingBox from '../OnboardingBox'

function OnboardingIndex0() {
  const { setOnboarding } = usePromptEditorStore()

  function handleContinue() {
    setOnboarding({ index: 1 })
  }

  return (
    <OnboardingBox
      title="Welcome to the Highlight Editor"
      line1={`The Highlight editor is designed to help you write prompts to create any kind of AI app you can imagine.`}
      line2={`Think of prompts as instructions for Highlight to think, act, and behave however you want it to.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex1() {
  const { setOnboarding, setPromptEditorData } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing prompts. }}\nSummarize my meeting notes`,
    })
  }, [])

  function handleContinue() {
    setOnboarding({ index: 2 })
  }

  return (
    <OnboardingBox
      title="Prompts are easy to create"
      line1={`Prompts can be as simple as a short sentence. In the example above, we’ve written a prompt for summarizing meeting notes.`}
      line2={`This prompt is instructing Highlight to take the meeting notes you give it and summarize it for you.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex2() {
  const { setOnboarding, setPromptEditorData } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing prompts. }}\nSummarize my meeting notes and list out all decisions and action items as a bullet list`,
    })
  }, [])

  function handleContinue() {
    setOnboarding({ index: 3 })
  }

  return (
    <OnboardingBox
      title="The key is to be as specific as possible"
      line1={`The most important thing to remember is to include the details. Highlight is super smart -- but it can’t read your mind just yet 😉`}
      line2={`You’ll notice in the example above we’ve added some details to the prompt for Highlight to format the meeting notes in a specific way.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex3() {
  const { setOnboarding, setPromptEditorData, setSelectedScreen } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing prompts. }}\nSummarize my meeting notes using the {{audio}} and/or {{clipboard_text}} that is provided.\nList out all decisions and action items  as a bullet list.`,
    })
  }, [])

  function handleContinue() {
    setOnboarding({ index: 4 })
    setPromptEditorData({
      appPrompt: '',
    })
    setSelectedScreen('settings')
  }

  return (
    <OnboardingBox
      title="Add context to give your prompts superpowers"
      line1={`With Highlight, you’re able to include context in your prompts so that Highlight can understand what you’re talking about. `}
      line2={`In our example, we’ve now updated the prompt to use any audio or text from our clipboard that is provided to generate the summary.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

export default function AppScreen() {
  const { promptEditorData, setPromptEditorData, onboarding } = usePromptEditorStore()

  return (
    <>
      <span className={onboarding.isOnboarding && onboarding.index === 0 ? styles.onboardingBlock : ''}>
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
      </span>
      {onboarding.isOnboarding && onboarding.index === 0 && <OnboardingIndex0 />}
      {onboarding.isOnboarding && onboarding.index === 1 && <OnboardingIndex1 />}
      {onboarding.isOnboarding && onboarding.index === 2 && <OnboardingIndex2 />}
      {onboarding.isOnboarding && onboarding.index === 3 && <OnboardingIndex3 />}
    </>
  )
}
