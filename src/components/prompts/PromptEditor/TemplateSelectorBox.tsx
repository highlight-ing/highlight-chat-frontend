import { Squircle } from '@squircle-js/react'
import styles from './prompteditor.module.scss'
import { EmojiHappy, Personalcard, Setting, User } from 'iconsax-react'
import { usePromptEditorStore } from '@/stores/prompt-editor'

function TemplateCard({
  title,
  description,
  icon,
  color,
  onClick,
}: {
  title: string
  description: string
  icon: React.ReactNode
  color: 'purple' | 'blue' | 'pink' | 'default'
  onClick?: () => void
}) {
  return (
    <Squircle
      cornerRadius={32}
      cornerSmoothing={1}
      className={`${styles.templateCard} ${styles[color]}`}
      onClick={onClick}
    >
      {icon}
      <h6>{title}</h6>
      <p>{description}</p>
    </Squircle>
  )
}

const APP_PROMPT_COMMENT =
  "{{! These are comments, they won't effect the output of your app }}\n{{! The app prompt determines how your app will behave to the user. }}\n"

/**
 * Comment that gets appended to all prompts
 */
const SUGGESTIONS_PROMPT_COMMENT =
  '{{! Write a prompt that explains how your app can help the user provided the context }}\n'

export default function TemplateSelectorBox() {
  const { setSelectedScreen, setPromptEditorData, setOnboarding } = usePromptEditorStore()

  function onSelectTemplate(template: string) {
    setOnboarding({ isOnboarding: false, index: 0 })
    setSelectedScreen('app')

    switch (template) {
      case 'code-reviewer':
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a code reviewer. You will review code and provide suggestions for improvements. Use the screen data {{screen}} to help the user with their code.',
          suggestionsPrompt:
            SUGGESTIONS_PROMPT_COMMENT +
            'Using this screen data: {{screen}}, offer suggestions for ways to improve the code.',
        })
        break
      case 'review-responder':
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a review responder. You will respond to reviews and comments on your app. You will also provide suggestions for improvements.',
          suggestionsPrompt:
            SUGGESTIONS_PROMPT_COMMENT +
            'Using this screen data: {{screen}}, attempt to find reviews and generate the list of suggestions using them.',
        })
        break
      case 'elon-musk':
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are Elon Musk. You are a visionary entrepreneur and CEO of SpaceX and Tesla. You are k nown for your outspoken personality and innovative ideas. You are also known for your philanthropy, donating to various causes and organizations.',
          suggestionsPrompt:
            SUGGESTIONS_PROMPT_COMMENT +
            'Using the data provided, write suggestions that Elon Musk might make: {{screen}}\n{{audio}} ',
        })
        break
      case 'custom':
        setPromptEditorData({
          appPrompt: APP_PROMPT_COMMENT,
          suggestionsPrompt: SUGGESTIONS_PROMPT_COMMENT,
        })
        break
    }
  }

  return (
    <div className={styles.templateCardGrid}>
      <TemplateCard
        title="Code Reviewer"
        description="Create any kind of personality to have conversations with"
        icon={<User variant="Bold" color="#712FFF" />}
        color="purple"
        onClick={() => onSelectTemplate('code-reviewer')}
      />
      <TemplateCard
        title="Review Responder"
        description="Make the ultimate companion to help you get things done"
        icon={<Personalcard variant="Bold" color="#00F0FF" />}
        color="blue"
        onClick={() => onSelectTemplate('review-responder')}
      />
      <TemplateCard
        title="Elon Musk"
        description="Bring your imagination to life with an AI you can talk to"
        icon={<EmojiHappy variant="Bold" color="#FF2099" />}
        color="pink"
        onClick={() => onSelectTemplate('elon-musk')}
      />
      <TemplateCard
        title="Custom"
        description="Start from scratch"
        icon={<Setting variant="Bold" />}
        color="default"
        onClick={() => onSelectTemplate('custom')}
      />
    </div>
  )
}
