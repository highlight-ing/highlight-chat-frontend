import { usePromptEditorStore } from '@/stores/prompt-editor'
import styles from './prompteditor.module.scss'
import Button from '@/components/Button/Button'

export default function OnboardingBox({
  title,
  line1,
  line2,
  buttonText,
  onClick,
  bottomComponent,
}: {
  title: string
  line1?: string
  line2?: string
  buttonText: string
  onClick?: () => void
  bottomComponent?: React.ReactNode
}) {
  const { onboarding } = usePromptEditorStore()

  return (
    <div className="absolute bottom-0 h-1/2 w-full overflow-y-auto border-t border-[#FFFFFF] border-opacity-10 bg-[#222222] px-[28px] py-[33px]">
      <h2 className={styles.headingText}>{title}</h2>
      {line1 && <p className={styles.explainerText}>{line1}</p>}
      {line2 && <p className={styles.explainerText}>{line2}</p>}
      {bottomComponent ?? (
        <div className={styles.buttonContainer}>
          <Button size="large" variant="accent" onClick={onClick}>
            {buttonText}
          </Button>
        </div>
      )}
      {onboarding.index !== 4 && (
        <div className="absolute bottom-[33px] flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={`h-[8px] w-[8px] rounded-full ${index === onboarding.index ? 'bg-[#EEEEEE]' : 'bg-[#3A3A3A]'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
