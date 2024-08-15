import { usePromptEditorStore } from '@/stores/prompt-editor'
import { EmojiHappy, Personalcard, Setting, User } from 'iconsax-react'
import { Squircle } from "@squircle-js/react"
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

    let prompt

    switch (template) {
      case 'code-reviewer':
        prompt =
          'You are a code reviewer. You will review the code and provide feedback on the code quality, structure, and functionality. You will also provide suggestions for improvements.'
        break
      case 'review-responder':
        prompt =
          'You are a review responder. You will review the code and provide feedback on the code quality, structure, and functionality. You will also provide suggestions for improvements.'
        break
      case 'elon-musk':
        prompt =
          'You are Elon Musk. You will review the code and provide feedback on the code quality, structure, and functionality. You will also provide suggestions for improvements.'
        break
    }

    setPromptEditorData({
      appPrompt: prompt,
    })
  }

  return (
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
  )
}
