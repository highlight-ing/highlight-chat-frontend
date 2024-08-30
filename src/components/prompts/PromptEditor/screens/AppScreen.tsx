import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'
import {
  ClipboardText,
  ExportSquare,
  Gallery,
  I3Square,
  MessageText1,
  Monitor,
  Sound,
  Shapes,
  Screenmirroring,
  VoiceSquare,
  Crown1,
  Crown,
  Note,
} from 'iconsax-react'
import sassVariables from '@/variables.module.scss'
import styles from '../prompteditor.module.scss'
import { useEffect } from 'react'
import OnboardingBox from '../OnboardingBox'
import Button from '@/components/Button/Button'
import ContextMenu from '@/components/ContextMenu/ContextMenu'

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
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing prompts. }}\nSummarize my meeting notes using the {{audio}} and/or {{clipboard_text}} that is provided.\nList out all decisions and action items as a bullet list.`,
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

function TemplateButton() {
  const { setPromptEditorData } = usePromptEditorStore()

  const APP_PROMPT_COMMENT =
    "{{! These are comments, they won't effect the output of your app }}\n{{! The app prompt determines how your app will behave to the user. }}\n"

  /**
   * Comment that gets appended to all prompts
   */
  const SUGGESTIONS_PROMPT_COMMENT =
    '{{! Write a prompt that explains how your app can help the user provided the context }}\n'

  const contextMenuItems = [
    {
      label: (
        <div className="flex items-center gap-2">
          <Screenmirroring variant="Bold" size={16} color={sassVariables.textSecondary} />
          Code Reviewer
        </div>
      ),
      onClick: () => {
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a code reviewer. You will review code and provide suggestions for improvements. Use the screen data {{screen}} to help the user with their code.',
          suggestionsPrompt:
            SUGGESTIONS_PROMPT_COMMENT +
            'Using this screen data: {{screen}}, offer suggestions for ways to improve the code.',
        })
      },
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <Note variant="Bold" size={16} color={sassVariables.textSecondary} />
          Meeting Summarizer
        </div>
      ),
      onClick: () => {
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a meeting summarizer. You will summarize the meeting notes from either the {{audio}} or {{clipboard_text}} that is provided. If both of these are missing, prompt the user to attach them.',
          suggestionsPrompt: '',
          name: 'Meeting Summarizer',
          description: 'A meeting summarizer that will summarize meeting notes.',
        })
      },
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <VoiceSquare variant="Bold" size={16} color={sassVariables.textSecondary} />
          Blog Post Generator
        </div>
      ),
      onClick: () => {
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a blog post generator. You will generate a blog post based on the screen data {{screen}} that is provided.',
          suggestionsPrompt: '',
          name: 'Blog Post Generator',
          description:
            'A blog post generator that will generate a blog post based on the screen data that is provided.',
        })
      },
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <Crown variant="Bold" size={16} color={sassVariables.textSecondary} />
          Lizzard Person
        </div>
      ),
      onClick: () => {
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a lizzard person. Joke about how you will take over the world using the screen data {{screen}}, audio {{audio}}, and clipboard text {{clipboard_text}} that is provided.',
          suggestionsPrompt: '',
          name: 'Lizzard Person',
          description: 'A lizzard person who will take over the world.',
        })
      },
    },
  ]

  return (
    <ContextMenu
      key="templates-menu"
      items={contextMenuItems}
      position={'bottom'}
      triggerId={`toggle-templates`}
      leftClick={true}
    >
      <Button id="toggle-templates" size={'medium'} variant={'ghost-neutral'}>
        <Shapes variant="Bold" size={16} color={sassVariables.backgroundAccent} />
        Templates
      </Button>
    </ContextMenu>
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
          otherButtons={[<TemplateButton key="templates-button" />]}
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
