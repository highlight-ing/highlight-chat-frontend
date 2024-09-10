import { useState } from 'react'
import { Prompt } from '@/types/supabase-helpers'
import styles from './prompt-copy.module.scss'
import { getPromptAppType } from '@/lib/promptapps'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import { MessageText, ArrowUp2, ArrowDown2 } from 'iconsax-react'
import { Badge } from '@/components/Badge/Badge'
import IntelliPrompt from '@/components/prompts/PromptEditor/IntelliPrompt'

export function PromptCopyDetails({ prompt }: { prompt: Prompt }) {
  const [isAppPromptOpen, setIsAppPromptOpen] = useState(false)
  const promptType = getPromptAppType(prompt.user_id, prompt)

  console.log('prompt', prompt)

  return (
    <div className={`${styles.chatHeader}`}>
      <div className={`${styles.promptIcon} ${styles[promptType]}`}>
        {prompt.image && prompt.user_images?.file_extension ? (
          <PromptAppIcon
            width={150}
            height={150}
            className={styles.promptIcon}
            imageId={prompt.image!}
            imageExtension={prompt.user_images?.file_extension ?? ''}
          />
        ) : (
          <MessageText variant={'Bold'} size={36} />
        )}
      </div>
      <div className="flex max-w-screen-sm flex-col items-center justify-center gap-0.5 text-center">
        <span className={styles.promptName}>{prompt.name}</span>
        <span className={styles.promptDescription}>{prompt.description}</span>
      </div>
      <div className={styles.promptTags}>
        {prompt.tags &&
          prompt.tags.length > 0 &&
          prompt.tags.map((tag, index) => (
            <Badge key={index - 1} variant="disabled">
              {/* TODO(umut): Fix this */}
              {/* @ts-ignore */}
              {tag.label}
            </Badge>
          ))}
      </div>

      <div className={styles.appPromptAccordion}>
        <button className={styles.accordionHeader} onClick={() => setIsAppPromptOpen(!isAppPromptOpen)}>
          <span className="font-bold">App Prompt</span>
          {isAppPromptOpen ? <ArrowUp2 size={20} /> : <ArrowDown2 size={20} />}
        </button>
        {isAppPromptOpen && (
          <div className={styles.accordionContent}>
            <IntelliPrompt value={prompt.prompt_text ?? ''} hideControls={true} />
          </div>
        )}
      </div>
    </div>
  )
}
