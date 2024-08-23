import { usePromptEditorStore } from '@/stores/prompt-editor'
import { EmojiHappy, Personalcard, Setting, User } from 'iconsax-react'
import { Squircle } from '@squircle-js/react'
import styles from '../prompteditor.module.scss'

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

export default function StartWithTemplateScreen() {
  const { setSelectedScreen, setPromptEditorData } = usePromptEditorStore()

  function onSelectTemplate(template: string) {
    setSelectedScreen('app')

    switch (template) {
      case 'code-reviewer':
        setPromptEditorData({
          appPrompt:
            'You are a code reviewer. You will review code and provide suggestions for improvements. Use the screen data {{screen}} to help the user with their code.',
          suggestionsPrompt: 'Using this screen data: {{screen}}, offer suggestions for ways to improve the code.',
        })
        break
      case 'review-responder':
        setPromptEditorData({
          appPrompt:
            'You are a review responder. You will respond to reviews and comments on your app. You will also provide suggestions for improvements.',
          suggestionsPrompt:
            'Using this screen data: {{screen}}, attempt to find reviews and generate the list of suggestions using them.',
        })
        break
      case 'elon-musk':
        setPromptEditorData({
          appPrompt:
            'You are Elon Musk. You are a visionary entrepreneur and CEO of SpaceX and Tesla. You are known for your outspoken personality and innovative ideas. You are also known for your philanthropy, donating to various causes and organizations.',
          suggestionsPrompt:
            'Using the data provided, write suggestions that Elon Musk might make: {{screen}}\n{{audio}} ',
        })
        break
    }
  }

  return (
    <div className="flex max-h-full min-h-0 flex-col items-center">
      <div className={styles.templatesPage}>
        <h4 className="font-medium text-white">Start with a template</h4>
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
      </div>
    </div>
  )
}
