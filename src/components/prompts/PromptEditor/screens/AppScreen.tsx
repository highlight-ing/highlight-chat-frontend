import { usePromptEditorStore } from '@/stores/prompt-editor'
import IntelliPrompt from '../IntelliPrompt'
import styles from '../prompteditor.module.scss'
import { useEffect } from 'react'
import OnboardingBox from '../OnboardingBox'
import { Switch } from '@/components/catalyst/switch'
import { LinearIcon } from '@/icons/icons'

function OnboardingIndex0() {
  const { setOnboarding } = usePromptEditorStore()

  function handleContinue() {
    setOnboarding({ index: 1 })
  }

  return (
    <OnboardingBox
      title="Welcome to the Highlight Editor"
      line1={`The Highlight editor is designed to help you write actions to create any kind of AI app you can imagine.`}
      line2={`Think of actions as instructions for Highlight to think, act, and behave however you want it to.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex1() {
  const { setOnboarding, setPromptEditorData } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing actions. }}\nSummarize my meeting notes`,
    })
  }, [])

  function handleContinue() {
    setOnboarding({ index: 2 })
  }

  return (
    <OnboardingBox
      title="Actions are easy to create"
      line1={`Actions can be as simple as a short sentence. In the example above, we’ve written an action for summarizing meeting notes.`}
      line2={`This action is instructing Highlight to take the meeting notes you give it and summarize it for you.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex2() {
  const { setOnboarding, setPromptEditorData } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing actions. }}\nSummarize my meeting notes and list out all decisions and action items as a bullet list`,
    })
  }, [])

  function handleContinue() {
    setOnboarding({ index: 3 })
  }

  return (
    <OnboardingBox
      title="The key is to be as specific as possible"
      line1={`The most important thing to remember is to include the details. Highlight is super smart -- but it can’t read your mind just yet 😉`}
      line2={`You’ll notice in the example above we’ve added some details to the action for Highlight to format the meeting notes in a specific way.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

function OnboardingIndex3() {
  const { setOnboarding, setPromptEditorData, setSelectedScreen } = usePromptEditorStore()

  useEffect(() => {
    setPromptEditorData({
      appPrompt: `{{! These are comments, they won't effect the output of your app }}\n{{! Some tips for writing actions. }}\nSummarize my meeting notes using the audio and/or clipboard text that is provided.\nList out all decisions and action items as a bullet list.`,
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
      title="Add context to give your actions superpowers"
      line1={`With Highlight, you’re able to include context in your actions so that Highlight can understand what you’re talking about. `}
      line2={`In our example, we’ve now updated the action to use any audio or text from our clipboard that is provided to generate the summary.`}
      buttonText="Continue"
      onClick={handleContinue}
    />
  )
}

export default function AppScreen() {
  const { promptEditorData, setPromptEditorData, onboarding } = usePromptEditorStore()

  return (
    <>
      <div className="flex h-full justify-between">
        <div className="flex-1">
          <span className={onboarding.isOnboarding && onboarding.index === 0 ? styles.onboardingBlock : ''}>
            <IntelliPrompt value={promptEditorData.appPrompt} onChange={(e) => setPromptEditorData({ appPrompt: e })} />
          </span>
        </div>

        <div className="max-w-96 basis-1/3 p-[17px]">
          <h3 className="text-base font-semibold text-white">Automations</h3>
          <p className="text-xs font-normal leading-tight text-[#6e6e6e]">
            Add automations to your actions to allow Highlight to do things for you.
          </p>
          <div className="inline-flex h-[87px] w-[323px] flex-col items-start justify-start gap-3 rounded-2xl bg-[#222222] p-3">
            <div className="inline-flex h-6 items-start justify-between self-stretch">
              <div className="flex items-center justify-start pr-[69px]">
                <div className="inline-flex items-center justify-start gap-2 self-stretch">
                  <div className="flex h-6 w-6 items-center justify-center">
                    <LinearIcon />
                  </div>
                  <div className="text-[13px] font-medium leading-normal text-[#eeeeee]">Create Linear Issue</div>
                </div>
              </div>
              <div className="flex items-center justify-start gap-2">
                <div className="flex h-[26px] items-center justify-end gap-1.5">
                  <Switch color={'cyan'} disabled={false} />
                </div>
              </div>
            </div>
            <div className="inline-flex items-center justify-start gap-2.5 self-stretch border-t border-white/0 pt-2">
              <div className="shrink grow basis-0 text-xs font-normal leading-tight text-[#6e6e6e]">
                Allows your action to create a Linear issue on behalf of the user.
              </div>
            </div>
          </div>
        </div>
      </div>
      {onboarding.isOnboarding && onboarding.index === 0 && <OnboardingIndex0 />}
      {onboarding.isOnboarding && onboarding.index === 1 && <OnboardingIndex1 />}
      {onboarding.isOnboarding && onboarding.index === 2 && <OnboardingIndex2 />}
      {onboarding.isOnboarding && onboarding.index === 3 && <OnboardingIndex3 />}
    </>
  )
}
