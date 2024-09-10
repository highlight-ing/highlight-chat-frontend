import { Squircle } from '@squircle-js/react'
import styles from './prompteditor.module.scss'
import { EmojiHappy, Personalcard, Setting, User } from 'iconsax-react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { APP_PROMPT_COMMENT } from '@/types'

function TemplateCard({
  title,
  description,
  icon,
  color,
  onClick,
  size,
}: {
  title: string
  description: string
  icon: React.ReactNode
  color: 'purple' | 'blue' | 'pink' | 'default'
  onClick?: () => void
  size?: 'small' | 'large'
}) {
  return (
    <Squircle
      cornerRadius={size === 'small' ? 16 : 32}
      cornerSmoothing={1}
      className={`${styles.templateCard} ${styles[color]} ${size ? styles[size] : ''}`}
      onClick={onClick}
    >
      <div className={'flex-shrink-0'}>{icon}</div>
      <div className={size === 'small' ? 'flex h-fit flex-col text-left' : ''}>
        <h6>{title}</h6>
        <p>{description}</p>
      </div>
    </Squircle>
  )
}

export default function TemplateSelectorBox({ size }: { size?: 'small' | 'large' }) {
  const { setSelectedScreen, setPromptEditorData, setOnboarding } = usePromptEditorStore()

  function onSelectTemplate(template: string) {
    setOnboarding({ isOnboarding: false, index: 0 })
    setSelectedScreen('app')

    switch (template) {
      case 'code-reviewer':
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a code reviewer. You will review code and provide suggestions for improvements. Use the screen data to help the user with their code.',
        })
        break
      case 'review-responder':
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are a review responder. You will respond to reviews and comments on your app. You will also provide suggestions for improvements.',
        })
        break
      case 'elon-musk':
        setPromptEditorData({
          appPrompt:
            APP_PROMPT_COMMENT +
            'You are Elon Musk. You are a visionary entrepreneur and CEO of SpaceX and Tesla. You are known for your outspoken personality and innovative ideas. You are also known for your philanthropy, donating to various causes and organizations.',
        })
        break
      case 'custom':
        setPromptEditorData({
          appPrompt: APP_PROMPT_COMMENT,
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
        size={size}
      />
      <TemplateCard
        title="Review Responder"
        description="Make the ultimate companion to help you get things done"
        icon={<Personalcard variant="Bold" color="#00F0FF" />}
        color="blue"
        onClick={() => onSelectTemplate('review-responder')}
        size={size}
      />
      <TemplateCard
        title="Elon Musk"
        description="Bring your imagination to life with an AI you can talk to"
        icon={<EmojiHappy variant="Bold" color="#FF2099" />}
        color="pink"
        onClick={() => onSelectTemplate('elon-musk')}
        size={size}
      />
      <TemplateCard
        title="Custom"
        description="Start from scratch"
        icon={<Setting variant="Bold" />}
        color="default"
        onClick={() => onSelectTemplate('custom')}
        size={size}
      />
    </div>
  )
}
