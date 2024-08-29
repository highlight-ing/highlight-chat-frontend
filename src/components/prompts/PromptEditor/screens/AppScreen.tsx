import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'
import { ClipboardText, ExportSquare, Gallery, I3Square, MessageText1, Monitor, Sound } from 'iconsax-react'
import sassVariables from '@/variables.module.scss'
import Button from '@/components/Button/Button'
import styles from '../prompteditor.module.scss'
import { useEffect } from 'react'

function OnboardingIndex0() {
  const { setOnboarding } = usePromptEditorStore()

  function handleContinue() {
    setOnboarding({ index: 1 })
  }

  return (
    <div className="absolute bottom-0 w-full bg-[#222222] px-[28px] py-[33px]">
      <h2 className={styles.headingText}>Welcome to the Highlight Editor</h2>
      <p className={styles.explainerText}>
        The Highlight editor is designed to help you write prompts to create any kind of AI app you can imagine.
      </p>
      <p className={styles.explainerText}>
        {' '}
        Think of prompts as instructions for Highlight to think, act, and behave however you want it to.
      </p>
      <div className={styles.buttonContainer}>
        <Button size="large" variant="accent" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}

function OnboardingIndex1() {
  const { setOnboarding, setPromptEditorData } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n
                  {{! Some tips for writing prompts. }}\n
                  Summarize my meeting notes`,
    })
  }, [])

  function handleContinue() {
    setOnboarding({ index: 2 })
  }

  return (
    <div className="absolute bottom-0 w-full bg-[#222222] px-[28px] py-[33px]">
      <h2 className={styles.headingText}>Prompts are easy to create</h2>
      <p className={styles.explainerText}>
        Prompts can be as simple as a short sentence. In the example above, we’ve written a prompt for summarizing
        meeting notes.
      </p>
      <p className={styles.explainerText}>
        {' '}
        This prompt is instructing Highlight to take the meeting notes you give it and summarize it for you.
      </p>
      <div className={styles.buttonContainer}>
        <Button size="large" variant="accent" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}

export default function AppScreen() {
  const { promptEditorData, setPromptEditorData, onboarding, setOnboarding } = usePromptEditorStore()

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
    </>
  )
}
