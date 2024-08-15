import { usePromptEditorStore } from '@/stores/prompt-editor'
import clsx from 'clsx'
import { EmojiHappy, Personalcard, Setting, User } from 'iconsax-react'

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
  color: 'purple' | 'blue' | 'pink' | 'inherit'
  onClick?: () => void
}) {
  return (
    <div
      className={clsx(
        `flex flex-col items-center rounded-3xl px-2.5 py-4 text-center text-white hover:cursor-pointer`,
        'transition-all duration-150',
        'basis-1/4',
        color === 'inherit' && 'border border-light-10',
        color === 'purple' && 'bg-[#712FFF]/20 hover:bg-[#712FFF]/30',
        color === 'blue' && 'bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30',
        color === 'pink' && 'bg-[#FF2099]/20 hover:bg-[#FF2099]/30',
      )}
      onClick={onClick}
    >
      <div>{icon}</div>
      <h6 className="mt-2 text-[16px]/[20px]">{title}</h6>
      <p className="text-[13px]/[20px] font-[350]">{description}</p>
    </div>
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
    <>
      <h4 className="font-medium text-white">Start with a template</h4>
      <div className="mt-8 flex gap-3">
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
          color="inherit"
          onClick={() => onSelectTemplate('custom')}
        />
      </div>
    </>
  )
}
