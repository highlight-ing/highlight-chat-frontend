import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'

import { isAlpha, isDevelopment } from '@/utils/appVersion'
import Button from '@/components/Button/Button'
import { Switch } from '@/components/catalyst/switch'
import { LinearIcon, NotionIcon } from '@/components/icons'

import IntelliPrompt from '../IntelliPrompt'
import OnboardingBox from '../OnboardingBox'
import styles from '../prompteditor.module.scss'
import AppSelector from '../ShortcutPreferences/AppSelector'
import ContextSelector from '../ShortcutPreferences/ContextSelector'

function OnboardingIndex0() {
  const { setOnboarding } = usePromptEditorStore()

  function handleContinue() {
    setOnboarding({ index: 1 })
  }

  return (
    <OnboardingBox
      title="Welcome to the Highlight Editor"
      line1={`The Highlight editor is designed to help you write shortcuts to create any kind of AI app you can imagine.`}
      line2={`Think of shortcuts as instructions for Highlight to think, act, and behave however you want it to.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex1() {
  const { setOnboarding, setPromptEditorData } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing shortcuts. }}\nSummarize my meeting notes`,
    })
  }, [])

  function handleContinue() {
    setOnboarding({ index: 2 })
  }

  return (
    <OnboardingBox
      title="Shortcuts are easy to create"
      line1={`Shortcuts can be as simple as a short sentence. In the example above, we’ve written an shortcut for summarizing meeting notes.`}
      line2={`This shortcut is instructing Highlight to take the meeting notes you give it and summarize it for you.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex2() {
  const { setOnboarding, setPromptEditorData } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing shortcuts. }}\nSummarize my meeting notes and list out all decisions and shortcut items as a bullet list`,
    })
  }, [])

  function handleContinue() {
    setOnboarding({ index: 3 })
  }

  return (
    <OnboardingBox
      title="The key is to be as specific as possible"
      line1={`The most important thing to remember is to include the details. Highlight is super smart -- but it can’t read your mind just yet 😉`}
      line2={`You’ll notice in the example above we’ve added some details to the shortcut for Highlight to format the meeting notes in a specific way.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex3() {
  const { setOnboarding, setPromptEditorData, setSelectedScreen } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing shortcuts. }}\nSummarize my meeting notes using the audio and/or clipboard text that is provided.\nList out all decisions and shortcut items as a bullet list.`,
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
      title="Add context to give your shortcuts superpowers"
      line1={`With Highlight, you’re able to include context in your shortcuts so that Highlight can understand what you’re talking about. `}
      line2={`In our example, we’ve now updated the shortcut to use any audio or text from our clipboard that is provided to generate the summary.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function ToggleSwitch({ checked, onToggle }: { checked: boolean; onToggle: (checked: boolean) => void }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="text-right text-xs font-normal leading-snug text-white/40">{checked ? 'ON' : 'OFF'}</div>
      <Switch checked={checked} color={'cyan'} onChange={onToggle} />
    </div>
  )
}

export function IntegrationToggle({
  checked,
  onToggle,
  title,
  description,
  icon,
}: {
  icon: React.ReactNode
  checked: boolean
  onToggle: (checked: boolean) => void
  title: string
  description: string
}) {
  return (
    <div className="mt-[29px] flex flex-col space-y-3 rounded-2xl bg-[#222222] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="overflow-clip rounded-[6px]">{icon}</div>
          <h4 className="text-[13px] font-medium leading-normal text-[#eeeeee]">{title}</h4>
        </div>
        <ToggleSwitch checked={checked} onToggle={onToggle} />
      </div>
      <div className="border-t border-white/5" />
      <p className="text-xs font-normal leading-tight text-[#6e6e6e]">{description}</p>
    </div>
  )
}

export default function AppScreen() {
  const { promptEditorData, setPromptEditorData, onboarding, editorMode, setEditorMode, setSelectedScreen } =
    usePromptEditorStore()

  const toggleEditorMode = () => {
    if (editorMode === 'simple') {
      setEditorMode('advanced')
      setSelectedScreen('app')
    } else {
      setEditorMode('simple')
      setSelectedScreen('simplified-app')
    }
  }

  return (
    <>
      <div className="flex h-full justify-between">
        <div className="flex-1">
          <span className={onboarding.isOnboarding && onboarding.index === 0 ? styles.onboardingBlock : ''}>
            <IntelliPrompt value={promptEditorData.appPrompt} onChange={(e) => setPromptEditorData({ appPrompt: e })} />
          </span>
        </div>

        <div className="max-w-96 basis-1/3 border-l border-[#ffffff0d] p-[17px] overflow-y-auto h-full">
          <div className="mb-4">
            <Button onClick={toggleEditorMode} size="small" variant="tertiary">
              Switch to {editorMode === 'simple' ? 'Advanced' : 'Simple'} Editor
            </Button>
          </div>
          <div>
            <div className="flex flex-col space-y-[6px]">
              <h3 className="text-base font-semibold text-white">Automations</h3>
              <p className="text-xs font-normal leading-tight text-[#6e6e6e]">
                Add automations to your shortcuts to allow Highlight to do things for you.
              </p>
            </div>
            <IntegrationToggle
              icon={<LinearIcon />}
              checked={promptEditorData.enabledAutomations?.createLinearIssue || false}
              onToggle={(checked) => {
                setPromptEditorData({
                  enabledAutomations: {
                    ...promptEditorData.enabledAutomations,
                    createLinearIssue: checked,
                  },
                })
              }}
              title="Create Linear Issue"
              description="Create a Linear issue using the prompt output"
            />

            <IntegrationToggle
              icon={<NotionIcon />}
              checked={promptEditorData.enabledAutomations?.createNotionPage || false}
              onToggle={(checked) => {
                setPromptEditorData({
                  enabledAutomations: {
                    ...promptEditorData.enabledAutomations,
                    createNotionPage: checked,
                  },
                })
              }}
              title="Create Notion Page"
              description="Create a Notion page using the prompt output"
            />
          </div>
          {(isDevelopment || isAlpha) && (
            <>
              <div className="flex flex-col space-y-[6px] mt-8">
                <AppSelector shortcutName={promptEditorData.name} />
              </div>
              <div className="flex flex-col space-y-[6px] mt-8 mb-32">
                <ContextSelector />
              </div>
            </>
          )}
        </div>
      </div>
      {onboarding.isOnboarding && onboarding.index === 0 && <OnboardingIndex0 />}
      {onboarding.isOnboarding && onboarding.index === 1 && <OnboardingIndex1 />}
      {onboarding.isOnboarding && onboarding.index === 2 && <OnboardingIndex2 />}
      {onboarding.isOnboarding && onboarding.index === 3 && <OnboardingIndex3 />}
    </>
  )
}
